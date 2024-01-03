"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Layout";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  message,
} from "antd";
import CustomTableTwo from "@/components/CustomTableTwo";
import { useGlobalContext } from "@/contexts/GlobalContext";
import type { ColumnType, ColumnsType } from "antd/es/table";
import {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import { renderHighlightText } from "@/helpers/renderHighlightText";
import { buildQueryString } from "../helpers/buildQueryString";
import CourseModal from "@/components/CourseModal";
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

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface CoursesFilter {
  [key: string]: any;
}

interface CoursesSort {
  [column: string]: string;
}

export default function Courses() {
  const { userPermissions, theme } = useGlobalContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const searchInput = useRef<any>(null);
  const [coursesFilter, setCoursesFilter] = useState<CoursesFilter>({});
  const [coursesSort, setCoursesSort] = useState<CoursesSort>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [coursesCount, setCoursesCount] = useState(0);
  const [refetch, setRefetch] = useState(false);
  const [loading, setLoading] = useState(true);
  const canEditCourses = userPermissions.includes("Edit Courses");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/roles/names");
        const data = await res.json();

        if (data.success) {
          console.log(data.roles);
          setRoles(data.roles);
        } else {
          console.error("Failed to fetch roles", data.error);
        }
      } catch (error) {
        console.error("Error fetching roles", error);
      }
    };

    const fetchCourses = async () => {
      try {
        const queryParams = `${buildQueryString(
          coursesFilter,
          coursesSort
        )}&page=${currentPage}&limit=${pageSize}`;
        const res = await fetch(`/api/courses?${queryParams}`);
        const data = await res.json();

        if (data.success) {
          setCourses(data.courses);
          setCoursesCount(data.coursesCount);
          setLoading(false);
        } else {
          console.error("Failed to fetch courses", data.error);
        }
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

    canEditCourses && fetchRoles(); // fetch roles only if user can edit courses
    fetchCourses();
  }, [
    coursesFilter,
    coursesSort,
    currentPage,
    pageSize,
    refetch,
    canEditCourses,
  ]);

  const showModal = () => {
    setModalVisible(true);
  };

  const handleFilterChange = (pagination: any, filters: any, sorter: any) => {
    console.log(filters);
    setCoursesFilter(filters);
    setCoursesSort({
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

  const handleCancel = () => {
    setModalVisible(false);
  };

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
        coursesFilter[dataIndex]
          ? renderHighlightText(
              text ? text.toString() : "",
              coursesFilter[dataIndex][0]
            )
          : text,
    };
  };

  const courseColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: any, record: any) => ({
        props: {
          style: { borderLeft: `6px solid ${record.rgb_value}` },
        },
        children: <div>{text}</div>,
      }),
      sorter: true,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: true,
      ...getColumnSearchProps("description"),
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Unit) => (
        <>
          <Link href={`/courses/view/${record.id}`}>View</Link>
          {canEditCourses && (
            <Link style={{ marginLeft: "13px" }} href={`/courses/${record.id}`}>
              Edit
            </Link>
          )}
        </>
      ),
    },
  ];

  return (
    <Layout>
      <CustomTableTwo
        loading={loading}
        data={courses}
        columns={courseColumns}
        sideModalFeature={false}
        showModal={() => {}}
        onChange={handleFilterChange}
      />
      {canEditCourses && (
        <Button onClick={showModal} style={{ marginTop: "13px" }}>
          Create a Course
        </Button>
      )}
      <Pagination
        style={{marginTop: "13px"}}
        className="tower_element"
        current={currentPage}
        total={coursesCount}
        pageSize={pageSize}
        onChange={handlePageChange}
        onShowSizeChange={handlePageSizeChange}
        showSizeChanger
        showQuickJumper
      />
      {modalVisible && (
        <CourseModal
          modalData={{}}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          setRefetch={setRefetch}
          refetch={refetch}
          roles={roles}
        />
      )}
    </Layout>
  );
}
