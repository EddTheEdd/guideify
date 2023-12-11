"use client";
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { List, Modal, Button, Spin } from "antd";
import RoleBox from "@/components/RoleBox";
import Layout from "@/components/Layout";
import axios from "axios";
import { toast } from "react-hot-toast";
import UserItem from "@/components/UserItem";
import { DeleteFilled, LoadingOutlined } from "@ant-design/icons";
import DeleteBox from "@/components/DeleteBox";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useRouter } from "next/navigation";

const ItemType = "USER";

interface User {
  id: number;
  username: string;
}

interface Role {
  role_id: number;
  role_name: string;
  users?: User[];
}

interface UserRole {
  user_id: number;
  role_id: number;
}

export default function AssignRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [refresh, setRefresh] = useState(false);
  const { userPermissions, theme, finishedFetchingPermissions } = useGlobalContext();
  console.log(userPermissions);
  const canAssignRoles = userPermissions.includes("Assign Roles");
  const router = useRouter();

  useEffect(() => {
    if (!canAssignRoles && finishedFetchingPermissions) {
      router.push("/forbidden");
    }

    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        return data.users;
      } else {
        throw new Error("Failed to fetch users");
      }
    };

    const fetchUserRoles = async () => {
      const res = await fetch("/api/user-role");
      const data = await res.json();
      if (data.success) {
        return data.user_roles;
      } else {
        throw new Error("Failed to fetch user roles");
      }
    };

    const fetchRoles = async () => {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (data.success) {
        return data.roles;
      } else {
        throw new Error("Failed to fetch roles");
      }
    };

    const transformRoles = (
      roles: any[],
      userRolesFetched: any[],
      usersFetched: any[]
    ) => {
      console.log("====");
      console.log(roles);
      console.log(userRolesFetched);
      const newRoles = roles.map((role: any) => {
        return {
          ...role,
          users: userRolesFetched
            .filter((ur) => ur.role_id === role.role_id)
            .map((ur) => {
              const user = usersFetched.find((u) => u.id === ur.user_id);
              return user || null;
            })
            .filter(Boolean), // This filters out any potential null values
        };
      });
      console.log(newRoles);
      setRoles(newRoles);
    };

    // Fetch all required data then transform
    Promise.all([fetchUsers(), fetchUserRoles(), fetchRoles()])
      .then(([usersData, userRolesData, rolesData]) => {
        setUsers(usersData);
        setUserRoles(userRolesData);
        transformRoles(rolesData, userRolesData, usersData);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      });
  }, [refresh]);

  const assignUserRoles = async (userId: number, roleId: number) => {
    try {
      await axios.post("/api/user-role", { userId, roleId });
      toast.success("User role combination created successfully");
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error("Error creating user role combination ");
      console.error("Error creating user role combination ", error);
    }
  };

  const onDrop = (
    item: { id: number; currentRole: number },
    newRoleId: number
  ) => {
    const userId = item.id;
    const oldRoleId = item.currentRole;
    console.log("OLD ROLE ID");
    console.log(oldRoleId);
    if (oldRoleId !== newRoleId) {
      console.log(
        `${userId} was removed from role ${oldRoleId} and assigned to ${newRoleId}`
      );
      if (oldRoleId) {
        removeUserRole(userId, oldRoleId);
      } // Remove from old role
      assignUserRoles(userId, newRoleId); // Assign to new role
    }
  };

  const removeItem = (item: { id: number; currentRole: number }) => {
    const userId = item.id;
    const oldRoleId = item.currentRole;
    console.log(oldRoleId);
    if (oldRoleId) {
      if (oldRoleId) {
        removeUserRole(userId, oldRoleId);
      } // Remove from old role
    }
  };

  const removeUserRole = async (userId: number, roleId: number) => {
    try {
      const res = await axios.delete(`/api/user-role/${userId}/${roleId}`);
      const data = await res.data;

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success("Role removed successfully!");
      setRefresh((prev) => !prev); // To re-render and show the updated roles
    } catch (error) {
      toast.error("Error removing role");
      console.error("Error removing role", error);
    }
  };

  return (
    console.log(roles),
    console.log(users),
    console.log(userRoles),
    (!canAssignRoles && (
      <div className="loading_spinner">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
      </div>
    )) || (
      <DndProvider backend={HTML5Backend}>
        <Layout>
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                borderRight: "solid 2px black",
                padding: "16px",
                width: "200px",
              }}
            >
              <p style={{ fontWeight: "900", margin: "0" }}>Users:</p>
              {users.map((user, index) => (
                <UserItem key={index} id={user.id} username={user.username} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100rem" }}>
              {roles.map((role, index) => (
                <RoleBox
                  key={index}
                  role={role.role_name}
                  role_id={role.role_id}
                  users={role.users}
                  onDrop={(item) => onDrop(item, role.role_id)}
                />
              ))}
              <DeleteBox onDrop={(item: any) => removeItem(item)} />
            </div>
          </div>
        </Layout>
      </DndProvider>
    )
  );
}
