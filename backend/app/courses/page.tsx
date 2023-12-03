"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal, Pagination, Select, Space } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/contexts/GlobalContext";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { FilterConfirmProps, FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import { renderHighlightText } from "@/helpers/renderHighlightText";
import { buildQueryString } from "../helpers/buildQueryString";

interface Course {
  id: number;
  name: string;
  description: string;
  units: number;
}

interface Unit {
  id: number;
  name: string;
  type: string; // For instance: 'text', 'video', or 'questionnaire'
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    description: "",
    units: 0,
    id: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const searchInput = useRef<any>(null);
  const [coursesFilter, setCoursesFilter] = useState<CoursesFilter>({});
  const [coursesSort, setCoursesSort] = useState<CoursesSort>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [coursesCount, setCoursesCount] = useState(0);

  const { userPermissions, theme } = useGlobalContext();
  const router = useRouter();
  const canEditCourses = userPermissions.includes("Edit Courses");

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
      } else {
        console.error("Failed to fetch courses", data.error);
      }
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("/api/units");
        const data = await res.json();

        if (data.success) {
          setUnits(data.units);
        } else {
          console.error("Failed to fetch units", data.error);
        }
      } catch (error) {
        console.error("Error fetching units", error);
      }
    };

    fetchUnits();

    fetchCourses();
  }, [coursesFilter, coursesSort, currentPage, pageSize]);

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

  const handleOk = async () => {
    try {
      await axios.post("/api/courses", newCourse);
      toast.success("Course created successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Error creating course");
      console.error("Error creating course", error);
    }
    setModalVisible(false);
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
      ...getColumnSearchProps("name")
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: true,
      ...getColumnSearchProps("description")
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      sorter: true
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Unit) => (
        <>
          <Link href={`/courses/view/${record.id}`}>View</Link>
          {canEditCourses && <Link style={{ marginLeft: "13px" }} href={`/courses/${record.id}`}>
            Edit
          </Link>}
        </>
      ),
    },
  ];

  return (
    <Layout>
      <CustomTableTwo
        data={courses}
        columns={courseColumns}
        sideModalFeature={false}
        showModal={() => {}}
        onChange={handleFilterChange}
      />
      <Button onClick={showModal}>Create a Course</Button>
      <Pagination
          className="tower_element"
          current={currentPage}
          total={coursesCount}
          pageSize={pageSize}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          showSizeChanger
          showQuickJumper
        />
      <Modal
        title="Create a Course"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Course Name"
          value={newCourse.name}
          onChange={(e: any) =>
            setNewCourse({ ...newCourse, name: e.target.value })
          }
        />

        <Input
          style={{ marginTop: "13px" }}
          placeholder="Course Description"
          value={newCourse.description}
          onChange={(e: any) =>
            setNewCourse({ ...newCourse, description: e.target.value })
          }
        />
      </Modal>
    </Layout>
  );
}
