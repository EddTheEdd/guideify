// components/RoleBox.tsx
import React from 'react';
import { useDrop } from 'react-dnd';
import { Button, Tag } from 'antd';

interface User {
    id: number;
    username: string;
}

interface RoleBoxProps {
  role: string;
  role_id: number;
  users?: User[];
  onDrop: (user: number, role_id: number) => void;
}

const RoleBox: React.FC<RoleBoxProps> = ({ role, role_id, users, onDrop }) => {
  const [, drop] = useDrop({
    accept: 'USER',
    drop: (item: any, monitor) => {
      onDrop(item.id, role_id);
    },
  });

  return (
    <div
      ref={drop}
      style={{
        flex: '1',
        padding: '1rem',
        border: '1px solid #ccc',
        minHeight: '100px',
        position: 'relative',
      }}
    >
      <div>{role}</div>
      {users && users.map((user: User) => (
            <Tag key={user.id} color="blue">{user.username}</Tag>
        ))}
    </div>
  );
};

export default RoleBox;
