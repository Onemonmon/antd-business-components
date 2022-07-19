/**
title: 大文件上传
*/

import React from 'react';
import { Form, Button } from 'antd';
import { Upload } from 'antd-business-components';
import 'antd/dist/antd.css';

const handleFinish = (values: any) => {
  alert(JSON.stringify(values));
};
const Demo = () => <Upload />;

export default Demo;
