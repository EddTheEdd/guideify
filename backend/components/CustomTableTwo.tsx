// CustomTable.tsx
import { Table } from 'antd';
import React from 'react';
import {useRouter} from "next/navigation";

interface Props {
  sideModalFeature?: boolean;
  showModal: (data: any) => void;
  data: any[];
  columns?: any[];
}

const CustomTableTwo: React.FC<Props> = ({ data, columns, sideModalFeature, showModal }) => {
  const router = useRouter();

  data = data.map((item) => {
    item.key = item.id;
    return item;
  });

  return (
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
      />
  );
};

export default CustomTableTwo;
