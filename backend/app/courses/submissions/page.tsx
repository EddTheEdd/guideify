"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../../components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal, Select } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import CustomTableThree from "@/components/CustomTableThree";
import { FilterDropdownProps } from 'antd/lib/table/interface';

interface Course {
  id: number;
  name: string;
  description: string;
  units: number;
}

interface Unit {
  id: number;
  name: string;
  type: string;
}

interface UserFilter {
  [key: string]: any;
}

interface UserSort {
  [column: string]: string;
}

export default function CourseSubmissions() {
  const [userFilter, setUserFilter] = useState<UserFilter>({});
  const [userSort, setUserSort] = useState<UserSort>({});
  const [users, setUsers] = useState<any[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    description: "",
    units: 0,
    id: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

 const handleFilterChange = (pagination: any, filters: any, sorter: any) => {
  console.log(filters);
    setUserFilter(filters);
    setUserSort({
      column: sorter.field,
      order: sorter.order,
    });
  };


  const buildQueryString = () => {
    const filterParams = new URLSearchParams();
    for (const key in userFilter) {
      if (userFilter[key]) {
        filterParams.append(key, userFilter[key].join(','));
      }
    }
    if (userSort.column) {
      filterParams.append('sortColumn', userSort.column);
      filterParams.append('sortOrder', userSort.order === 'ascend' ? 'asc' : 'desc');
    }
    return filterParams.toString();
  };

  const fetchUsersAndTheirCourses = async () => {
    try {
      const queryParams = buildQueryString();
      const res = await fetch(`/api/courses/submissions?view=users&${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        console.error("Failed to fetch users", data.error);
      }
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  useEffect(() => {

    fetchUsersAndTheirCourses();
  }, [userFilter, userSort]);

  const showModal = () => {
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      await axios.post("/api/courses", newCourse);
      toast.success("Course created successfully");
      fetchUsersAndTheirCourses();
    } catch (error) {
      toast.error("Error creating course");
      console.error("Error creating course", error);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const courseColumns = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Name"
            value={selectedKeys[0]}
            onChange={(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button onClick={() => confirm()} type="primary" size="small" style={{ width: 90, marginRight: 8 }}>
            Search
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
    },
    {
      title: "Surname",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
  ];

  return (
    <Layout>
      <CustomTableThree data={users} columns={courseColumns} onChange={handleFilterChange} />
    </Layout>
  );
}