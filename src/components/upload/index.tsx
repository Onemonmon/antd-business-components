/**
 * 大文件上传、断点续传
 */
import React, { useState } from 'react';
import { Button, Input, message, Progress, Table, Upload as AntdUpload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import SparkMD5 from 'spark-md5';
import request from '../../utils/request';
import Schedule from './request-amount-limit';

interface IProps {
  size: number; // 切片大小，默认10KB
}
type FileChunkType = {
  chunk: Blob;
  hash: string;
  index: number;
  size: number;
  percentage: number;
};
const SIZE = 10240000; // 10MB

// 保存上传请求的列表
const requestList: { key: string; xhr: any }[] = [];
// 限制请求并发数
const requsetSchedule = new Schedule(6);
const Upload = ({ size = SIZE }: IProps) => {
  // 切片
  const [fileChunks, setFileChunks] = useState<FileChunkType[]>([]);
  // 阻止默认上传行为，在这里对大文件进行分割
  const beforeUpload = async (file: RcFile) => {
    await splitFileToChunks(file);
    return Promise.resolve();
  };
  // 分割大文件
  const splitFileToChunks = async (file: RcFile, splitSize = size) => {
    const fileSize = file.size;
    const fileChunks: FileChunkType[] = [];
    let curSize = 0;
    while (curSize < fileSize) {
      // Blob.prototype.slice 对文件进行切片
      const chunk = file.slice(curSize, curSize + splitSize);
      fileChunks.push({
        chunk,
        hash: '',
        index: 0,
        size: chunk.size,
        percentage: 0,
      });
      curSize += splitSize;
    }
    // 获取文件hash值
    const hash = await getFileHash(fileChunks);
    console.log(hash);

    // 文件扩展名
    const ext = file.name.split('.')[file.name.split('.').length - 1];
    // 判断服务端hash值是否存在
    const res = await validHash(hash, ext);
    if (!res.shouldUpload) {
      // 秒传，假弹框
      message.success('上传成功');
      return Promise.reject();
    }
    fileChunks.forEach((n, i) => {
      n.hash = hash;
      n.index = i;
      n.percentage = res.uploadedChunks.includes(hash + '-' + i) ? 100 : 0;
    });
    setFileChunks(fileChunks);
  };
  const validHash = async (hash: string, ext: string) => {
    const res = await request({
      url: 'http://localhost:3000/valid',
      data: JSON.stringify({ hash, ext }),
      headers: { 'content-type': 'application/json' },
    });
    if (res.code === 200) {
      return res.data;
    }
  };
  // 计算切片的hash
  const getFileHash = async (fileChunks: FileChunkType[]) => {
    const spark = new SparkMD5();
    await Promise.all(
      fileChunks.map(
        (n) =>
          new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(n.chunk);
            reader.onload = (e: any) => {
              console.log(111);

              spark.append(e.target.result);
              resolve();
            };
          }),
      ),
    );
    return spark.end();
  };
  // 上传分割后的小文件
  const uploadChunks = async () => {
    // 只上传未传过的
    const uploadList = fileChunks
      .filter((n) => !n.percentage)
      .map((item) => {
        const formData = new FormData();
        formData.append('chunk', item.chunk);
        formData.append('hash', item.hash);
        formData.append('index', `${item.index}`);
        return request({
          url: 'http://localhost:3000/upload',
          data: formData,
          onProgress: (e: ProgressEvent) => {
            // 每个切片的上传进度
            item.percentage = parseInt(String((e.loaded / e.total) * 100));
            setFileChunks([...fileChunks]);
          },
          requestList,
        });
      });

    await Promise.all(uploadList);
    // await requsetSchedule.addRequest(uploadList);
  };
  // 合并切片
  const mergeChunks = (filename: string) =>
    request({
      url: 'http://localhost:3000/merge',
      data: JSON.stringify({ filename, size }),
      headers: { 'content-type': 'application/json' },
    });
  // 自定义上传
  const handleCustomRequest = async ({ file, onSuccess, onError }: any) => {
    await uploadChunks();
    // 文件扩展名
    const ext = file.name.split('.')[file.name.split('.').length - 1];
    const filename = fileChunks[0].hash + '.' + ext;
    // 上传完所有切片后，发送请求通知服务端
    const res = await mergeChunks(filename);
    if (res.code === 200) {
      message.success('上传成功');
      onSuccess();
    } else {
      onError();
    }
  };
  const handlePause = (e: any) => {
    requestList.forEach(({ xhr }) => xhr.abort());
    requestList.length = 0;
  };
  // 进度条表格
  const columns = [
    {
      title: '文件切片名称',
      dataIndex: 'hash',
      key: 'hash',
      render: (hash: string, record: FileChunkType) => hash + '-' + record.index,
    },
    {
      title: '大小（MB）',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => parseInt(String(size / 1000000)),
    },
    {
      title: '进度',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => <Progress percent={percentage} />,
    },
  ];

  return (
    <div>
      <AntdUpload beforeUpload={beforeUpload} customRequest={handleCustomRequest}>
        <Button icon={<UploadOutlined />}>点击上传</Button>
      </AntdUpload>
      <Button onClick={handlePause}>暂停上传</Button>
      <Table columns={columns} dataSource={fileChunks} pagination={false} />
    </div>
  );
};

export default Upload;
