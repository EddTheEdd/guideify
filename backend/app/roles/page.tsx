"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal } from "antd";

interface Role {
    name: string;
    permissions: number[];
}

interface Permission {
    id: number;
    name: string;
}

export default function Roles() {
    const router = useRouter();
    const [user, setUser] = useState({email: "", password: "", username: ""});
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRole, setNewRole] = useState<Role>({ name: "", permissions: [] });
    const [tableData, setTableData] = useState([]);
    const [permissions, setPermissions] = useState<Permission[]>([]); // Populate from API if needed

    const data = [
        {
            key: "asd",
            name: "asd",
            age: 23,
            address: "asd",
            tags: ["COOL"],
        }
    ]

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/roles');
            console.log(res);
            const data = await res.json();
            
            if(data.success) {
                setTableData(data.roles);
            } else {
                console.error('Failed to fetch roles', data.error);
            }
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    };

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await fetch('/api/permissions');
                const data = await res.json();
                
                if(data.success) {
                    setPermissions(data.permissions);
                } else {
                    console.error('Failed to fetch permissions', data.error);
                }
            } catch (error) {
                console.error('Error fetching permissions', error);
            }
        };
        
        fetchPermissions();
        
        fetchRoles();
    }, []);

    const showModal = () => {
        setModalVisible(true);
    };

    const handleOk = async () => {
        // Handle the role creation here
        try {
            // Assuming you have an API endpoint to create roles
            await axios.post('/api/roles', newRole);
            toast.success('Role created successfully');
            fetchRoles();
        } catch (error) {
            toast.error('Error creating role');
            console.error('Error creating role', error);
        }
        setModalVisible(false);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Login success", response.data);
            toast.success("Login success");
            router.push("/profile");
        } catch (error:any) {
            console.log("Login failed", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        console.log(tableData),
        loading ? <p>Loading...</p> :
        <Layout>
            <CustomTable data={tableData}/>
            <Button onClick={showModal}>Create a Role</Button>

            <Modal title="Create a Role" visible={modalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Input placeholder="Role Name" value={newRole.name} onChange={(e: any) => setNewRole({ ...newRole, name: e.target.value })} />
                {permissions.map(permission => (
                    <div key={permission.id}>
                        <Checkbox checked={newRole.permissions.includes(permission.id)} onChange={() => {
                            if (newRole.permissions.includes(permission.id)) {
                                setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission.id) });
                            } else {
                                setNewRole({ ...newRole, permissions: [...newRole.permissions, permission.id] });
                            }
                        }}>
                            {permission.name}
                        </Checkbox>
                    </div>
                ))}
            </Modal>
        </Layout>
    )
}