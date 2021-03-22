---
group:
  title: 组件
  path: /
---

# SkuChoose 规格选择

规格选择。

## 何时使用

- 商品有各种规格，用户可以搭配选择时

## 代码示例

<code src="./examples/basic.tsx" />
<code src="./examples/auto-choose.tsx" />
<code src="./examples/initial-values.tsx" />

## API

| 参数          | 说明                               | 类型       | 默认值         |
| ------------- | ---------------------------------- | ---------- | -------------- |
| specList      | 规格列表                           | SpecType[] | []             |
| skuList       | 规格组                             | SkuType[]  | []             |
| limitStockNum | disabled 生效时的库存数            | number     | 0              |
| autoChoose    | 自动选择第一组库存符合条件的规格组 | boolean    | false          |
| initialValues | 初始值                             | SkuType    | -              |
| prefixCls     | 自定义类名前缀                     | string     | one-sku-choose |
| className     | 自定义类名                         | string     | -              |
