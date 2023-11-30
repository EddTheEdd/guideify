// CustomTable.tsx
import { Table } from 'antd';
import React from 'react';
import {useRouter} from "next/navigation";
import { renderHighlightText } from '@/helpers/renderHighlightText';
interface Props {
  sideModalFeature?: boolean;
  showModal: (data: any) => void;
  data: any[];
  columns?: any[];
  onChange?: any;
}

const CustomTableTwo: React.FC<Props> = ({ data, columns, sideModalFeature, showModal, onChange }) => {
  const router = useRouter();

  data = data.map((item) => {
    item.key = item.id;
    return item;
  });

  return (
    console.log(data),
    sideModalFeature ? 
      <Table 
        className="side_modal_table"
        dataSource={data} 
        columns={columns} 
        onRow={(record: any) => ({
          onClick: () => {
            showModal(record.id);
          }
        })}
        onChange={onChange}
        pagination={false}
      />
    :
      <Table 
        dataSource={data} 
        columns={columns} 
        onRow={(record: any) => ({
          style: {
            borderLeft: record.rgb_value ? `4px solid ${record.rgb_value}` : undefined
          }
        })}
        onChange={onChange}
      />
  );
};

export default CustomTableTwo;
