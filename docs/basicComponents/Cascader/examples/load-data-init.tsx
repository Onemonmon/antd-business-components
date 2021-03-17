/**
title: 带默认值动态加载数据
desc: 使用 loadData、needFillData 实现动态加载选项，并且能初始化默认值。
*/

import React from 'react';
import { Form, Button } from 'antd';
import { Cascader } from 'antd-business-components';
import 'antd/dist/antd.css';

const fakeRequest = (data: any) =>
  new Promise(res => setTimeout(() => res(data), 500));
const onLoadData = (code: string | number) =>
  fakeRequest({
    value: [
      {
        value: 'quanzhou',
        label: '泉州',
        isLeaf: true,
      },
      {
        value: 'xiamen',
        label: '厦门',
        isLeaf: true,
      },
    ],
  });
const onLoadTopData = () =>
  fakeRequest({
    value: [
      {
        value: 'fujian',
        label: '福建',
        isLeaf: false,
      },
    ],
  });
const handleFinish = (values: any) => {
  alert(JSON.stringify(values));
};
const Demo = () => (
  <Form
    onFinish={handleFinish}
    initialValues={{
      area3: ['fujian', 'quanzhou'],
    }}
  >
    <Form.Item label="区域选择" name="area3">
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

export default Demo;
