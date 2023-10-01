// components/RoleBox.tsx
import React from 'react';
import { useDrop } from 'react-dnd';
import { Button, Tag } from 'antd';
import UserItem from './UserItem';

interface User {
    id: number;
    username: string;
}

interface RoleBoxProps {
  role: string;
  role_id: number;
  users?: User[];
  onDrop: (item: any, role_id: number) => void;
}

const RoleBox: React.FC<RoleBoxProps> = ({ role, role_id, users, onDrop }) => {
  const [, drop] = useDrop({
    accept: 'USER',
    drop: (item) => {
      onDrop(item, role_id);  // Pass the entire item object here
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
      {users && users.map((user: User, index) => (
            <UserItem key={index} id={user.id} currentRole={role_id} username={user.username} />
        ))}
    </div>
  );
};

export default RoleBox;
