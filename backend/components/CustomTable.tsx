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
}

const CustomTable: React.FC<Props> = ({ data }) => {
  const columns: ColumnsType<Role> = [
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (text) => <a>{text}</a>, // Or just <>{text}</> if you don't need a link
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <>
          {permissions.map((permission: any) => (
            <Tag color="blue" key={permission.id}>
              {permission.name}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  // Convert roles data to a format compatible with the Table component
  const dataSource = data.map((role) => ({
    key: role.role_id.toString(), // Convert to string to avoid warnings
    ...role,
  }));

  return <Table columns={columns} dataSource={dataSource} />;
};

export default CustomTable;
