/**
 * 关键字：级联选择
 * 新增人：徐友万
 * 完善中
 */
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Cascader } from 'antd';
import classNames from 'classnames';
import React from 'react';

type CascaderOptionType = {
  label: ReactNode;
  value?: string | number | null;
  loading?: boolean;
  children?: CascaderOptionType[];
};

// 获取数据的接口返回类型
export type LoadDataRes = {
  value: CascaderOptionType[];
};
interface IProps {
  options?: CascaderOptionType[]; // 树结构
  needFillData?: boolean; // 是否需要回填数据
  loadData?: (code?: string | number) => Promise<LoadDataRes>; // 异步加载数据
  loadTopData?: () => Promise<LoadDataRes>; // 加载顶层数据
  [propName: string]: any;
}

const AreaCascader: React.FC<IProps> = (props) => {
  const {
    options = [],
    needFillData,
    value = [],
    loadTopData,
    loadData,
    prefixCls = `${CONTRIBUTOR}-cascader`,
    className,
    children,
    ...rest
  } = props;
  // 使用ref保存当前加载的value索引
  const ref = useRef<number>(0);
  // 数据回填初始化是否完成
  const fillDataInitRef = useRef<boolean>(false);
  // 区域选择树节点
  const [newOptions, setNewOptions] = useState<CascaderOptionType[]>(options);
  // 第一级节点初始化
  const [topDataInit, setTopDataInit] = useState<boolean>(options.length > 0);
  // 异步加载节点数据
  const handleLoadData = async (selectedOptions?: CascaderOptionType[]) => {
    if (!selectedOptions || !selectedOptions.length) return;
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    if (loadData) {
      const res = await loadData(targetOption.value!);
      targetOption.loading = false;
      const data = res.value;
      if (data) {
        targetOption.children = data;
        setNewOptions([...newOptions]);
        return data;
      }
    }
  };
  // 异步数据回填
  const handleFillData = async (parentOptions: CascaderOptionType[]) => {
    const data = parentOptions.filter((option) => option.value === value[ref.current]);
    const res = await handleLoadData(data);
    ref.current += 1;
    res && ref.current !== value.length - 1 && handleFillData(res);
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
    // 第一级节点加载完 未回填过数据 有初始值 需要回填
    if (topDataInit && !fillDataInitRef.current && value.length && needFillData) {
      fillDataInitRef.current = true;
      handleFillData(newOptions);
    }
  }, [value, topDataInit, needFillData]);
  return (
    <Cascader
      value={value}
      loadData={handleLoadData}
      options={newOptions}
      placeholder="请选择"
      className={classNames(className, `${prefixCls}-wrapper`)}
      {...rest}
    />
  );
};

export default AreaCascader;
