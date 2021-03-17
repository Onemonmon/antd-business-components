/**
 * 关键字：规格选择
 * 新增人：徐友万
 * 完善中
 */
import React, { useEffect, useRef, useState } from 'react';
import { Tag } from 'antd';
import classnames from 'classnames';

const { CheckableTag } = Tag;
type SpecType = { specName: string; specValueList: string[] };
type SkuType = {
  pos: string;
  specList: string[];
  stockNum: number;
  price?: number;
};
type SelectedSpecsType = {
  specName: string; // 当前选中的规格类名
  current: number; // 当前选中的规格下标
  currentName: string; // 当前选中的规格名
  disabled: number[]; // 当前被置灰的规格
};
interface IProps {
  specList: SpecType[]; // 规格数据
  skuList: SkuType[]; // 规格组数据
  limitStockNum?: number; // disabled生效时的库存数
  autoChoose?: boolean; // 自动选择第一组库存符合条件的规格组
  initialValues?: SkuType; // 初始值
  prefixCls?: string;
  className?: string;
  [propName: string]: any;
}

// 根据已选的规格，得到剩下的规格中，库存为0的规格
const getEmptyStockSkus = (
  selectedSpecs: SelectedSpecsType[],
  skuList: SkuType[],
  limitStockNum: number = 0,
) => {
  const currentNames = selectedSpecs.map(n => n.currentName);
  const length = currentNames.length;
  return skuList.filter(
    n =>
      currentNames.filter(m => n.specList.includes(m)).length === length &&
      n.stockNum <= limitStockNum,
  );
};

const setSpecDisabled = (
  selectedSpecs: SelectedSpecsType[], // 已选的规格
  specs: SelectedSpecsType[], // 总的规格
  skuList: SkuType[],
  index: number, // 需要置灰的规格类型下标
  limitStockNum: number = 0,
) => {
  // 获取可能的库存为0的规格组
  const emptyStockSkus = getEmptyStockSkus(
    selectedSpecs,
    skuList,
    limitStockNum,
  );
  // console.log('已选组合：', selectedSpecs);
  // console.log('总的组合：', specs);
  // console.log(`为第${index + 1}个规格设置disabled`);
  // console.log('规格组库存为0的有：', emptyStockSkus);
  emptyStockSkus.forEach(n => {
    specs[index].disabled.push(Number(n.pos.split('-')[index]));
  });
};

const SkuChoose: React.FC<IProps> = props => {
  const {
    specList,
    skuList,
    limitStockNum = 0,
    autoChoose,
    initialValues,
    prefixCls,
    className,
    style,
  } = props;
  // 是否初始化的标志
  const ref = useRef<number>(0);
  // 总的规格类型
  const [specs, setSpecs] = useState<SelectedSpecsType[]>([]);
  const handleChange = (
    checked: boolean,
    specIdx: number, // 规格类型下标
    specValueIdx: number, // 具体规格下标
    initialSpecs?: SelectedSpecsType[], // 初始的总的规格类型
  ) => {
    const _spec = initialSpecs ? initialSpecs : specs;
    // 置灰不可点
    if (_spec[specIdx].disabled.includes(specValueIdx)) return;
    // 设置对应规格类型的current、currentName
    _spec[specIdx].current = checked ? specValueIdx : -1;
    _spec[specIdx].currentName = checked
      ? specList[specIdx].specValueList[specValueIdx]
      : '';
    _spec.forEach((n, i) => i !== specIdx && (n.disabled = []));
    // 获取当前已经选择的规格
    const selectedSpecs = _spec.filter(n => n.current !== -1);
    if (selectedSpecs.length >= _spec.length - 1) {
      // 只剩下最后一个规格未选 或者 所有规格都已选 进入置灰阶段
      // 获取未选的规格类型下标
      let unSelectedIdx = _spec.findIndex(n => n.current === -1);
      if (unSelectedIdx !== -1) {
        // 有未选的规格类型下标 => 剩下最后一个规格未选 => 将该类型下的对应规格置灰
        setSpecDisabled(
          selectedSpecs,
          _spec,
          skuList,
          unSelectedIdx,
          limitStockNum,
        );
      } else {
        // 无未选的规格类型下标 => 所有规格都已选择
        const restSpecs = _spec.filter((_, i) => i !== specIdx);
        // 用当前选择的规格类型，与其他 specs.length - 2 个规格类型组合
        restSpecs.forEach((n, i) => {
          // 获得排除当前规格类型后的规格类型
          const selectedSpecs = restSpecs
            .filter((_, j) => i !== j)
            .concat(_spec[specIdx]);
          // 将当前规格类型置灰
          setSpecDisabled(
            selectedSpecs,
            _spec,
            skuList,
            _spec.findIndex(m => m.specName === n.specName),
            limitStockNum,
          );
        });
      }
    }
    setSpecs([..._spec]);
  };
  useEffect(() => {
    if (specList.length && skuList.length) {
      // 获取第一组库存符合条件的规格组 或 传入的初始值 => 作为当前的初始值
      const _initialValues = autoChoose
        ? skuList.find(n => n.stockNum > limitStockNum)
        : initialValues;
      // 初始置灰的规格类型下标
      let disabled: number[] = [];
      // 如果规格类型只有一组 则提前判断是否需要置灰其中的规格
      specList.length === 1 &&
        skuList.forEach(
          (n, i) => n.stockNum <= limitStockNum && disabled.push(i),
        );
      // 初始化总的规格类型
      const _spec = specList.map(n => ({
        specName: n.specName,
        current: -1,
        currentName: '',
        disabled,
      }));
      if (_initialValues && !ref.current) {
        const { pos } = _initialValues;
        // 初始化标志置为1
        ref.current = 1;
        // 循环触发onChange事件
        pos.split('-').forEach((n, i) => {
          handleChange(true, i, Number(n), _spec);
        });
      } else {
        setSpecs(_spec);
      }
    }
  }, [specList, skuList, limitStockNum, initialValues, autoChoose]);
  return (
    <div
      style={style}
      className={classnames(className, `${prefixCls}-wrapper`)}
    >
      {specs.length &&
        specList.map((n, i) => (
          <div key={n.specName} style={{ marginBottom: 12 }}>
            <span style={{ marginRight: 8 }}>{n.specName}：</span>
            {n.specValueList.map((m, j) => (
              <CheckableTag
                key={m}
                checked={specs[i].current === j}
                style={
                  specs[i].disabled.includes(j)
                    ? { backgroundColor: '#ccc' }
                    : {}
                }
                onChange={(checked: boolean) => handleChange(checked, i, j)}
              >
                {m}
              </CheckableTag>
            ))}
          </div>
        ))}
    </div>
  );
};

SkuChoose.defaultProps = {
  specList: [],
  skuList: [],
  limitStockNum: 0,
  autoChoose: false,
  prefixCls: `${CONTRIBUTOR}-sku-choose`,
  className: '',
};

export default SkuChoose;
