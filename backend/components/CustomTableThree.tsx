"use client";
// CustomTable.tsx
import { Button, Input, Pagination, Select, Space, Table, Tag } from "antd";
import Link from "next/link";
import CustomTableFour from "./CustomTableFour";
import React, { useEffect, useRef, useState } from "react";
import type { ColumnType, ColumnsType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";

interface Props {
  data: any[];
  columns?: any[];
  onChange?: any;
}

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface FilterDropdownProps {
  setSelectedKeys: (keys: string[]) => void;
  selectedKeys: React.Key[];
  confirm: () => void;
  clearFilters?: () => void;
  close: () => void;
}

type DataIndex = keyof DataType;

const CustomTableThree: React.FC<Props> = ({ data, columns, onChange }) => {

  const [paginationStates, setPaginationStates] = useState<any>({});

  const handleSubtablePageChange = (recordId: number, page: number, pageSize: number) => {
    setPaginationStates((prev: any) => ({
      ...prev,
      [recordId]: { currentPage: page, pageSize }
    }));
  };

  
  const getColumnSearchProps = (dataIndex: any): ColumnType<DataType> => {
    if (dataIndex === "course_status") {
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
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="submitted">Submitted</Select.Option>
              <Select.Option value="in progress">In Progress</Select.Option>
            </Select>
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
        onFilter: (value, record: any) => {
          let status = 'in progress';
          if (record.completed) {
            status = 'completed';
          } else if (record.submitted) {
            status = 'submitted';
          }
          return status === value;
        },
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
              onPressEnter={() =>
                handleSearch(selectedKeys as string[], confirm, dataIndex)
              }
              style={{ marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() =>
                  handleSearch(selectedKeys as string[], confirm, dataIndex)
                }
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
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
          if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
        render: (text) =>
          searchedColumn === dataIndex
            ? renderHighlightText(text ? text.toString() : "", searchText)
            : text,
      };
    }
  };

  const subColumns = [
    {
      title: "Course Name",
      dataIndex: "course_name",
      key: "course_name",
      sorter: (a: any, b: any) => alphabeticalSort(a, b, "course_name"),
      ...getColumnSearchProps("course_name"),
    },
    {
      title: "Unit Title",
      dataIndex: "unit_title",
      key: "unit_title",
      sorter: (a: any, b: any) => alphabeticalSort(a, b, "unit_title"),
      ...getColumnSearchProps("unit_title"),
    },
    {
      title: "User Course Status",
      dataIndex: "course_status",
      key: "course_status",
      sorter: (a: any, b: any) =>
        alphabeticalSort(a, b, "course_status"),
      render: (_: any, record: any) => (
        <>
          {(record.completed && <Tag color="green">Completed</Tag>) ||
            (record.submitted && <Tag color="pink">Submitted</Tag>) || (
              <Tag color="blue">In Progress</Tag>
            )}
        </>
      ),
      ...getColumnSearchProps("course_status"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <>
          <Link href={`/courses/view/${record.course_id}`}>Course</Link>
          {record.unit_content_type === "quest" && (
            <Link
              style={{ marginLeft: "13px" }}
              href={`/unit/submission/${record.progress_id}`}
            >
              Submission
            </Link>
          )}
        </>
      ),
    },
  ];

  const expandedRowRender = (record: any) => {
    const pagState = paginationStates[record.key] || { currentPage: 1, pageSize: 10 };
    const indexOfLastItem = pagState.currentPage * pagState.pageSize;
    const indexOfFirstItem = indexOfLastItem - pagState.pageSize;
    const currentData = record.courses.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <>
        <CustomTableFour data={currentData} columns={subColumns} />
        <Pagination
          current={pagState.currentPage}
          pageSize={pagState.pageSize}
          total={record.courses.length}
          onChange={(page: number, pageSize: number) => handleSubtablePageChange(record.key, page, pageSize)}
          showSizeChanger
          showQuickJumper
        />
      </>
    );
  };


  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<any>(null);

  data = data.map((item) => {
    item.key = item.id;
    return item;
  });

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: (param?: FilterConfirmProps) => void
  ) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const alphabeticalSort = (a: any, b: any, dataIndex: any) => {
    const nameA = a[dataIndex].toUpperCase();
    const nameB = b[dataIndex].toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  };

  const renderHighlightText = (text: string, searchText: string) => {
    if (!searchText) {
      return text;
    }

    const parts = text.split(new RegExp(`(${searchText})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === searchText.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: "#ffc069" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <Table
      dataSource={data}
      columns={columns}
      onChange={onChange}
      pagination={false}
      expandable={{ expandedRowRender }}
    />
  );
};

export default CustomTableThree;
