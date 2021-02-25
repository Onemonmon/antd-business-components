/**
title: 基础使用
desc: 渲染规格列表，并根据规格组校验库存是否有效。
*/

import React from 'react';
import { SkuChoose } from 'antd-business-components';
import 'antd/dist/antd.css';

type SpecType = { specName: string; specId: string; specValueList: string[] };
type SkuType = {
  pos: string;
  specList: string[];
  stockNum?: number;
  price?: number;
};
// 规格列表
const specList: SpecType[] = [
  {
    specName: '颜色',
    specId: '0',
    specValueList: ['红色', '黄色', '蓝色', '绿色'],
  },
  { specName: '尺寸', specId: '1', specValueList: ['小', '中', '大'] },
  { specName: '材质', specId: '2', specValueList: ['纯棉', '90%棉'] },
  { specName: '批发地', specId: '3', specValueList: ['广东', '福建'] },
];

const createSkuList = (specList: SpecType[]) => {
  if (specList.length === 1) {
    return;
  } else {
    let res: SpecType | SkuType[] = specList[0];
    for (let i = 1; i < specList.length; i++) {
      res = combSpec(res, specList[i]);
    }
    return res;
  }
};
const combSpec = (spec1: SpecType | SkuType[], spec2: SpecType) => {
  const res: SkuType[] = [];
  if (Array.isArray(spec1)) {
    spec1.forEach(n => {
      spec2.specValueList.forEach((m, i1) => {
        const item: SkuType = {
          pos: n.pos + '-' + i1,
          specList: [...n.specList, m],
          stockNum: Math.floor(Math.random() * 10),
          price: Math.floor((Math.random() + 1) * 100),
        };
        res.push(item);
      });
    });
  } else {
    spec1.specValueList.forEach((n, i0) => {
      spec2.specValueList.forEach((m, i1) => {
        const item: SkuType = {
          pos: i0 + '-' + i1,
          specList: [n, m],
        };
        res.push(item);
      });
    });
  }
  return res;
};
// 规格组列表
const skuList = createSkuList(specList);

const Demo = () => (
  <SkuChoose specList={specList} skuList={skuList}></SkuChoose>
);

export default Demo;
