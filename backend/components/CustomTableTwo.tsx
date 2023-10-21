// CustomTable.tsx
import { Table } from 'antd';
import React from 'react';
import {useRouter} from "next/navigation";

interface Props {
  data: any[];
  columns?: any[];
}

const CustomTableTwo: React.FC<Props> = ({ data, columns }) => {
  const router = useRouter();


  return <Table 
    dataSource={data} 
    columns={columns} 
    onRow={(record) => ({
      onClick: () => {
        router.push(`/courses/${record.id}`);
      },
      style: {
        borderLeft: record.rgb_value ? `4px solid ${record.rgb_value}` : undefined
      }
    })}
  />
};

export default CustomTableTwo;
