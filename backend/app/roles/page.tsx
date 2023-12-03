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
  Spin,
  Tag,
  Tooltip,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { InfoCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { useGlobalContext } from "@/contexts/GlobalContext";

interface Role {
  name: string;
  role_name?: string;
  permissions: number[];
}

interface Permission {
  id: number;
  name: string;
}

export default function Roles() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "", username: "" });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<Role>({ name: "", permissions: [] });
  const [tableData, setTableData] = useState([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const { userPermissions, theme } = useGlobalContext();
  console.log(userPermissions);
  const canViewRoles = userPermissions.includes("View Roles");

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      console.log(res);
      const data = await res.json();

      if (data.success) {
        setTableData(data.roles);
      } else {
        console.error("Failed to fetch roles", data.error);
      }
    } catch (error) {
      console.error("Error fetching roles", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!canViewRoles) {
      router.push("/forbidden");
    }
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
  }, []);

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
    } catch (error) {
      toast.error("Error creating role");
      console.error("Error creating role", error);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.password.length > 0 &&
      user.username.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  const handleRoleClick = (role: Role) => {
    const roleWithPermissionIds = {
      ...role,
      permissions: role.permissions.map((permission: any) => permission.id),
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
    } catch (error) {
      toast.error("Error updating role");
      console.error("Error updating role", error);
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      render: (text, record) => (
        text === "ROOT" ? <p>{"ROOT (Uneditable)"}</p> : <a onClick={() => handleRoleClick(record)}>{text}</a>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => (
        <>
          {permissions.map((permission: any) => (
            <Tag color="blue" key={permission.id}>
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
      (!canViewRoles && (
        <div className="loading_spinner">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />}
          />
        </div>
      )) || (
        <Layout>
          <CustomTable data={tableData} columns={columns} />
          <Button onClick={showModal}>Create a Role</Button>

          <Modal
            title="Create a Role"
            open={modalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Input
              placeholder="Role Name"
              value={newRole.name}
              onChange={(e: any) =>
                setNewRole({ ...newRole, name: e.target.value })
              }
            />
            {permissions.map((permission) => (
              <div key={permission.id}>
                <Checkbox
                  checked={newRole.permissions.includes(permission.id)}
                  onChange={() => {
                    if (newRole.permissions.includes(permission.id)) {
                      setNewRole({
                        ...newRole,
                        permissions: newRole.permissions.filter(
                          (p) => p !== permission.id
                        ),
                      });
                    } else {
                      setNewRole({
                        ...newRole,
                        permissions: [...newRole.permissions, permission.id],
                      });
                    }
                  }}
                >
                  {permission.name}
                </Checkbox>
              </div>
            ))}
          </Modal>

          <Modal
            title="Edit Role"
            visible={editRoleModalVisible}
            onOk={handleEditRole}
            onCancel={() => setEditRoleModalVisible(false)}
          >
            <Input
              placeholder="Role Name"
              value={selectedRole ? selectedRole.role_name : ""}
              onChange={(e) =>
                setSelectedRole({ ...selectedRole, role_name: e.target.value })
              }
            />
            <Divider>Permissions</Divider>
            {permissions.map((permission, index: number) => (
              <>
                <div key={permission.id}>
                  <Checkbox
                    checked={
                      selectedRole &&
                      selectedRole.permissions.includes(permission.id)
                    }
                    onChange={() => {
                      handlePermissionChange(permission.id);
                    }}
                  >
                    {permission.name}
                  </Checkbox>
                  <Tooltip title={permissionDescriptions[permission.name]}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                {[1, 5, 8].includes(index) && <Divider />}
              </>
            ))}
          </Modal>
        </Layout>
      )
    )
  );
}
