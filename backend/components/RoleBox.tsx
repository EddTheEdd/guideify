// components/RoleBox.tsx
import React from "react";
import { useDrop } from "react-dnd";
import { Button, Tag } from "antd";
import UserItem from "./UserItem";

interface User {
  user_id: number;
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
    accept: "USER",
    drop: (item) => {
      onDrop(item, role_id); // Pass the entire item object here
    },
  });

  return (
    <div
      ref={drop}
      style={{
        flex: "1",
        padding: "1rem",
        border: "2px solid black",
        borderRadius: "5px",
        minWidth: "200px",
        minHeight: "100px",
        position: "relative",
        height: "200px"
      }}
    >
      <div style={{ fontWeight: "900" }}>{role}</div>
      <div style={{ display: "flex", gap: "5px"}}>
        {users &&
          users.map((user: User, index) => (
            <UserItem
              key={index}
              id={user.user_id}
              currentRole={role_id}
              username={user.username}
            />
          ))}
      </div>
    </div>
  );
};

export default RoleBox;
