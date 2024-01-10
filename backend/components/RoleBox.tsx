// components/RoleBox.tsx
import React from "react";
import { useDrop } from "react-dnd";
import { Button, Tag } from "antd";
import UserItem from "./UserItem";

interface User {
  user_id: number;
  username: string;
  rgb_value: string;
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
    console.log(users),
    <div
      ref={drop}
      style={{
        flex: "1",
        padding: "1rem",
        border: "2px solid black",
        borderRadius: "5px",
        position: "relative",
        maxWidth: "25rem"
      }}
      className="role_box_container"
    >
      <div style={{ fontWeight: "900" }}>{role}</div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap"}}>
        {users &&
          users.map((user: User, index) => (
            <UserItem
              key={index}
              id={user.user_id}
              currentRole={role_id}
              username={user.username}
              color={user?.rgb_value}
            />
          ))}
      </div>
    </div>
  );
};

export default RoleBox;
