"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import CustomTable from "@/components/CustomTable";
import {
  Button,
  Checkbox,
  Divider,
  Input,
  Modal,
  Pagination,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { InfoCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { buildQueryString } from "../helpers/buildQueryString";

interface Role {
  name: string;
  role_name?: string;
  permissions: number[];
}

interface Permission {
  permission_id: number;
  name: string;
}

export default function Roles() {
  const [user, setUser] = useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<Role>({ name: "", permissions: [] });
  const [tableData, setTableData] = useState([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [roleNameTouched, setRoleNameTouches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handlePageChange = (page: number) => {
    console.log(page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    console.log(size);
    setPageSize(size);
    setCurrentPage(1);
  };

  const { userPermissions } = useGlobalContext();
  console.log(userPermissions);
  const canEditRoles = userPermissions.includes("Edit Roles");

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/roles?page=${currentPage}&limit=${pageSize}`);
      console.log(res);
      const data = await res.json();

      if (data.success) {
        setTableData(data.roles);
        setTotalRoles(data.totalRoles);
      } else {
        console.error("Failed to fetch roles", data.error);
      }
    } catch (error) {
      console.error("Error fetching roles", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    // if (!canViewRoles && finishedFetchingPermissions) {
    //   router.push("/forbidden");
    // }
    const fetchPermissions = async () => {
      try {
        const res = await fetch("/api/permissions");
        const data = await res.json();

        if (data.success) {
          setPermissions(data.permissions);
        } else {
          console.error("Failed to fetch permissions", data.error);
        }
      } catch (error) {
        console.error("Error fetching permissions", error);
      }
    };

    fetchPermissions();

    fetchRoles();
    setLoading(false);
  }, [pageSize, currentPage]);

  const showModal = () => {
    setModalVisible(true);
  };

  const handleOk = async () => {
    // Handle the role creation here
    try {
      // Assuming you have an API endpoint to create roles
      await axios.post("/api/roles", newRole);
      toast.success("Role created successfully");
      fetchRoles();
      message.success("Role created successfully");
      setModalVisible(false);
    } catch (error: any) {
      const frontendErrorMessage = error.response.data.frontendErrorMessage;
      if (frontendErrorMessage) {
        toast.error(frontendErrorMessage);
        message.error(frontendErrorMessage);
      } else {
        toast.error("Error creating role");
        console.error("Error creating role", error);
        message.error("Error creating role");
      }
    }
  };

  const handleCancel = () => {
    setNewRole({ name: "", permissions: [] });
    setRoleNameTouches(false);
    setModalVisible(false);
  };

  const handleRoleClick = (role: Role) => {
    const roleWithPermissionIds = {
      ...role,
      permissions: role.permissions.map((permission: any) => permission.permission_id),
      original_name: role.role_name,
    };

    console.log(roleWithPermissionIds);
    setSelectedRole(roleWithPermissionIds);
    setEditRoleModalVisible(true);
  };

  const handlePermissionChange = (permissionId: number) => {
    if (selectedRole) {
      const updatedPermissions = selectedRole.permissions.includes(permissionId)
        ? selectedRole.permissions.filter((id: number) => id !== permissionId)
        : [...selectedRole.permissions, permissionId];
      setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
    }
  };

  const handleEditRole = async () => {
    try {
      await axios.put(`/api/roles`, selectedRole);
      toast.success("Role updated successfully");
      fetchRoles();
      setEditRoleModalVisible(false);
      message.success("Role updated successfully!")
    } catch (error: any) {
      const frontendErrorMessage = error.response.data.frontendErrorMessage;
      if (frontendErrorMessage) {
        toast.error(frontendErrorMessage);
        message.error(frontendErrorMessage);
      }
      toast.error("Error updating role");
      console.error("Error updating role", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/roles/${selectedRole.role_id}`);
      toast.success("Role deleted successfully");
      message.success("Role deleted successfully");
      fetchRoles();
      setEditRoleModalVisible(false);
    } catch (error) {
      toast.error("Error deleting role");
      message.error("Error deleting role");
      console.error("Error deleting role", error);
    }
  }

  const confirmDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this role? Users who belong to this role will loose it.",
      content: "This action cannot be undone",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        handleDelete();
      },
    });
  }

  const columns: ColumnsType<Role> = [
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      render: (text, record) => (
        canEditRoles ?
        text === "ROOT" ? <p>{"ROOT (Uneditable)"}</p> : <a onClick={() => handleRoleClick(record)}>{text}</a>
        :
        text
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => (
        <>
          {permissions.map((permission: any) => (
            <Tag color="blue" key={permission.permission_id}>
              {permission.name}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  const permissionDescriptions: any = {
    "Edit Salaries": "Whether the user can edit salaries",
    "View Salaries": "Whether the user can view salaries",
    "See All Courses":
      "Whether the user can see all courses or only the courses assigned to his role",
    "View Course Progress": "Whether the user can view course progress of other users",
    "Review Courses":
      "Whether the user can review course submissions (only applicable to courses that the user can see)",
    "Edit Courses":
      "Whether the user can edit course content (only applicable to courses that the user can see)",
    "Edit Roles": "Whether the user can edit roles (names, permissions)",
    "View Roles": "Whether the user can view roles",
    "Assign Roles": "Whether the user can assign roles to other users",
  };

  return (
    console.log(tableData),
    loading ? (
      <div className="loading_spinner">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
      </div>
    ) : (
      (
        <Layout>
          <CustomTable data={tableData} columns={columns} />
          <Pagination
            className="tower_element"
            current={currentPage}
            total={totalRoles}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            showSizeChanger
            showQuickJumper
          />
          { canEditRoles && <Button style={{marginTop: "13px"}} onClick={showModal}>Create a Role</Button> }
          <Modal
            title="Create a Role"
            open={modalVisible}
            onOk={handleOk}
            okText="Create Role"
            onCancel={handleCancel}
          >
            <Input
              status={roleNameTouched && newRole.name === "" ? "error" : ""}
              placeholder="Role Name"
              value={newRole.name}
              onChange={(e: any) => {
                setRoleNameTouches(true);
                setNewRole({ ...newRole, name: e.target.value })}
              }
            />
            {roleNameTouched && newRole.name === "" && <p style={{color: "red"}}>Role name is required!</p>}
            {permissions.map((permission, index) => (
              <div key={permission.permission_id}>
                <Checkbox
                  checked={newRole.permissions.includes(permission.permission_id)}
                  onChange={() => {
                    if (newRole.permissions.includes(permission.permission_id)) {
                      setNewRole({
                        ...newRole,
                        permissions: newRole.permissions.filter(
                          (p) => p !== permission.permission_id
                        ),
                      });
                    } else {
                      setNewRole({
                        ...newRole,
                        permissions: [...newRole.permissions, permission.permission_id],
                      });
                    }
                  }}
                >
                  {permission.name}
                </Checkbox>
                <Tooltip title={permissionDescriptions[permission.name]}>
                  <InfoCircleOutlined />
                </Tooltip>
                {[1, 5, 8].includes(index) && <Divider />}
              </div>
            ))}
          </Modal>
          <Modal
            title="Edit Role"
            open={editRoleModalVisible}
            onOk={handleEditRole}
            okText="Save Role"
            onCancel={() => setEditRoleModalVisible(false)}
          >
              <Input
                status={selectedRole && selectedRole.role_name === "" ? "error" : ""}
                placeholder="Role Name"
                value={selectedRole ? selectedRole.role_name : ""}
                onChange={(e) =>
                  setSelectedRole({ ...selectedRole, role_name: e.target.value })
                }
              />
              {selectedRole && selectedRole.role_name === "" && <p style={{color: "red"}}>Role name is required!</p>}
            <Divider>Permissions</Divider>
            {permissions.map((permission, index: number) => (
              <div key={permission.permission_id}>
                  <Checkbox
                    checked={
                      selectedRole &&
                      selectedRole.permissions.includes(permission.permission_id)
                    }
                    onChange={() => {
                      handlePermissionChange(permission.permission_id);
                    }}
                  >
                    {permission.name}
                  </Checkbox>
                  <Tooltip title={permissionDescriptions[permission.name]}>
                    <InfoCircleOutlined />
                  </Tooltip>
                {[1, 5, 8].includes(index) && <Divider />}
              </div>
            ))}
            <Button danger
              type = "primary"
              style = {{marginTop: "20px"}}
              onClick={() => {confirmDelete()}}
            >
              Delete Role
            </Button>
          </Modal>
        </Layout>
      )
    )
  );
}
