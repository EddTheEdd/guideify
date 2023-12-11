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
  deductibles: any;
  setDeductibles: any;
  refetch: any;
  setRefetch: any;
}

const DeductiblesConfig: React.FC<Props> = ({
  deductibles,
  setDeductibles,
  refetch,
  setRefetch,
}) => {
  const handleDeductibleNameChange = (value: any, id: any) => {
    setDeductibles((prev: any) => {
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
  const handleEditDeductible = (id: any) => {
    setDeductibles((prev: any) => {
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

  const handleDeleteDeductible = (id: any) => {
    setDeductibles((prev: any) => {
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

  const addDeductible = () => {
    setDeductibles((prev: any) => {
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

  const saveDeductibles = async () => {
    try {
      const result = await axios.post(`/api/deductibles`, { deductibles });
      console.log(result);
      message.success("deductibles saved successfully");
    } catch (error) {
      console.error("Error saving deductibles", error);
    }
    setRefetch(!refetch);
  };

  return (
    <>
      {deductibles.map((ded: any) => (
        <div key={ded.deductible_id} style={{ marginBottom: "10px" }}>
          <Tag color={ded.forDeletion ? "red" : "blue"}>
            <Input
              value={ded.name}
              disabled={ded.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handleDeductibleNameChange(e.target.value, ded.deductible_id)
              }
            />
            {
            ded.percentage ?
            <>
            <Input
              value={ded.percentage}
              disabled={ded.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handleDeductibleNameChange(e.target.value, ded.deductible_id)
              }
            />
            <p>%</p>
            </>
            :
            <>
            <Input
              value={ded.amount}
              disabled={ded.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handleDeductibleNameChange(e.target.value, ded.deductible_id)
              }
            />
            <p>EUR</p>
            </>
            }
            <EditOutlined
              className="edit_small_trash"
              onClick={() => handleEditDeductible(ded.deductible_id)}
            />
            {ded.canBeTampered &&
              (ded.forDeletion ? (
                <UndoOutlined
                  className="delete_small_trash"
                  onClick={() => handleDeleteDeductible(ded.deductible_id)}
                />
              ) : (
                <DeleteOutlined
                  className="delete_small_trash"
                  onClick={() => handleDeleteDeductible(ded.deductible_id)}
                />
              ))}
            {!ded.canBeTampered && (
              <Tooltip title={"There are existing salaries with this deductible."}>
                <InfoCircleOutlined />
              </Tooltip>
            )}
          </Tag>
        </div>
      ))}
      <Button
        type="default"
        onClick={() => addDeductible()}
        style={{
          marginTop: "20px",
        }}
      >
        <PlusCircleOutlined />
      </Button>
      <Button
        type="default"
        onClick={() => saveDeductibles()}
        style={{
          marginTop: "20px",
        }}
      >
        Save deductibles
      </Button>
    </>
  );
};

export default DeductiblesConfig;
