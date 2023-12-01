"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import CustomTable from "@/components/CustomTable";
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Switch,
  message,
} from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { buildQueryString } from "@/app/helpers/buildQueryString";
import { FilterDropdownProps } from "antd/es/table/interface";
import { renderHighlightText } from "@/helpers/renderHighlightText";
import type { FilterConfirmProps } from "antd/es/table/interface";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { set } from "mongoose";
import { generatePayslip } from "@/helpers/generatePayslip";
import { useGlobalContext } from '@/contexts/GlobalContext';
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
}

interface Salary {
  user_id: number;
  base_salary: number;
  bonus: number;
  allowance: number;
  salary_id: number;
  deduction_type: string;
  deduction_amount: number;
  effective_date: string;
  old_salary: number;
  new_salary: number;
  deductibles: any[];
  agreed: boolean;
}

interface Deductible {
  deductible_id: number;
  name: string;
  amount?: number;
  percentage?: number;
}

interface SalaryData {
  user_id?: number;
  base_salary: number;
  bonus: number;
  allowance: number;
  deductibles: Deductible[];
}

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface SalaryModalProps {
  handleCancel: () => void;
  isModalVisible: boolean;
  selectedSalaryData: any;
  setSelectedSalaryData: any;
  deductibles: Deductible[];
  amountDed: number;
  setRefetch: (refetch: boolean) => void;
  refetch: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
}

const SalaryModal: React.FC<SalaryModalProps> = ({
  handleCancel,
  isModalVisible,
  selectedSalaryData,
  setSelectedSalaryData,
  deductibles,
  amountDed,
  setRefetch,
  refetch,
  setIsModalVisible,
}) => {
  const [disableForm, setDisableForm] = useState(false);
  const { userPermissions, theme } = useGlobalContext();
  console.log(userPermissions);
  const canEditSalaries = userPermissions.includes('Edit Salaries');

  const calculateDeductions = (baseSalary: any, deductions: any) => {
    let remainingSalary = baseSalary;
    deductions.forEach((d: any) => {
      if (d?.amount === null) {
        const deductionAmount = remainingSalary * (d.percentage / 100);
        remainingSalary -= deductionAmount;
      }
    });
    return remainingSalary;
  };

  const handleSubmit = async () => {
    const createSalary = async () => {
      console.log(selectedSalaryData);
      try {
        await axios.post(`/api/salary/${selectedSalaryData?.user_id}`, {
          ...selectedSalaryData,
          agreed: false,
        });
        message.success("Salary offer sent to employee!");
        setRefetch(!refetch);
        setIsModalVisible(false);
      } catch (error: any) {
        console.error("Error:", error.message);

        if (error.response && error.response.status === 403) {
          message.error("You do not have permission to perform this action.");
        } else {
          message.error("An error occurred while processing your request.");
        }
      }
    };

    if (selectedSalaryData.agreed) {
      Modal.confirm({
        title: "This employee already has a salary.",
        content:
          "Would you like to offer the employee a new salary? If the employee accepts the new salary, the previous salary will be invalidated!",
        okText: "Make offer!",
        cancelText: "Cancel",
        onOk: () => {
          createSalary();
        },
      });
    } else {
      createSalary();
    }
  };

  return (
    console.log(disableForm),
    (
      <Drawer
        title="Salary Details"
        placement="right"
        closable={true}
        onClose={handleCancel}
        visible={isModalVisible}
        width={720}
      >
        {selectedSalaryData.agreed && (
          <>
            <span>Locked: </span>
            <Switch
              defaultChecked
              onChange={() => {
                setDisableForm(!disableForm);
              }}
            />
          </>
        )}
        {/* Modal content here */}

        <Form
          disabled={selectedSalaryData?.agreed && !disableForm && !canEditSalaries}
          layout="vertical"
          onFinish={() => {
            handleSubmit();
          }}
        >
          <Form.Item label="Base Salary">
            <Input
              value={selectedSalaryData?.base_salary}
              onChange={(e: any) => {
                setSelectedSalaryData((prev: any) => {
                  const updatedSalary = { ...prev };
                  updatedSalary.base_salary = e.target.value;
                  return updatedSalary;
                });
              }}
            />
          </Form.Item>
          <Form.Item label="Bonus">
            <Input
              value={selectedSalaryData?.bonus}
              onChange={(e: any) => {
                setSelectedSalaryData((prev: any) => {
                  const updatedSalary = { ...prev };
                  updatedSalary.bonus = e.target.value;
                  return updatedSalary;
                });
              }}
            />
          </Form.Item>
          <Form.Item label="Allowance">
            <Input
              value={selectedSalaryData?.allowance}
              onChange={(e: any) => {
                setSelectedSalaryData((prev: any) => {
                  const updatedSalary = { ...prev };
                  updatedSalary.allowance = e.target.value;
                  return updatedSalary;
                });
              }}
            />
          </Form.Item>
          <Divider>Deductibles:</Divider>
          {deductibles.map((deductible: any, index: number) => (
            <div
              key={deductible.deductible_id}
              className="wages_page_deductible_row"
            >
              <Form.Item
                key={index}
                label={
                  deductible.name +
                  " (" +
                  (deductible?.amount
                    ? deductible?.amount + " EUR)"
                    : deductible?.percentage + " %)")
                }
              >
                <Checkbox
                  key={deductible.deductible_id}
                  checked={selectedSalaryData?.deductibles.some(
                    (d: any) => d.deductible_id === deductible.deductible_id
                  )}
                  onChange={() => {
                    setSelectedSalaryData((prev: any) => {
                      const updatedSalary = { ...prev };
                      const deductibleIndex =
                        updatedSalary.deductibles.findIndex(
                          (d: any) =>
                            d.deductible_id === deductible.deductible_id
                        );
                      if (deductibleIndex === -1) {
                        updatedSalary.deductibles.push(deductible);
                      } else {
                        updatedSalary.deductibles.splice(deductibleIndex, 1);
                      }
                      return updatedSalary;
                    });
                  }}
                />
              </Form.Item>
            </div>
          ))}
          <Divider>Payslip:</Divider>
          <p>Base: +{selectedSalaryData?.base_salary} €</p>
          <p>Bonus: +{selectedSalaryData?.bonus} €</p>
          <p>Allowance: +{selectedSalaryData?.allowance} €</p>
          <hr className="rounded_grey" />
          {selectedSalaryData?.deductibles.map(
            (deductible: any, index: number) => {
              if (deductible.amount != null) {
                return (
                  <p key={index}>
                    {deductible.name}: -{deductible.amount} €
                  </p>
                );
              } else {
                return (
                  <p key={index}>
                    {deductible.name}: -{deductible.percentage}%
                  </p>
                );
              }
            }
          )}
          <hr className="rounded" />
          <p>
            Total:{" "}
            {calculateDeductions(
              Number(selectedSalaryData?.base_salary) +
                Number(selectedSalaryData?.bonus) +
                Number(selectedSalaryData?.allowance) -
                Number(amountDed),
              selectedSalaryData?.deductibles
            )}{" "}
            €
          </p>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Offer
            </Button>
            <Button
              disabled={false}
              style={{ marginLeft: "10px" }}
              type="default"
              onClick={() => {
                generatePayslip(selectedSalaryData);
              }}
            >
              Download PDF
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    )
  );
};

interface UserFilter {
  [key: string]: any;
}

interface UserSort {
  [column: string]: string;
}

export default function Wages() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSalaryData, setSelectedSalaryData] = useState<Salary>();
  const [deductibles, setDeductibles] = useState([]);
  const [amountDed, setAmountDed] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [userFilter, setUserFilter] = useState<UserFilter>({});
  const [userSort, setUserSort] = useState<UserSort>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [refetch, setRefetch] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  const searchInput = useRef<any>(null);
  const { userPermissions, theme } = useGlobalContext();

  const canViewSalaries = userPermissions.includes('View Salaries');
  const router = useRouter();



  const handleFilterChange = (pagination: any, filters: any, sorter: any) => {
    console.log(filters);
    setUserFilter(filters);
    setUserSort({
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

  useEffect(() => {
    // Update the time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date: any) => {
    const daySuffix = (day: any) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `This is the ${day}${daySuffix(
      day
    )} of ${month}, ${year}, ${hours}:${minutes}`;
  };

  const calculateMonthEndInfo = () => {
    const now = new Date();
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ); // Set to end of the day
    const remainingTime = lastDayOfMonth.getTime() - now.getTime();

    if (remainingTime < 0) {
      return "The month has ended.";
    }

    const daysRemaining = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);

    if (daysRemaining === 0 && hoursRemaining === 0)
      return `This is the last hour of the month!`;
    if (daysRemaining === 0)
      return `There are ${hoursRemaining} hours left until the end of the month.`;
    if (hoursRemaining === 0)
      return `There is ${daysRemaining} day left until the end of the month.`;
    if (daysRemaining === 1)
      return `There is ${daysRemaining} day and ${hoursRemaining} hours left until the end of the month.`;
    if (hoursRemaining === 1)
      return `There are ${daysRemaining} days and ${hoursRemaining} hour left until the end of the month.`;
    return `There are ${daysRemaining} days and ${hoursRemaining} hours left until the end of the month.`;
  };

  const showCreateSalaryWarning = (userId: number) => {
    Modal.confirm({
      title: "This employee does not yet have a salary.",
      content: "Would you like to create a salary?",
      okText: "Create salary!",
      cancelText: "Cancel",
      onOk: () => {
        setAmountDed(0);
        setSelectedSalaryData({
          user_id: userId,
          base_salary: 0,
          bonus: 0,
          allowance: 0,
          salary_id: 0,
          deduction_type: "",
          deduction_amount: 0,
          effective_date: "",
          old_salary: 0,
          new_salary: 0,
          deductibles: [],
          agreed: false,
        });
        setIsModalVisible(true);
      },
    });
  };

  const showModal = async (userId: number) => {
    try {
      const response = await fetch(`/api/salary/${userId}`);
      const deductiblesResponse = await fetch(`api/deductibles`);
      const data = await response.json();
      const deductiblesData = await deductiblesResponse.json();
      if (data.success) {
        console.log(data.salary);
        setSelectedSalaryData(data.salary);
        let amountDeductible = 0;
        data.salary.deductibles.forEach((d: any) => {
          if (d.amount != null) {
            amountDeductible += d.amount;
          }
        });
        setAmountDed(amountDeductible);
        setIsModalVisible(true);
      } else {
        showCreateSalaryWarning(userId);
      }

      if (deductiblesData.success) {
        setDeductibles(deductiblesData.deductibles);
      } else {
        toast.error("Error fetching deductibles");
      }
    } catch (error) {
      console.error("Error fetching salary data", error);
      toast.error("Error fetching salary data");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: (param?: FilterConfirmProps) => void
  ) => {
    clearFilters();
    confirm();
  };

  useEffect(() => {
    const fetchUsersAndTheirCourses = async () => {
      try {
        setLoading(true);
        const queryParams = `${buildQueryString(
          userFilter,
          userSort
        )}&page=${currentPage}&limit=${pageSize}`;
        const res = await fetch(`/api/user-salaries?${queryParams}`);
        const data = await res.json();

        if (data.success) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
        } else {
          console.error("Failed to fetch users", data.error);
        }

        if (!canViewSalaries) {
          router.push('/forbidden');
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

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

    fetchUsersAndTheirCourses();
    fetchDepartment();
    fetchPositions();
  }, [userFilter, userSort, currentPage, pageSize, refetch]);

  const getColumnSearchProps = (dataIndex: any): ColumnType<DataType> => {
    if (
      ["department_name", "position_title", "salary_status"].includes(dataIndex)
    ) {
      return {
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          close,
        }: FilterDropdownProps) => (
          <div style={{ padding: 8 }}>
            <Select
              placeholder={`Select a status`}
              value={selectedKeys[0]}
              onChange={(value: any) => setSelectedKeys(value ? [value] : [])}
              style={{ marginBottom: 8, width: 120 }}
              allowClear
            >
              {dataIndex === "department_name" &&
                departments.map((department: any, index: number) => (
                  <Select.Option key={index} value={department.department_name}>
                    {department.department_name}
                  </Select.Option>
                ))}
              {dataIndex === "position_title" &&
                positions.map((position: any, index: number) => (
                  <Select.Option key={index} value={position.position_title}>
                    {position.position_title}
                  </Select.Option>
                ))}
              {dataIndex === "salary_status" && (
                <>
                  <Select.Option key={"salary_ok"} value={"salary_ok"}>
                    <CheckCircleFilled
                      style={{ color: "#4CAF50", fontSize: "20px" }}
                    />
                  </Select.Option>
                  <Select.Option
                    key={"salary_pending"}
                    value={"salary_pending"}
                  >
                    <ClockCircleFilled
                      style={{ color: "#FFC107", fontSize: "20px" }}
                    />
                  </Select.Option>
                  <Select.Option key={"salary_nok"} value={"salary_nok"}>
                    <ExclamationCircleFilled
                      style={{ color: "#FF5733", fontSize: "20px" }}
                    />
                  </Select.Option>
                </>
              )}
            </Select>
            <br></br>
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                Filter
              </Button>
              <Button
                onClick={() =>
                  clearFilters && handleReset(clearFilters, confirm)
                }
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
        onFilter:
          dataIndex === "salary_status"
            ? (value: any, record: any) =>
                value === "salary_ok"
                  ? record.base_salary != null
                    ? true
                    : false
                  : record.base_salary != null
                  ? false
                  : true
            : (value: any, record: any) =>
                record[dataIndex]
                  ? record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes((value as string).toLowerCase())
                  : false,
      };
    } else {
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
                onClick={() =>
                  clearFilters && handleReset(clearFilters, confirm)
                }
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
          userFilter[dataIndex]
            ? renderHighlightText(
                text ? text.toString() : "",
                userFilter[dataIndex][0]
              )
            : text,
      };
    }
  };

  const userColumns = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: true,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      ...getColumnSearchProps("first_name"),
    },
    {
      title: "Surname",
      dataIndex: "last_name",
      key: "last_name",
      sorter: true,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      ...getColumnSearchProps("last_name"),
    },
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      ...getColumnSearchProps("department_name"),
    },
    {
      title: "Position",
      dataIndex: "position_title",
      key: "position_title",
      ...getColumnSearchProps("position_title"),
    },
    {
      title: "Salary status",
      dataIndex: "salary_status",
      key: "salary_status",
      render: (_: any, record: any) => {
        if (record.base_salary == null) {
          return (
            <ExclamationCircleFilled
              style={{ color: "#FF5733", fontSize: "25px" }}
            />
          );
        } else if (!record.agreed) {
          return (
            <ClockCircleFilled style={{ color: "#FFC107", fontSize: "25px" }} />
          );
        } else {
          return (
            <CheckCircleFilled style={{ color: "#4CAF50", fontSize: "25px" }} />
          );
        }
      },
      ...getColumnSearchProps("salary_status"),
    },
  ];

  return (
    console.log(users),
    (
      !canViewSalaries && <div className="loading_spinner">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
      </div> ||
      <Layout>
        <h2>{formatDateTime(currentTime)}</h2>
        <p>{calculateMonthEndInfo()}</p>

        <CustomTableTwo
          data={users}
          columns={userColumns}
          sideModalFeature={true}
          showModal={showModal}
          onChange={handleFilterChange}
          loading={loading}
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
        {isModalVisible && (
          <SalaryModal
            handleCancel={handleCancel}
            isModalVisible={isModalVisible}
            selectedSalaryData={selectedSalaryData}
            setSelectedSalaryData={setSelectedSalaryData}
            deductibles={deductibles}
            amountDed={amountDed}
            setRefetch={setRefetch}
            refetch={refetch}
            setIsModalVisible={setIsModalVisible}
          />
        )}
      </Layout>
    )
  );
}
