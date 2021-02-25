/**
 * 关键字：规格选择
 * 新增人：徐友万
 * 完善中
 */
import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import classnames from 'classnames';

const { CheckableTag } = Tag;
type SpecType = { specName: string; specId: string; specValueList: string[] };
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
  disabled: number[];
};
interface IProps {
  specList: SpecType[];
  skuList: SkuType[];
  limitStockNum?: number;
  prefixCls?: string;
  className?: string;
  [propName: string]: any;
}

const getEmptyStockSkus = (
  selectedSpecs: SelectedSpecsType[],
  skuList: SkuType[],
  limitStockNum: number = 0,
) =>
  skuList.filter(
    n =>
      selectedSpecs.map(n => n.currentName).filter(m => n.specList.includes(m))
        .length === selectedSpecs.length && n.stockNum <= limitStockNum,
  );

const setSpecDisabled = (
  selectedSpecs: SelectedSpecsType[],
  specs: SelectedSpecsType[],
  skuList: SkuType[],
  index: number,
  limitStockNum: number = 0,
) => {
  // 获取可能的库存为0的规格组
  const emptyStockSkus = getEmptyStockSkus(
    selectedSpecs,
    skuList,
    limitStockNum,
  );
  console.log('组合：', selectedSpecs);
  console.log(`为第${index + 1}个规格设置disabled`);
  console.log('规格组库存为0的有：', emptyStockSkus);
  emptyStockSkus.forEach(n => {
    specs[index].disabled.push(Number(n.pos.split('-')[index]));
  });
};

const SkuChoose: React.FC<IProps> = props => {
  const {
    specList,
    skuList,
    limitStockNum,
    prefixCls,
    className,
    style,
  } = props;
  const [specs, setSpecs] = useState<SelectedSpecsType[]>([]);
  const handleChange = (
    checked: boolean,
    specIdx: number,
    specValueIdx: number,
  ) => {
    if (specs[specIdx].disabled.includes(specValueIdx)) return;
    specs[specIdx].current = checked ? specValueIdx : -1;
    specs[specIdx].currentName = checked
      ? specList[specIdx].specValueList[specValueIdx]
      : '';
    specs.forEach((n, i) => i !== specIdx && (n.disabled = []));
    // 获取当前已经选择的规格的数量
    const selectedSpecs = specs.filter(n => n.current !== -1);
    if (selectedSpecs.length >= specs.length - 1) {
      let lastSelectedIdx = specs.findIndex(n => n.current === -1);
      if (lastSelectedIdx !== -1) {
        // 只剩下最后一个规格未选
        setSpecDisabled(
          selectedSpecs,
          specs,
          skuList,
          lastSelectedIdx,
          limitStockNum,
        );
      } else {
        // 所有规格都已选择
        lastSelectedIdx = specIdx;
        // 用最后一次选择的规格，与其他 specs.length - 2 个规格组合
        const restSpecs = specs.filter((_, i) => i !== lastSelectedIdx);
        restSpecs.forEach((n, i) => {
          const selectedSpecs = restSpecs
            .filter((_, j) => i !== j)
            .concat(specs[lastSelectedIdx]);
          setSpecDisabled(
            selectedSpecs,
            specs,
            skuList,
            specs.findIndex(m => m.specName === n.specName),
            limitStockNum,
          );
        });
      }
    }
    setSpecs([...specs]);
  };
  useEffect(() => {
    if (!specs.length) {
      setSpecs(
        specList.map(n => ({
          specName: n.specName,
          current: -1,
          currentName: '',
          disabled: [],
        })),
      );
    }
  }, [specList]);
  return (
    <div
      style={style}
      className={classnames(className, `${prefixCls}-wrapper`)}
    >
      {specs.length &&
        specList.map((n, i) => (
          <div style={{ marginBottom: 12 }}>
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
  prefixCls: `${CONTRIBUTOR}-sku-choose`,
  className: '',
};

export default SkuChoose;
