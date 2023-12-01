"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../../components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal, Pagination, Select, Spin } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import CustomTableThree from "@/components/CustomTableThree";
import { FilterDropdownProps } from "antd/lib/table/interface";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useRouter } from "next/navigation";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(1);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    description: "",
    units: 0,
    id: 0,
  });
  const { userPermissions, theme } = useGlobalContext();
  const router = useRouter();
  const canViewCourseProgress = userPermissions.includes(
    "View Course Progress"
  );

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
        filterParams.append(key, userFilter[key].join(","));
      }
    }
    if (userSort.column) {
      filterParams.append("sortColumn", userSort.column);
      filterParams.append(
        "sortOrder",
        userSort.order === "ascend" ? "asc" : "desc"
      );
    }
    return filterParams.toString();
  };

  const fetchUsersAndTheirCourses = async () => {
    try {
      const queryParams = `${buildQueryString()}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(
        `/api/courses/submissions?view=users&${queryParams}`
      );
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.totalUsers);
      } else {
        console.error("Failed to fetch users", data.error);
      }

      if (!canViewCourseProgress) {
        router.push('/forbidden');
      }

    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  useEffect(() => {
    fetchUsersAndTheirCourses();
  }, [userFilter, userSort, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    console.log(page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    console.log(size);
    setPageSize(size);
    setCurrentPage(1);
  };

  const courseColumns = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: true,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
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
            onChange={(e: any) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => confirm()}
            type="primary"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
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
      sorter: true,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Surname"
            value={selectedKeys[0]}
            onChange={(e: any) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => confirm()}
            type="primary"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Email"
            value={selectedKeys[0]}
            onChange={(e: any) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => confirm()}
            type="primary"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
    },
    {
      title: "Phone number",
      dataIndex: "phone_number",
      key: "phone_number",
      sorter: true,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Phone Number"
            value={selectedKeys[0]}
            onChange={(e: any) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => confirm()}
            type="primary"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
    },
  ];

  return (
    (!canViewCourseProgress && (
      <div className="loading_spinner">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
      </div>
    )) || (
      <Layout>
        <CustomTableThree
          data={users}
          columns={courseColumns}
          onChange={handleFilterChange}
        />
        <Pagination
          className="tower_element"
          current={currentPage}
          total={totalUsers}
          pageSize={pageSize}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          showSizeChanger
          showQuickJumper
        />
      </Layout>
    )
  );
}
