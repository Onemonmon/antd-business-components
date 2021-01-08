---
nav:
  title: Components
  path: /components
---

## Cascader 级联选择

级联选择框。

#### 何时使用

- 需要从一组相关联的数据集合进行选择，例如省市区，公司层级，事物分类等。

- 从一个较大的数据集合中进行选择时，用多级分类进行分隔，方便选择。

- 比起 Select 组件，可以在同一个浮层中完成选择，有较好的体验。

```tsx
import React from 'react';
import { Cascader } from 'antd-business-components';

let index = 0;
const fakeRequest = data =>
  new Promise(res => setTimeout(() => res(data), 500));
const onLoadData = code => {
  index++;
  return fakeRequest({
    value: [
      {
        value: 'zhejiang' + index,
        label: '浙江' + index,
        isLeaf: index > 3 ? true : false,
      },
      {
        value: 'jiangsu' + index,
        label: '江苏' + index,
        isLeaf: index > 3 ? true : false,
      },
    ],
  });
};
const onLoadTopData = () => {
  index = 0;
  return fakeRequest({
    value: [
      {
        value: 'zhejiang',
        label: '浙江',
        isLeaf: false,
      },
      {
        value: 'jiangsu',
        label: '江苏',
        isLeaf: false,
      },
    ],
  });
};

export default () => (
  <Cascader loadData={onLoadData} loadTopData={onLoadTopData} />
);
```
