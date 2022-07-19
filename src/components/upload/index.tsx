/**
 * 大文件上传、断点续传
 */
import React, { useEffect, useState } from 'react';
import { Button, message, Progress, Table, Upload as AntdUpload, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import request from '../../utils/request';
import Schedule from './request-amount-limit';
import {
  clearUploadedFiles,
  getFileInfo,
  getUploadedFiles,
  mergeChunks,
  removeFile,
  splitFileToChunks,
} from './index';
import type { IUploadProps, FileChunkType } from './type';
import './index.css';

const SIZE = 10240000; // 10MB

// 保存上传请求的列表
const requestList: { key: string; xhr: any }[] = [];
// 限制请求并发数
const requsetSchedule = new Schedule(6);

const Upload = ({ size = SIZE }: IUploadProps) => {
  // 进度条表格
  const columns = [
    {
      title: '文件名称',
      dataIndex: 'filename',
      width: 200,
    },
    {
      title: '文件切片hash',
      dataIndex: 'hash',
      render: (hash: string, record: FileChunkType) => hash + '-' + record.index,
      width: 200,
    },
    {
      title: '大小（MB）',
      dataIndex: 'size',
      render: (size: number) => parseInt(String(size / 1000000)),
      width: 100,
    },
    {
      title: '进度',
      dataIndex: 'percentage',
      render: (percentage: number) => <Progress percent={percentage} />,
      width: 200,
    },
  ];
  // 切片
  const [fileChunks, setFileChunks] = useState<FileChunkType[]>([]);
  // 已上传的文件
  const [fileList, setFileList] = useState<any[]>([]);
  // 阻止默认上传行为，在这里对大文件进行分割
  const beforeUpload = async (file: RcFile) => {
    const res = await splitFileToChunks(file, size);
    setFileChunks(res);
    return Promise.resolve();
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
  // 自定义上传
  const handleCustomRequest = async ({ file, onSuccess, onError }: any) => {
    await uploadChunks();
    // 文件扩展名
    const { filename, ext } = getFileInfo(file.name);
    const fileHash = fileChunks[0].hash;
    // 上传完所有切片后，发送请求通知服务端
    const res = await mergeChunks(filename, ext, fileHash, size);
    // 更新已上传列表
    handleGetUploadedFiles();
    if (res.code === 200) {
      message.success('上传成功');
      onSuccess();
    } else {
      onError();
    }
  };
  const handlePause = () => {
    requestList.forEach(({ xhr }) => xhr.abort());
    requestList.length = 0;
  };
  const handleGetUploadedFiles = async () => {
    const res = await getUploadedFiles();
    setFileList(res);
  };
  const handleClear = async () => {
    await clearUploadedFiles();
    setFileList([]);
  };
  const handleRemove = async (file: any) => {
    const { ext } = getFileInfo(file.name);
    await removeFile(file.uid + ext);
    handleGetUploadedFiles();
  };
  useEffect(() => {
    handleGetUploadedFiles();
  }, []);
  return (
    <>
      <Space direction="vertical">
        <AntdUpload
          fileList={fileList}
          beforeUpload={beforeUpload}
          customRequest={handleCustomRequest}
          onRemove={handleRemove}
        >
          <Button icon={<UploadOutlined />}>点击上传</Button>
        </AntdUpload>
        <Button onClick={handlePause}>暂停上传</Button>
        <Button onClick={handleClear}>清空已上传文件</Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={fileChunks} pagination={false} />
    </>
  );
};

export default Upload;
