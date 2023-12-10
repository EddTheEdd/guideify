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
import {
  Button,
  Input,
  message,
  Tag,
  Tooltip,
} from "antd";
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
    departments: any;
    setDepartments: any;
    refetch: any;
    setRefetch: any;
}

const DepartmentsConfig: React.FC<Props> = ({departments, setDepartments, refetch, setRefetch}) => {
  const handleDepartmentNameChange = (value: any, id: any) => {
    setDepartments((prev: any) => {
      const newDepartments = prev.map((department: any) => {
        if (department.department_id === id) {
          return {
            ...department,
            department_name: value,
          };
        }
        return department;
      });
      return newDepartments;
    });
  };

  // This should unlock the input field for editing:
  const handleEditDepartment = (id: any) => {
    setDepartments((prev: any) => {
      const newDepartments = prev.map((department: any) => {
        if (department.department_id === id) {
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

  const handleDeleteDepartment = (id: any) => {
    setDepartments((prev: any) => {
      const newDepartments = prev.map((department: any) => {
        if (department.department_id === id) {
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

  const addDepartment = () => {
    setDepartments((prev: any) => {
      const newDepartments = [
        ...prev,
        {
          department_name: "",
          inputLocked: false,
          forDeletion: false,
          canBeDeleted: true,
          department_id: prev.length + 5,
        },
      ];
      return newDepartments;
    });
  };

  const saveDepartments = async () => {
    try {
      const result = await axios.post(`/api/departments`, { departments });
      console.log(result);
      message.success("Departments saved successfully");
    } catch (error) {
      console.error("Error saving departments", error);
    }
    setRefetch(!refetch);
  };



  return (
    <>
      {departments.map((department: any) => (
        <div key={department.department_id} style={{ marginBottom: "10px" }}>
          <Tag color={department.forDeletion ? "red" : "blue"}>
            <Input
              value={department.department_name}
              disabled={department.inputLocked}
              style={{ width: "100px", marginRight: "10px" }}
              onChange={(e) =>
                handleDepartmentNameChange(
                  e.target.value,
                  department.department_id
                )
              }
            />
            <EditOutlined
              className="edit_small_trash"
              onClick={() => handleEditDepartment(department.department_id)}
            />
            {department.canBeDeleted &&
              (department.forDeletion ? (
                <UndoOutlined
                  className="delete_small_trash"
                  onClick={() =>
                    handleDeleteDepartment(department.department_id)
                  }
                />
              ) : (
                <DeleteOutlined
                  className="delete_small_trash"
                  onClick={() =>
                    handleDeleteDepartment(department.department_id)
                  }
                />
              ))}
            {!department.canBeDeleted && (
              <Tooltip title={"There are existing users with this department."}>
                <InfoCircleOutlined />
              </Tooltip>
            )}
          </Tag>
        </div>
      ))}
      <Button
        type="default"
        onClick={() => addDepartment()}
        style={{
          marginTop: "20px",
        }}
      >
        <PlusCircleOutlined />
      </Button>
      <Button
        type="default"
        onClick={() => saveDepartments()}
        style={{
          marginTop: "20px",
        }}
      >
        Save Departments
      </Button>
    </>
  );
};

export default DepartmentsConfig;
