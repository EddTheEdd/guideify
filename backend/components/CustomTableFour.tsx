// CustomTable.tsx
import { Table } from 'antd';
import React from 'react';
import {useRouter} from "next/navigation";
import type { ColumnsType, TableProps } from 'antd/es/table';

interface Props {
  data: any[];
  columns?: any[];
}

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const CustomTableFour: React.FC<Props> = ({ data, columns }) => {

  data = data.map((item) => {
    item.key = item.progress_id;
    return item;
  });

  const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
      <Table 
        style={{marginLeft: "16px"}}
        dataSource={data} 
        columns={columns} 
        pagination={false}
        onChange={onChange}
      />
  );
};

export default CustomTableFour;
