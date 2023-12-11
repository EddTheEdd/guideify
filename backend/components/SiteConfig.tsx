"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  DeleteFilled,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UndoOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Button,
  theme,
  Table,
  Input,
  Space,
  Pagination,
  message,
  Divider,
  Tag,
  Tooltip,
  Select,
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
import DepartmentsConfig from "./DepartmentsConfig";
import PositionsConfig from "./PositionsConfig";
import currencies from "@/app/config/currencies";

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

const SiteConfig: React.FC = () => {
  const [departments, setDepartments] = useState<any>([]);
  const [positions, setPositions] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [depsExpanded, setDepsExpanded] = useState(false);
  const [posExpanded, setPosExpanded] = useState(false);
  const [deductibles, setDeductibles] = useState<any>([]);
  const [currency, setCurrency] = useState("USD");
  const [defaultEntriesPerPage, setDefaultEntriesPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);

    const fetchDepartment = async () => {
      try {
        const res = await fetch(`/api/departments`);
        const data = await res.json();

        if (data.success) {
          console.log(data.departments);
          const tempDepartments = data.departments;
          // add input: locked to all departments
          tempDepartments.map((department: any) => {
            department.inputLocked = true;
            department.forDeletion = false;
          });
          setDepartments(tempDepartments);
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
          const tempPositions = data.positions;

          tempPositions.map((position: any) => {
            position.inputLocked = true;
            position.forDeletion = false;
          });
          setPositions(tempPositions);
        } else {
          console.error("Failed to fetch positions", data.error);
        }
      } catch (error) {
        console.error("Error fetching positions", error);
      }
    };

    const fetchDeductibles = async () => {
      try {
        const res = await fetch(`/api/deductibles`);
        const data = await res.json();

        if (data.success) {
          const tempDeductibles = data.deductibles;
          tempDeductibles.map((ded: any) => {
            ded.inputLocked = true;
            ded.forDeletion = false;
          });
          setDeductibles(tempDeductibles);
        } else {
          console.error("Failed to fetch positions", data.error);
        }
      } catch (error) {
        console.error("Error fetching positions", error);
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/config`);
        const data = await res.json();

        if (data.success) {
          setCurrency(data.config.currency);
          setDefaultEntriesPerPage(data.config.defaultEntriesPerPage);
        } else {
          console.error("Failed to fetch positions", data.error);
        }
      } catch (error) {
        console.error("Error fetching positions", error);
      }
    };

    fetchDepartment();
    fetchPositions();
    fetchDeductibles();
    fetchConfig();

    setLoading(false);
  }, [refetch]);

  const saveCurrency = async () => {
    try {
      const result = await axios.post(`/api/config`, { currency });
      console.log(result);
      message.success("Currency config saved successfully");
    } catch (error) {
      console.error("Error saving currency", error);
    }
    setRefetch(!refetch);
  };

  const savePagination = async () => {
    try {
      const result = await axios.post(`/api/config`, { defaultEntriesPerPage });
      console.log(result);
      message.success("Pagination config saved successfully");
    } catch (error) {
      console.error("Error saving currency", error);
    }
    setRefetch(!refetch);
  };

  return (
    console.log(departments),
    console.log(deductibles),
    (
      <div>
        <Divider orientation="left">Positions and Departments</Divider>
        <span>
          Departments:{" "}
          {
            <DownOutlined
              className={`flip ${depsExpanded ? "flipped" : ""}`}
              onClick={() => setDepsExpanded(!depsExpanded)}
            />
          }
        </span>
        {depsExpanded && (
          <DepartmentsConfig
            departments={departments}
            setDepartments={setDepartments}
            refetch={refetch}
            setRefetch={setRefetch}
          />
        )}
        <br></br>
        <span>
          Positions:{" "}
          {
            <DownOutlined
              className={`flip ${posExpanded ? "flipped" : ""}`}
              onClick={() => setPosExpanded(!posExpanded)}
            />
          }
        </span>
        {posExpanded && (
          <PositionsConfig
            positions={positions}
            setPositions={setPositions}
            refetch={refetch}
            setRefetch={setRefetch}
          />
        )}
        <Divider orientation="left">Deductibles</Divider>

        <Divider orientation="left">Currency Settings</Divider>
        <Select
          style={{ width: "100px" }}
          onChange={(value) => setCurrency(value)}
          value={currency}
        >
          {currencies.map((currency, index) => (
            <Select.Option key={index} value={currency.name}>
              {currency.name} ({currency.symbol})
            </Select.Option>
          ))}
        </Select>
        <Button
          type="default"
          onClick={() => saveCurrency()}
          style={{
            marginTop: "20px",
          }}
        >
          Save Currency
        </Button>
        <Divider orientation="left">Pagination Settings</Divider>
        <Input
          value={defaultEntriesPerPage}
          onChange={(e: any) => {
            setDefaultEntriesPerPage(e.target.value);
          }}
        />
        <Button
          type="default"
          onClick={() => savePagination()}
          style={{
            marginTop: "20px",
          }}
        >
          Save Pagination
        </Button>
      </div>
    )
  );
};

export default SiteConfig;
