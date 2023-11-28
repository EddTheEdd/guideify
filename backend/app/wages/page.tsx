"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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
  Select,
} from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
}

interface Salary {
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
}

const SalaryModal = ({
  handleCancel,
  isModalVisible,
  selectedSalaryData,
  setSelectedSalaryData,
  deductibles,
  amountDed,
}) => {
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
    console.log(selectedSalaryData);
    try {
      await axios.post(`/api/salary/${selectedSalaryData?.user_id}`, selectedSalaryData);
      toast.success("Course created successfully");
    } catch (error) {
      toast.error("Error creating course");
      console.error("Error creating course", error);
    }
  };

  return (
    <Drawer
      title="Salary Details"
      placement="right"
      closable={true}
      onClose={handleCancel}
      visible={isModalVisible}
      width={720}
    >
      {/* Modal content here */}
      <Form
        layout="vertical"
        data={selectedSalaryData}
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
                    const deductibleIndex = updatedSalary.deductibles.findIndex(
                      (d: any) => d.deductible_id === deductible.deductible_id
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
        {selectedSalaryData?.deductibles.map((deductible: any, index: number) => {
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
        })}
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
            Save
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default function Wages() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSalaryData, setSelectedSalaryData] = useState<Salary>();
  const [deductibles, setDeductibles] = useState([]);
  const [amountDed, setAmountDed] = useState(0);

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
        toast.error("Error fetching salary data");
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          console.error("Failed to fetch courses", data.error);
        }
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

    fetchUsers();
  }, []);

  const userColumns = [
    {
      title: "Vārds",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Uzvārds",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
    },
    {
      title: "Position",
      dataIndex: "position_title",
      key: "position_title",
    },
  ];

  return (
    <Layout>
      <CustomTableTwo
        data={users}
        columns={userColumns}
        sideModalFeature={true}
        showModal={showModal}
      />
      {isModalVisible && (
        <SalaryModal
          handleCancel={handleCancel}
          isModalVisible={isModalVisible}
          selectedSalaryData={selectedSalaryData}
          setSelectedSalaryData={setSelectedSalaryData}
          deductibles={deductibles}
          amountDed={amountDed}
        />
      )}
    </Layout>
  );
}
