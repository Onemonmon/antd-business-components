---
title: Cascader
group:
  title: 基础组件
---

# Cascader 级联选择

级联选择框。

## 何时使用

- 需要从一组相关联的数据集合进行选择，例如省市区，公司层级，事物分类等。

- 从一个较大的数据集合中进行选择时，用多级分类进行分隔，方便选择。

- 比起 Select 组件，可以在同一个浮层中完成选择，有较好的体验。

## 代码示例

<code src="./examples/load-data.tsx" />
<code src="./examples/load-data-init.tsx" />

## API

| 参数                   | 说明                                          | 类型     | 默认值   |
| ---------------------- | --------------------------------------------- | -------- | -------- |
| selectType             | Select 的类型                                 | -        | request  |
| requestFunction        | 异步请求数据用的请求函数                      | function | () => {} |
| onChange               | 接收 Option 选择时的回调函数                  | function | () => {} |
| staticOptionsArray     | 静态数据源                                    | array    | []       |
| transItem              | 用来处理数据源中的每条数据，传递数据给 Option | function | () => {} |
| placeholder            | placeholder                                   | string   | 请选择   |
| requestPayload         | 要传递给 requestFunction 的额外参数           | object   | {}       |
| 其他 Select 的原生属性 |                                               |          |          |
