import request from '../../utils/request';
import SparkMD5 from 'spark-md5';
import { message } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { FileChunkType } from './type';

/**
 * 获取文件名、扩展名
 */
export const getFileInfo = (rawFilename: string) => {
  const extIndex = rawFilename.lastIndexOf('.');
  const filename = rawFilename.slice(0, extIndex);
  const ext = rawFilename.slice(extIndex);
  return { filename, ext };
};

/**
 * 分割文件
 */
export const splitFileToChunks = async (file: RcFile, splitSize: number) => {
  const fileSize = file.size;
  const fileChunks: FileChunkType[] = [];
  let curSize = 0;
  let index = 0;
  while (curSize < fileSize) {
    // Blob.prototype.slice 对文件进行切片
    const chunk = file.slice(curSize, curSize + splitSize);
    fileChunks.push({
      id: `${Math.floor(Math.random() * 100000)}`,
      filename: file.name,
      chunk,
      hash: '',
      index,
      size: chunk.size,
      percentage: 0,
    });
    index++;
    curSize += splitSize;
  }
  // 获取文件hash值
  const hash = await getFileHash(fileChunks);
  // 文件扩展名
  const { filename, ext } = getFileInfo(file.name);
  // 判断服务端hash值是否存在
  const res = await validHash(filename, hash, ext);
  if (!res.shouldUpload) {
    // 秒传，假弹框
    message.success('上传成功');
    return Promise.reject();
  }
  fileChunks.forEach((n, i) => {
    n.hash = hash;
    n.percentage = res.uploadedChunks.includes(hash + '-' + i) ? 100 : 0;
  });
  return fileChunks;
};

/**
 * 通过hash校验文件是否存在
 */
export const validHash = async (filename: string, hash: string, ext: string) => {
  const res = await request({
    url: 'http://localhost:3000/valid',
    data: JSON.stringify({ filename, hash, ext }),
    headers: { 'content-type': 'application/json' },
  });
  if (res.code === 200) {
    return res.data;
  }
};

/**
 * 计算切片的hash
 */
export const getFileHash = async (fileChunks: FileChunkType[]) => {
  const spark = new SparkMD5();
  await Promise.all(
    fileChunks.map(
      (n) =>
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(n.chunk);
          reader.onload = (e: any) => {
            spark.append(e.target.result);
            resolve();
          };
        }),
    ),
  );
  return spark.end();
};

/**
 * 合并切片
 */
export const mergeChunks = (filename: string, ext: string, fileHash: string, size: number) =>
  request({
    url: 'http://localhost:3000/merge',
    data: JSON.stringify({ filename, ext, fileHash, size }),
    headers: { 'content-type': 'application/json' },
  });

/**
 * 获取已上传的文件
 */
export const getUploadedFiles = async () => {
  const res = await request({ url: 'http://localhost:3000/uploaded', method: 'get' });
  if (res.code === 200) {
    return res.data;
  }
};

/**
 * 清除已上传的文件
 */
export const clearUploadedFiles = async () => await request({ url: 'http://localhost:3000/clear' });

/**
 * 删除文件
 */
export const removeFile = async (id: string) =>
  await request({
    url: 'http://localhost:3000/remove',
    data: JSON.stringify({ id }),
    headers: { 'content-type': 'application/json' },
  });
