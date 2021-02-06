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
  id: string;
  specList: string[];
  stockNum?: number;
  price?: number;
};
type SelectedSpecsType = {
  specName: string;
  current: number;
  disabled: number[];
};
interface IProps {
  specList: SpecType[];
  skuList: SkuType[];
  prefixCls?: string;
  className?: string;
  [propName: string]: any;
}

const SkuChoose: React.FC<IProps> = props => {
  const { specList, skuList, prefixCls, className, style } = props;
  const [selectedSpecs, setSelectedSpecs] = useState<SelectedSpecsType[]>([]);
  const handleChange = (
    checked: boolean,
    specIdx: number,
    specValueIdx: number,
  ) => {
    if (selectedSpecs[specIdx].disabled.includes(specValueIdx)) return;
    selectedSpecs[specIdx].current = checked ? specValueIdx : -1;
    setSelectedSpecs([...selectedSpecs]);
  };
  useEffect(() => {
    if (!selectedSpecs.length) {
      setSelectedSpecs(
        specList.map(n => ({
          specName: n.specName,
          current: 0,
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
      {selectedSpecs.length &&
        specList.map((n, i) => (
          <div style={{ marginBottom: 12 }}>
            <span style={{ marginRight: 8 }}>{n.specName}：</span>
            {n.specValueList.map((m, j) => (
              <CheckableTag
                key={m}
                checked={selectedSpecs[i].current === j}
                style={
                  selectedSpecs[i].disabled.includes(j)
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
  prefixCls: `${CONTRIBUTOR}-sku-choose`,
  className: '',
};

export default SkuChoose;
