/**
title: 回填初始值
desc: 回填初始值
*/

import React from 'react';
import { SkuChoose } from 'antd-business-components';
import 'antd/dist/antd.css';

type SpecType = { specName: string; specValueList: string[] };
type SkuType = {
  pos: string;
  specList: string[];
  stockNum?: number;
  price?: number;
};
// 规格列表
const specList: SpecType[] = [
  { specName: '颜色', specValueList: ['红色', '黄色', '蓝色', '绿色'] },
  { specName: '尺寸', specValueList: ['小', '中', '大'] },
  { specName: '材质', specValueList: ['纯棉', '90%棉'] },
  { specName: '批发地', specValueList: ['广东', '福建'] },
];

const createSkuList: (specList: SpecType[]) => SkuType[] = (
  specList: SpecType[],
) => {
  if (specList.length === 1) {
    // 只有一个时直接返回
    return [
      {
        pos: '0',
        specList: specList[0].specValueList,
        stockNum: Math.floor(Math.random() * 10),
        price: Math.floor((Math.random() + 1) * 100),
      },
    ];
  }
  let res: SkuType[] = [];
  for (let i = 1; i < specList.length; i++) {
    if (i === 1) {
      res = combSpecs(specList[0], specList[i]);
    } else {
      res = combSpecAndSku(res, specList[i]);
    }
  }
  return res;
};
const combSpecs = (spec1: SpecType, spec2: SpecType) => {
  const res: SkuType[] = [];
  spec1.specValueList.forEach((n, i) => {
    spec2.specValueList.forEach((m, j) => {
      const item: SkuType = {
        pos: `${i}-${j}`,
        specList: [n, m],
        stockNum: Math.floor(Math.random() * 10),
        price: Math.floor((Math.random() + 1) * 100),
      };
      res.push(item);
    });
  });
  return res;
};
const combSpecAndSku = (skus: SkuType[], spec: SpecType) => {
  let res: SkuType[] = [];
  skus.forEach(n => {
    res = res.concat(
      spec.specValueList.map((m, j) => ({
        pos: `${n.pos}-${j}`,
        specList: [...n.specList, m],
        stockNum: Math.floor(Math.random() * 10),
        price: Math.floor((Math.random() + 1) * 100),
      })),
    );
  });
  return res;
};
// 规格组列表
const skuList = createSkuList(specList);

const _skuList = skuList.filter(n => n.stockNum);
const index = Math.floor(Math.random() * _skuList.length);

const Demo = () => (
  <SkuChoose
    specList={specList}
    skuList={skuList}
    initialValues={_skuList[index]}
  ></SkuChoose>
);

export default Demo;
