/**
title: 动态加载数据
desc: 使用 loadData 实现动态加载选项。
*/

import React from 'react';
import { Form, Button } from 'antd';
import { Cascader } from 'antd-business-components';
import 'antd/dist/antd.css';

let index = 0;
const fakeRequest = (data: any) =>
  new Promise(res => setTimeout(() => res(data), 500));
const onLoadData = (code: string | number) => {
  index++;
  return fakeRequest({
    value: [
      {
        value: 'zhejiang' + index,
        label: '浙江' + index,
        isLeaf: index >= 3 ? true : false,
      },
    ],
  });
};
const options = [
  {
    value: 'zhejiang',
    label: '浙江',
    isLeaf: false,
  },
];
const handleFinish = (values: any) => {
  alert(JSON.stringify(values));
};
const Demo = () => (
  <Form onFinish={handleFinish}>
    <Form.Item label="区域选择" name="area2">
      <Cascader options={options} loadData={onLoadData} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit">提交</Button>
    </Form.Item>
  </Form>
);

export default Demo;
