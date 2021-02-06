/**
title: 带默认值动态加载数据
desc: 使用 loadData、needFillData 实现动态加载选项，并且能初始化默认值。
*/

import React from 'react';
import { SkuChoose } from 'antd-business-components';
import 'antd/dist/antd.css';

type SpecType = { specName: string; specValueList: string[] };
type SkuType = {
  id: string;
  specList: string[];
  stockNum?: number;
  price?: number;
};
// 规格列表
const specList: SpecType[] = [
  { specName: '颜色', specValueList: ['红色', '黄色', '蓝色', '绿色'] },
  { specName: '尺寸', specValueList: ['小', '中', '大'] },
  { specName: '材质', specValueList: ['纯棉', '90%棉'] },
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
          id: n.id + '' + i1,
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
          id: i0 + '' + i1,
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
