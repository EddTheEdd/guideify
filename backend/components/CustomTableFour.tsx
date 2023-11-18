// CustomTable.tsx
import { Table } from 'antd';
import React from 'react';
import {useRouter} from "next/navigation";

interface Props {
  data: any[];
  columns?: any[];
}

const CustomTableFour: React.FC<Props> = ({ data, columns }) => {

  data = data.map((item) => {
    item.key = item.id;
    return item;
  });

  return (
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={false}
      />
  );
};

export default CustomTableFour;
