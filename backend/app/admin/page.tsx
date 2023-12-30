"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  LoadingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  theme,
  Table,
  Input,
  Space,
  Pagination,
  Spin,
  message,
} from "antd";
import LayoutTwo from "../../components/Layout";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useRouter } from "next/navigation";
import {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { ColumnType } from "antd/lib/table";
import { renderHighlightText } from "@/helpers/renderHighlightText";
import { buildQueryString } from "../helpers/buildQueryString";
import axios from "axios";
import UserModal from "@/components/UserModal";
import UserConfig from "@/components/UserConfig";
import SiteConfig from "@/components/SiteConfig";

const { Header, Sider, Content } = Layout;

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

const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersFilter, setUsersFilter] = useState<UsersFilter>({});
  const [usersSort, setUsersSort] = useState<UsersSort>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>({});

  const searchInput = useRef<any>(null);

  const { userPermissions, finishedFetchingPermissions } = useGlobalContext();
  console.log(userPermissions);
  const canAdminPanel = userPermissions.includes("Admin Panel");
  console.log(canAdminPanel);

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
      render: (text: string) =>
        usersFilter[dataIndex]
          ? renderHighlightText(
              text ? text.toString() : "",
              usersFilter[dataIndex][0]
            )
          : text,
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
      key: "last_name",
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
    await axios.post(`/api/users`, {id: modalData.id ?? 0, values});
    setModalVisible(false);
    setCurrentPage(1); // will cause a refresh which is what we need.
    if (modalData.id) {
      message.success("User updated successfully");
    } else {
      message.success("User created successfully");
    }
    } catch (error) {
      message.error("Error updating user");
      console.error("Error updating user", error);
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
  
  const deleteUser = () => {
    // Delete user:
    console.log("DELETE");
  };

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
    console.log("User permissions:");
    console.log(userPermissions);
    console.log("Finished:");
    console.log(finishedFetchingPermissions);

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

        if (data.success) {
          data.users = data.users.map((user: any) => {
            return {
              ...user,
              key: user.id,
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

    setLoading(false);
  }, [usersFilter, usersSort, currentPage, pageSize]);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return loading ? (
    <div className="loading_spinner">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
    </div>
  ) : (
    (
      <LayoutTwo style={{ background: "blue" }}>
        <Layout style={{ height: "100%" }}>
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical" />
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={[selectedMenuItem]}
              onSelect={({ key }) => setSelectedMenuItem(key)}
              items={[
                {
                  key: "1",
                  icon: <UserOutlined />,
                  label: "Users",
                },
                {
                  key: "2",
                  icon: <SettingOutlined />,
                  label: "Site Configuration",
                },
              ]}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
            </Header>
            <Content
              style={{
                margin: "24px 16px",
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
              }}
            >
              {selectedMenuItem === "1" && (
                <UserConfig/>
              )}
              {selectedMenuItem === "2" && (
                <SiteConfig/>
              )}
            </Content>
          </Layout>
        </Layout>
      </LayoutTwo>
    )
  );
};

export default AdminPage;
