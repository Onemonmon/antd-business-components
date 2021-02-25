---
title: Cascader
group:
  title: Cascader 级联选择
---

# Cascader 级联选择

级联选择框。

## 何时使用

- 需要从一组相关联的数据集合进行选择，例如省市区，公司层级，事物分类等。

- 从一个较大的数据集合中进行选择时，用多级分类进行分隔，方便选择。

- 比起 Select 组件，可以在同一个浮层中完成选择，有较好的体验。

## 代码示例

<code src="./examples/load-data.tsx" />
<code src="./examples/load-top-data.tsx" />
<code src="./examples/load-data-init.tsx" />

## API

| 参数                     | 说明                     | 类型                                | 默认值       |
| ------------------------ | ------------------------ | ----------------------------------- | ------------ |
| value                    | 可选项数据源             | string[] \| number[]                | []           |
| options                  | 异步请求数据用的请求函数 | function                            | []           |
| needFillData             | 是否需要回填数据         | boolean                             | false        |
| loadData                 | 用于动态加载选项         | (code: string \| number) => Promise | -            |
| loadTopData              | 用于动态加载第一级选项   | () => Promise                       | -            |
| prefixCls                | 自定义类名前缀           | string                              | one-cascader |
| className                | 自定义类名               | string                              | -            |
| 其他 Cascader 的原生属性 |                          |                                     |              |
