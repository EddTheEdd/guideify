"use client";
import React from "react";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UndoOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Tag, Tooltip } from "antd";
import axios from "axios";

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface UsersFilter {
  [key: string]: any;
}

interface UsersSort {
  [column: string]: string;
}

interface Props {
  positions: any;
  setPositions: any;
  refetch: any;
  setRefetch: any;
}

const PositionsConfig: React.FC<Props> = ({
  positions,
  setPositions,
  refetch,
  setRefetch,
}) => {
  const handlePositionNameChange = (value: any, id: any) => {
    setPositions((prev: any) => {
      const newDepartments = prev.map((department: any) => {
        if (department.position_id === id) {
          return {
            ...department,
            position_title: value,
          };
        }
        return department;
      });
      return newDepartments;
    });
  };

  // This should unlock the input field for editing:
  const handleEditPosition = (id: any) => {
    setPositions((prev: any) => {
      const newDepartments = prev.map((department: any) => {
        if (department.position_id === id) {
          return {
            ...department,
            inputLocked: false,
          };
        }
        return department;
      });
      return newDepartments;
    });
  };

  const handleDeletePosition = (id: any) => {
    setPositions((prev: any) => {
      const newDepartments = prev.map((department: any) => {
        if (department.position_id === id) {
          return {
            ...department,
            forDeletion: !department.forDeletion,
          };
        }
        return department;
      });
      return newDepartments;
    });
  };

  const addPosition = () => {
    setPositions((prev: any) => {
      const newDepartments = [
        ...prev,
        {
          position_title: "",
          inputLocked: false,
          forDeletion: false,
          canBeDeleted: true,
          position_id: prev.length + 5,
        },
      ];
      return newDepartments;
    });
  };

  const savePositions = async () => {
    try {
      const result = await axios.post(`/api/positions`, { positions });
      console.log(result);
      message.success("Positions saved successfully");
    } catch (error) {
      console.error("Error saving positions", error);
    }
    setRefetch(!refetch);
  };

  return (
    <>
      {positions.map((position: any) => (
        <div key={position.position_id} style={{ marginBottom: "10px" }}>
          <Tag color={position.forDeletion ? "red" : "blue"}>
            <Input
              value={position.position_title}
              disabled={position.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handlePositionNameChange(e.target.value, position.position_id)
              }
            />
            <EditOutlined
              className="edit_small_trash"
              onClick={() => handleEditPosition(position.position_id)}
            />
            {position.canBeDeleted &&
              (position.forDeletion ? (
                <UndoOutlined
                  className="delete_small_trash"
                  onClick={() => handleDeletePosition(position.position_id)}
                />
              ) : (
                <DeleteOutlined
                  className="delete_small_trash"
                  onClick={() => handleDeletePosition(position.position_id)}
                />
              ))}
            {!position.canBeDeleted && (
              <Tooltip title={"There are existing users with this position."}>
                <InfoCircleOutlined />
              </Tooltip>
            )}
          </Tag>
        </div>
      ))}
      <Button
        type="default"
        onClick={() => addPosition()}
        style={{
          marginTop: "20px",
        }}
      >
        <PlusCircleOutlined />
      </Button>
      <Button
        type="default"
        onClick={() => savePositions()}
        style={{
          marginTop: "20px",
        }}
      >
        Save Positions
      </Button>
    </>
  );
};

export default PositionsConfig;
