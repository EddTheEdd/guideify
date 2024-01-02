"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "@/components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Pagination, Table, message } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import { CheckCircleFilled, ClockCircleFilled, MinusCircleFilled } from "@ant-design/icons";
import { generatePayslip } from "@/helpers/generatePayslip";
import { buildQueryString } from "@/app/helpers/buildQueryString";

interface Salary {
  salary_id: number;
  user_id: string;
  base_salary: string;
  bonus: number;
  allowance: number;
  created_at: string;
  updated_at: string;
  agreed: boolean;
  signed: boolean;
}

interface SortProps {
  [column: string]: string;
}

export default function UserWages({ params }: any) {
  const id = params.id;
  const defaultEntriesPerPage: number = parseInt(localStorage.getItem("defaultEntriesPerPage") || "10");
  const [usersSalaries, setUsersSalaries] = useState<Salary[]>([]);
  const [refetch, setRefetch] = useState(false);
  const [salarySort, setSalarySort] = useState<SortProps>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultEntriesPerPage || 10);
  const [totalSalaries, setTotalSalaries] = useState(0);



  useEffect(() => {
    const fetchAllUserSalaries = async () => {
      try {
        const queryParams = `${buildQueryString(
          {},
          salarySort
        )}&page=${currentPage}&limit=${pageSize}`;
        const res = await fetch(`/api/salary/${id}?getall=true&${queryParams}`);
        const data = await res.json();

        if (data.success) {
          const salariesWithKeys = data.salary.map((salary: Salary) => ({ ...salary, key: salary.salary_id }));
          setUsersSalaries(salariesWithKeys);
          setTotalSalaries(data.totalSalaries);
        } else {
          console.error("Failed to fetch user salary", data.error);
        }
      } catch (error) {
        console.error("Error fetching usersalaru", error);
      }
    };

    fetchAllUserSalaries();
  }, [refetch, salarySort, currentPage, pageSize]);

  const handleFilterChange = (pagination: any, filters: any, sorter: any) => {
    setSalarySort({
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

  const handleSign = (salary_id: number) => async () => {
    try {
      await axios.post(`/api/salary/${salary_id}/agree`, { salary_id });
      setRefetch(!refetch);
      message.success("Signed successfully");
    } catch (error) {
      message.error("Failed to sign");
    }
  };

  const salaryColumns = [
    {
      title: "Salary ID",
      dataIndex: "salary_id",
      key: "salary_id",
    },
    {
      title: "Base Salary",
      dataIndex: "base_salary",
      key: "base_salary",
      sorter: true
    },
    {
      title: "Bonus",
      dataIndex: "bonus",
      key: "bonus",
      sorter: true
    },
    {
      title: "Allowance",
      dataIndex: "allowance",
      key: "allowance",
      sorter: true
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => {
        return new Date(text).toLocaleDateString();
      },
      sorter: true
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text: string) => {
        return new Date(text).toLocaleDateString();
      },
      sorter: true
    },
    {
      title: "Agreed To",
      key: "agreed",
      render: (text: string, record: any) => {
        return (
          (record.agreed && (
            <CheckCircleFilled style={{ color: "#4CAF50", fontSize: "20px" }} />
          )) ||
          (record.signed && (
            <ClockCircleFilled style={{ color: "#FFC107", fontSize: "20px" }} />
          ))
          ||
          <MinusCircleFilled style={{ color: "grey", fontSize: "20px" }}  />
        );
      },
    },
    {
      title: "View Details",
      key: "view_details",
      // button for downloading the pdf:
      render: (text: string, record: any) => {
        return (
          <Button
            type="default"
            onClick={() => {
              generatePayslip(record);
            }}
          >
            Download PDF
          </Button>
        );
      },
    },
    {
      title: "Sign",
      key: "sign",
      // button for downloading the pdf:
      render: (text: string, record: any) => {
        return (
          (record.agreed && (
            <Button type="default" disabled={true}>
              Signed
            </Button>
          )) ||
          (record.signed && (
            <Button
              type="default"
              disabled={false}
              onClick={handleSign(record.salary_id)}
            >
              Sign
            </Button>
          ))
        );
      },
    },
  ];

  return (
    <Layout>
      <Table dataSource={usersSalaries} columns={salaryColumns} onChange={handleFilterChange} />
      <Pagination
          className="tower_element"
          current={currentPage}
          total={totalSalaries}
          pageSize={pageSize}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          showSizeChanger
          showQuickJumper
        />
    </Layout>
  );
}
