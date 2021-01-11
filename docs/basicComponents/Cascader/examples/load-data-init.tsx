/**
title: 带默认值动态加载数据
desc: 使用 loadData、needFillData 实现动态加载选项，并且能初始化默认值。
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
const onLoadTopData = () => {
  return fakeRequest({
    value: [
      {
        value: 'zhejiang',
        label: '浙江',
        isLeaf: false,
      },
    ],
  });
};
const handleFinish = (values: any) => {
  alert(JSON.stringify(values));
};
export default () => (
  <Form
    onFinish={handleFinish}
    initialValues={{
      area1: ['zhejiang', 'zhejiang1', 'zhejiang2', 'zhejiang3'],
    }}
  >
    <Form.Item label="区域选择" name="area1">
      <Cascader
        loadData={onLoadData}
        loadTopData={onLoadTopData}
        needFillData={true}
      />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit">提交</Button>
    </Form.Item>
  </Form>
);
