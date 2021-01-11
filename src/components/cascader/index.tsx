/**
 * 关键字：级联选择
 * 新增人：徐友万
 * 完善中
 */
import React, { useEffect, useRef, useState } from 'react';
import { Cascader } from 'antd';
import classnames from 'classnames';
import { CascaderOptionType } from 'antd/lib/cascader';

// 获取数据的接口返回类型
export type LoadDataRes = {
  value?: CascaderOptionType[];
};
interface IProps {
  value: string[] | number[]; // 值
  options?: CascaderOptionType[]; // 树结构
  needFillData?: boolean; // 是否需要回填数据
  loadData?: (code?: string | number) => Promise<LoadDataRes>; // 异步加载数据
  loadTopData?: () => Promise<LoadDataRes>; // 加载第一级数据
  prefixCls?: string;
  className?: string;
  [propName: string]: any;
}

const AreaCascader: React.FC<IProps> = props => {
  const {
    value = [],
    options = [],
    needFillData,
    loadTopData,
    loadData,
    prefixCls,
    className,
    style,
    ...rest
  } = props;
  // 使用ref保存当前加载的value索引
  const ref = useRef<number>(0);
  // 数据回填初始化
  const [fillDataInit, setFillDataInit] = useState<boolean>(false);
  // 区域选择树节点
  const [newOptions, setNewOptions] = useState<CascaderOptionType[]>(options);
  // 第一级节点初始化
  const [topDataInit, setTopDataInit] = useState<boolean>(options.length > 0);
  // 异步加载节点数据
  const handleLoadData = async (selectedOptions?: CascaderOptionType[]) => {
    if (selectedOptions) {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      targetOption.loading = true;
      if (loadData) {
        const res = await loadData(targetOption.value);
        targetOption.loading = false;
        const data = res.value;
        if (data) {
          targetOption.children = data;
          setNewOptions([...newOptions]);
          return data;
        }
      }
    }
  };
  // 异步数据回填
  const handleFillData = async (parentOptions: CascaderOptionType[]) => {
    const data = parentOptions.filter(
      option => option.value === value[ref.current],
    );
    const res = await handleLoadData(data);
    ref.current += 1;
    if (res && ref.current !== value.length - 1) {
      handleFillData(res);
    }
  };
  // 初始化第一级树节点
  useEffect(() => {
    const getTopData = async () => {
      if (loadTopData) {
        const res = await loadTopData();
        const data = res.value;
        if (data && data.length) {
          setNewOptions(data);
          setTopDataInit(true);
        }
      }
    };
    getTopData();
  }, []);
  // 需要回填数据 递归创建树结构
  useEffect(() => {
    if (topDataInit && !fillDataInit && value.length && needFillData) {
      setFillDataInit(true);
      handleFillData(newOptions);
    }
  }, [value, topDataInit, fillDataInit, needFillData]);
  return (
    <div style={style}>
      <Cascader
        loadData={handleLoadData}
        value={value}
        options={newOptions}
        placeholder="请选择"
        className={classnames(className, `${prefixCls}-wrapper`)}
        {...rest}
      />
    </div>
  );
};

AreaCascader.defaultProps = {
  value: [],
  options: [],
  needFillData: false,
  prefixCls: `${CONTRIBUTOR}-cascader`,
  className: '',
};

export default AreaCascader;
