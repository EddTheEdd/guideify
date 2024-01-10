// components/RoleBox.tsx
import React from "react";
import { useDrop } from "react-dnd";
import { Button, Tag } from "antd";
import UserItem from "./UserItem";
import { DeleteFilled } from "@ant-design/icons";

interface User {
  id: number;
  username: string;
}

interface DeleteBoxProps {
  onDrop: (item: any, role_id: number) => void;
}

const DeleteBox: React.FC<DeleteBoxProps> = ({ onDrop }) => {
  const [, drop] = useDrop({
    accept: "USER",
    drop: (item) => {
      onDrop(item, 1337); // Pass the entire item object here
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
        minWidth: "60px",
        minHeight: "60px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center", 
      }}
      className={"delete_box_container"}
    >
      <DeleteFilled style={{fontSize: "30px"}}/>
    </div>
  );
};

export default DeleteBox;
