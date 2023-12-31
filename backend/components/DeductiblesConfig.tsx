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
      const newDeductibles = prev.map((ded: any) => {
        if (ded.deductible_id === id) {
          return {
            ...ded,
            name: value,
          };
        }
        return ded;
      });
      return newDeductibles;
    });
  };

  // This should unlock the input field for editing:
  const handleEditDeductible = (id: any) => {
    setDeductibles((prev: any) => {
      const newDeductibles = prev.map((ded: any) => {
        if (ded.deductible_id === id) {
          return {
            ...ded,
            inputLocked: false,
          };
        }
        return ded;
      });
      return newDeductibles;
    });
  };

  const handleDeleteDeductible = (id: any) => {
    setDeductibles((prev: any) => {
      const newDeductibles = prev.map((ded: any) => {
        if (ded.deductible_id === id) {
          return {
            ...ded,
            forDeletion: !ded.forDeletion,
          };
        }
        return ded;
      });
      return newDeductibles;
    });
  };

  const addDeductible = () => {
    setDeductibles((prev: any) => {
      const newDepartments = [
        ...prev,
        {
          name: "",
          inputLocked: false,
          forDeletion: false,
          canBeDeleted: true,
          deductible_id: prev.length + 5,
          amount: 0,
          percentage: null,
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

  const handleTypeChange = (id: any) => {
    setDeductibles((prev: any) => {
      const newDeductibles = prev.map((ded: any) => {
        if (ded.deductible_id === id) {
          if (ded.amount != null) {
            console.log("amount", ded.amount);	
            return {
              ...ded,
              amount: null,
              percentage: 0
            }
          }
          console.log("percentage", ded.percentage);
          return {
            ...ded,
            percentage: null,
            amount: 0,
          };
        }
        return ded;
      });
      return newDeductibles;
    });
  };

  const handleDeductibleValueChange = (value: any, id: any) => {
    setDeductibles((prev: any) => {
      const newDeductibles = prev.map((ded: any) => {
        if (ded.deductible_id === id) {
          if (ded.amount != null) {
            return {
              ...ded,
              amount: value,
            };
          }
          return {
            ...ded,
            percentage: value,
          };
        }
        return ded;
      });
      return newDeductibles;
    });
  }

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
            ded.percentage != null ?
            <>
            <Input
              value={ded.percentage}
              disabled={ded.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handleDeductibleValueChange(e.target.value, ded.deductible_id)
              }
            />
            <div className="type_icon" onClick={() => {handleTypeChange(ded.deductible_id)}}>
            <p >%</p>
            </div>
            </>
            :
            <>
            <Input
              value={ded.amount}
              disabled={ded.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handleDeductibleValueChange(e.target.value, ded.deductible_id)
              }
            />
             <div className="type_icon" onClick={() => {handleTypeChange(ded.deductible_id)}}>
            <p >EUR</p>
            </div>
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
