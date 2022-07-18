/**
title: 带默认值动态加载数据
desc: 使用 loadData、needFillData 实现动态加载选项，并且能初始化默认值。
*/

import React from 'react';
import { Form, Button } from 'antd';
import { Upload } from 'antd-business-components';
import 'antd/dist/antd.css';

const handleFinish = (values: any) => {
  alert(JSON.stringify(values));
};
const Demo = () => (
  <Form onFinish={handleFinish} initialValues={{}}>
    <Form.Item label="文件上传" name="image">
      <Upload />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit">提交</Button>
    </Form.Item>
  </Form>
);

export default Demo;
