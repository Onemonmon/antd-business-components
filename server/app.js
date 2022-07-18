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

app.post('/valid', async (req, res) => {
  const { hash, ext } = req.fields;
  const filePath = path.resolve(__dirname, BIG_FILE_UPLOAD_DIR, hash + '.' + ext);
  const temporaryUploadDir = path.resolve(__dirname, BIG_FILE_TEMPORARY_UPLOAD_DIR, hash);
  console.log(filePath);
  if (fse.existsSync(filePath)) {
    res.send({ code: 200, data: { shouldUpload: false } });
  } else {
    const uploadedChunks = fse.existsSync(temporaryUploadDir)
      ? await fse.readdir(temporaryUploadDir)
      : [];
    res.send({ code: 200, data: { shouldUpload: true, uploadedChunks } });
  }
});

app.post('/upload', async (req, res) => {
  // 文件字段 req.files
  const { chunk } = req.files;
  // 非文件字段 req.fields
  const { hash, index } = req.fields;
  const temporaryUploadDir = path.resolve(__dirname, BIG_FILE_TEMPORARY_UPLOAD_DIR, hash);
  if (!fse.existsSync(temporaryUploadDir)) {
    await fse.mkdirs(temporaryUploadDir);
  }
  await fse.copyFile(chunk.path, `${temporaryUploadDir}/${hash}-${index}`);
  res.send({ code: 200, msg: '上传成功' });
});

app.post('/merge', async (req, res) => {
  const { size, filename } = req.fields;
  const hash = filename.split('.')[0];
  const temporaryUploadDir = path.resolve(__dirname, BIG_FILE_TEMPORARY_UPLOAD_DIR, hash);
  const uploadFilePath = path.resolve(__dirname, BIG_FILE_UPLOAD_DIR, filename);
  // 获取所有切片
  const chunkPaths = await fse.readdir(temporaryUploadDir);
  // 要对切片进行排序
  const sortedChunPaths = chunkPaths.sort((a, b) => {
    return a.split('-')[1] - b.split('-')[1];
  });
  const promiseList = sortedChunPaths.map(
    (n, i) =>
      new Promise((resolve) => {
        // 创建可读流可写流
        const chunkPath = path.resolve(temporaryUploadDir, n);
        const rs = fse.createReadStream(chunkPath);
        // 在指定位置写入流
        const ws = fse.createWriteStream(uploadFilePath, {
          start: i * size,
          end: (i + 1) * size,
        });
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
