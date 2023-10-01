// CustomTable.tsx
import { Table } from 'antd';
import React from 'react';
import {useRouter} from "next/navigation";

interface Props {
  data: any[]; // Changed from Role[] to any[] to allow any type of data
  columns?: any[]; // Add this if you want to customize columns per table
}

const CustomTableTwo: React.FC<Props> = ({ data, columns }) => {
  const router = useRouter();


  return <Table dataSource={data} columns={columns} onRow={(record) => ({
    onClick: () => {
      router.push(`/courses/${record.id}`); 
    },
  })} />;
};

export default CustomTableTwo;
