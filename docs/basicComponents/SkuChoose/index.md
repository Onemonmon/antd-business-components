---
title: SkuChoose
group:
  title: SkuChoose 规格选择
---

# SkuChoose 规格选择

规格选择。

## 何时使用

- 商品有各种规格，用户可以搭配选择时

## 代码示例

<code src="./examples/basic.tsx" />

## API

| 参数          | 说明              | 类型       | 默认值         |
| ------------- | ----------------- | ---------- | -------------- |
| specList      | 规格列表          | SpecType[] | []             |
| skuList       | 规格组            | SkuType[]  | []             |
| limitStockNum | disabled 库存界限 | number     | 0              |
| prefixCls     | 自定义类名前缀    | string     | one-sku-choose |
| className     | 自定义类名        | string     | -              |
