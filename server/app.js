const express = require('express');
const formidable = require('express-formidable');
const cors = require('cors');
const fse = require('fs-extra');
const path = require('path');

const app = express();

// 解析formData
app.use(formidable());
// 解决跨域
app.use(cors());

// 大文件上传目录
const BIG_FILE_UPLOAD_DIR = 'big-files';
// 大文件临时上传目录
const BIG_FILE_TEMPORARY_UPLOAD_DIR = 'big-files-temporary';
const SPLIT_SYMBOL = '$.$';

const getTemporaryUploadDir = (hash) =>
  path.resolve(__dirname, BIG_FILE_TEMPORARY_UPLOAD_DIR, hash);

// 清空已上传文件
app.post('/clear', async (req, res) => {
  const uploadedFiles = await fse.readdir(path.resolve(__dirname, BIG_FILE_UPLOAD_DIR));
  const promiseList = uploadedFiles.map(
    (n) =>
      new Promise((resolve) => {
        const filePath = path.resolve(__dirname, BIG_FILE_UPLOAD_DIR, n);
        if (fse.existsSync(filePath)) {
          fse.unlink(path.resolve(__dirname, BIG_FILE_UPLOAD_DIR, n)).then(resolve);
        } else {
          resolve();
        }
      }),
  );
  await Promise.all(promiseList);
  res.send({ code: 200, msg: '所有文件已清除' });
});

// 删除文件
app.post('/remove', async (req, res) => {
  const { id } = req.fields;
  const filePath = path.resolve(__dirname, BIG_FILE_UPLOAD_DIR, id);
  if (fse.existsSync(filePath)) {
    await fse.unlink(filePath);
  }
  res.send({ code: 200, msg: '文件已删除' });
});

// 获取已上传文件
app.get('/uploaded', async (req, res) => {
  const uploadedFiles = await fse.readdir(path.resolve(__dirname, BIG_FILE_UPLOAD_DIR));
  const newRes = uploadedFiles.map((n) => {
    const [filename, fileHashAndExt] = n.split(SPLIT_SYMBOL);
    const [fileHash, ext] = fileHashAndExt.split('.');
    return {
      uid: filename + SPLIT_SYMBOL + fileHash,
      name: filename + '.' + ext,
      status: 'done',
    };
  });
  res.send({ code: 200, data: newRes });
});

// 校验文件是否已存在
app.post('/valid', async (req, res) => {
  const { filename, hash, ext } = req.fields;
  const filePath = path.resolve(
    __dirname,
    BIG_FILE_UPLOAD_DIR,
    filename + SPLIT_SYMBOL + hash + ext,
  );
  const temporaryUploadDir = getTemporaryUploadDir(hash);
  if (fse.existsSync(filePath)) {
    res.send({ code: 200, data: { shouldUpload: false } });
  } else {
    const uploadedChunks = fse.existsSync(temporaryUploadDir)
      ? await fse.readdir(temporaryUploadDir)
      : [];
    res.send({ code: 200, data: { shouldUpload: true, uploadedChunks } });
  }
});

// 上传切片
app.post('/upload', async (req, res) => {
  // 文件字段 req.files
  const { chunk } = req.files;
  // 非文件字段 req.fields
  const { hash, index } = req.fields;
  const temporaryUploadDir = getTemporaryUploadDir(hash);
  if (!fse.existsSync(temporaryUploadDir)) {
    await fse.mkdirs(temporaryUploadDir);
  }
  await fse.copyFile(chunk.path, `${temporaryUploadDir}/${hash}-${index}`);
  res.send({ code: 200, msg: '上传成功' });
});

// 合并切片
app.post('/merge', async (req, res) => {
  const { size, filename, ext, fileHash } = req.fields;
  const newFileName = `${filename}${SPLIT_SYMBOL}${fileHash}${ext}`;
  const temporaryUploadDir = getTemporaryUploadDir(fileHash);
  const uploadFilePath = path.resolve(__dirname, BIG_FILE_UPLOAD_DIR, newFileName);
  // 获取所有切片
  const chunkPaths = await fse.readdir(temporaryUploadDir);
  // 要对切片进行排序
  const sortedChunPaths = chunkPaths.sort((a, b) => {
    return Number(a.split('-')[1]) - Number(b.split('-')[1]);
  });
  const promiseList = sortedChunPaths.map(
    (n, i) =>
      new Promise((resolve) => {
        // 创建可读流可写流
        const chunkPath = path.resolve(temporaryUploadDir, n);
        const rs = fse.createReadStream(chunkPath);
        // 在指定位置写入流
        const start = i * size;
        const end = (i + 1) * size;
        const ws = fse.createWriteStream(uploadFilePath, { start, end });
        rs.on('end', () => {
          resolve(chunkPath);
        });
        rs.pipe(ws);
      }),
  );
  const needDeleteChunkPaths = await Promise.all(promiseList);
  // 结束后删除文件
  needDeleteChunkPaths.forEach((n) => fse.unlinkSync(n));
  fse.rmdir(temporaryUploadDir);
  res.send({ code: 200, msg: '合并成功' });
});

app.listen(3000, () => {
  console.log('3000 端口启动');
});
