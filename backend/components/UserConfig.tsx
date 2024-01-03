"use client";
import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import {
  Layout,
  Button,
  theme,
  Table,
  Input,
  Space,
  Pagination,
  message,
  Modal,
} from "antd";
import { useRouter } from "next/navigation";
import {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { ColumnType } from "antd/lib/table";
import { renderHighlightText } from "@/helpers/renderHighlightText";
import { buildQueryString } from "@/app/helpers/buildQueryString";
import axios from "axios";
import UserModal from "@/components/UserModal";
import { formatDate } from "@/helpers/formatDate";

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

const UserConfig: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersFilter, setUsersFilter] = useState<UsersFilter>({});
  const [usersSort, setUsersSort] = useState<UsersSort>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>({});
  const [refetch, setRefetch] = useState(false);

  const searchInput = useRef<any>(null);

  const router = useRouter();

  const getColumnSearchProps = (dataIndex: any): ColumnType<DataType> => {
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e: any) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters, confirm)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      onFilter: (value: any, record: any) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase())
          : false,
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (text: string, record, index) => {
        // Function to format the date
      
        // Check if the text is a date and format it
        const formattedText = (dataIndex === 'created_at' || dataIndex === "updated_at") ? formatDate(new Date(text)) : text;
      
        // Apply highlighting
        return usersFilter[dataIndex]
          ? renderHighlightText(formattedText, usersFilter[dataIndex][0])
          : formattedText;
      },
    };
  };

  const courseColumns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: true,
      ...getColumnSearchProps("username"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      ...getColumnSearchProps("email"),
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: true,
      ...getColumnSearchProps("first_name"),
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      sorter: true,
      ...getColumnSearchProps("last_name"),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text: string) => {
        return new Date(text).toLocaleDateString();
      },
      sorter: true,
      ...getColumnSearchProps("updated_at"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => {
        return new Date(text).toLocaleDateString();
      },
      sorter: true,
      ...getColumnSearchProps("created_at"),
    },
  ];

  const onFinish = async (values: any) => {
    try {
      console.log(values);
      // one call to create user, api will check if he exists via email:
      await axios.post(`/api/users`, { id: modalData.user_id ?? 0, values });
      setModalVisible(false);
      setRefetch(!refetch); // will cause a refresh which is what we need.
      if (modalData.user_id) {
        message.success("User updated successfully");
      } else {
        message.success("User created successfully");
      }
    } catch (error: any) {
      const errorMsg = error.response.data.error;
      if (errorMsg) {
        message.error(errorMsg);
        return;
      }
      if (modalData.user_id) {
        message.error("Error creating user");
      }
      message.error("Error updating user");
    }
  };

  const showModal = (record: any) => {
    console.log(record);
    setModalData(record);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const callDelete = () => {
    try {
      axios.delete(`/api/users/${modalData.user_id}`);
      setModalVisible(false);
      setRefetch(!refetch); // will cause a refresh which is what we need.
      message.success("User deleted successfully");
    } catch (error) {
      message.error("Error deleting user");
    }
  }

  const deleteUser = () => {
    Modal.confirm({
      title: "Are you sure you wish to delete this user?",
      content:
        "This action will delete the user and all associated data permanently.",
      okText: "Confirm Delete",
      cancelText: "Cancel",
      onOk: () => {
        callDelete();
      }});
  }

  const handleFilterChange = (pagination: any, filters: any, sorter: any) => {
    console.log(filters);
    setUsersFilter(filters);
    setUsersSort({
      column: sorter.field,
      order: sorter.order,
    });
  };

  const handlePageChange = (page: number) => {
    console.log(page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    console.log(size);
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: (param?: FilterConfirmProps) => void
  ) => {
    clearFilters();
    confirm();
  };

  useEffect(() => {
    setLoading(true);

    const fetchDepartment = async () => {
      try {
        const res = await fetch(`/api/departments`);
        const data = await res.json();

        if (data.success) {
          console.log(data.departments);
          setDepartments(data.departments);
        } else {
          console.error("Failed to fetch departments", data.error);
        }
      } catch (error) {
        console.error("Error fetching departments", error);
      }
    };

    const fetchPositions = async () => {
      try {
        const res = await fetch(`/api/positions`);
        const data = await res.json();

        if (data.success) {
          console.log(data.positions);
          setPositions(data.positions);
        } else {
          console.error("Failed to fetch positions", data.error);
        }
      } catch (error) {
        console.error("Error fetching positions", error);
      }
    };

    const fetchUsers = async () => {
      const queryParams = `${buildQueryString(
        usersFilter,
        usersSort
      )}&page=${currentPage}&limit=${pageSize}`;
      try {
        const res = await fetch(`/api/users?${queryParams}`);
        const data = await res.json();
        setLoading(false);

        if (data.success) {
          data.users = data.users.map((user: any) => {
            return {
              ...user,
              key: user.user_id,
            };
          });
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
        } else {
          console.error("Failed to fetch users", data.error);
        }
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();
    fetchDepartment();
    fetchPositions();

  }, [refetch, usersFilter, usersSort, currentPage, pageSize]);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <div>
      <Table
        loading={loading}
        dataSource={users}
        columns={courseColumns}
        onRow={(record: any) => ({
          onClick: () => {
            showModal(record);
          },
        })}
        onChange={handleFilterChange}
        pagination={false}
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
      <UserModal
        onFinish={onFinish}
        modalVisible={modalVisible}
        handleCancel={handleCancel}
        modalData={modalData}
        departments={departments}
        positions={positions}
        onOk={deleteUser}
      />
      <Button
        type="default"
        onClick={() => showModal({})}
        style={{
          marginTop: "20px",
        }}
      >
        Create User
      </Button>
    </div>
  );
};

export default UserConfig;
