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
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<any>(null);
  const [subTableData, setSubTableData] = useState(new Map()); // New state for storing processed sub-table data
  const [subTableFilters, setSubTableFilters] = useState(new Map());
  const [subTableSorters, setSubTableSorters] = useState(new Map());

  const filterData = (data: any[], filters: any) => {
    return data.filter((item: any) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) {
          return true;
        }

        if (key === "course_status") {
          let status = "in progress";
          if (item.completed) {
            status = "completed";
          } else if (item.submitted) {
            status = "submitted";
          }
          return status === filters[key].toString().toLowerCase();
        }

        const itemValue = item[key]?.toString().toLowerCase();
        const filterValue = filters[key].toString().toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  };

  const sortData = (data: any[], sorter: any) => {
    if (!sorter || !sorter.columnKey || !sorter.order) {
      return data;
    }

    return [...data].sort((a, b) => {
      const valueA = a[sorter.columnKey];
      const valueB = b[sorter.columnKey];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sorter.order === "ascend"
          ? valueA.localeCompare(valueB, undefined, { sensitivity: "base" })
          : valueB.localeCompare(valueA, undefined, { sensitivity: "base" });
      }

      if (valueA < valueB) {
        return sorter.order === "ascend" ? -1 : 1;
      } else if (valueA > valueB) {
        return sorter.order === "ascend" ? 1 : -1;
      }
      return 0;
    });
  };

  const onSubTableFilterChange = (recordKey: any, filters: any) => {
    console.log(recordKey);
    console.log(filters);
    setSubTableFilters((prev) => new Map(prev).set(recordKey, filters));
  };

  const onSubTableSorterChange = (recordKey: any, sorter: any) => {
    setSubTableSorters((prev) => new Map(prev).set(recordKey, sorter));
  };

  const applyFilterAndSortToSubTables = () => {
    const newSubTableData = new Map();

    data.forEach((mainRecord) => {
      let subData = mainRecord.courses;
      const filters = subTableFilters.get(mainRecord.key) || {};
      const sorter = subTableSorters.get(mainRecord.key) || {};
      console.log(filters);
      console.log(subData);
      subData = filterData(subData, filters);
      subData = sortData(subData, sorter);

      newSubTableData.set(mainRecord.key, subData);
    });
    console.log(newSubTableData);
    setSubTableData(newSubTableData);
  };

  useEffect(() => {
    applyFilterAndSortToSubTables();
  }, [data, subTableFilters, subTableSorters]);

  const handleSubtablePageChange = (
    recordId: number,
    page: number,
    pageSize: number
  ) => {
    setPaginationStates((prev: any) => ({
      ...prev,
      [recordId]: { currentPage: page, pageSize },
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
          let status = "in progress";
          if (record.completed) {
            status = "completed";
          } else if (record.submitted) {
            status = "submitted";
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
      sorter: true,
      ...getColumnSearchProps("course_name"),
    },
    {
      title: "Unit Title",
      dataIndex: "unit_title",
      key: "unit_title",
      sorter: true,
      ...getColumnSearchProps("unit_title"),
    },
    {
      title: "User Course Status",
      dataIndex: "course_status",
      key: "course_status",
      sorter: false,
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
          {record.unit_content_type === "quest" && (record.submitted || record.completed) && (
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
    const processedData = subTableData.get(record.key) || [];
    const defaultEntriesPerPage: number = parseInt(localStorage.getItem("defaultEntriesPerPage") || "3");
    const pageState = paginationStates[record.key] || {
      currentPage: 1,
      pageSize: defaultEntriesPerPage || 3,
    };
    const indexOfLastItem = pageState.currentPage * pageState.pageSize;
    const indexOfFirstItem = indexOfLastItem - pageState.pageSize;
    const currentData = processedData.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <>
        <CustomTableFour
          data={currentData}
          fullData={processedData}
          columns={subColumns}
          onFilterChange={(filters) =>
            onSubTableFilterChange(record.key, filters)
          }
          onSorterChange={(sorter) =>
            onSubTableSorterChange(record.key, sorter)
          }
        />
        <Pagination
          current={pageState.currentPage}
          pageSize={pageState.pageSize}
          total={processedData.length}
          onChange={(page, pageSize) =>
            handleSubtablePageChange(record.key, page, pageSize)
          }
          showSizeChanger
          showQuickJumper
        />
      </>
    );
  };

  data = data.map((item) => {
    item.key = item.user_id;
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
