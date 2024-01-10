import React from 'react';
import { Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  role_id: number;
  role_name: string;
  permissions: Permission[];
}

interface Props {
  data: Role[];
  columns: any;
}

const CustomTable: React.FC<Props> = ({ data, columns }) => {
  // Convert roles data to a format compatible with the Table component
  const dataSource = data.map((role) => ({
    key: role.role_id.toString(), // Convert to string to avoid warnings
    ...role,
  }));

  return <Table pagination={false} columns={columns} dataSource={dataSource} />;
};

export default CustomTable;
