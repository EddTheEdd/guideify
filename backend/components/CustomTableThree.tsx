// CustomTable.tsx
import { Table, Tag } from 'antd';
import React from 'react';
import Link from 'next/link';
import CustomTableFour from './CustomTableFour';

interface Props {
  data: any[];
  columns?: any[];
  onChange?: any;
}

const CustomTableThree: React.FC<Props> = ({ data, columns, onChange }) => {

  data = data.map((item) => {
    item.key = item.id;
    return item;
  });

  return (
      <Table 
        dataSource={data} 
        columns={columns}
        onChange={onChange}
        expandable={{
          expandedRowRender: (record: any) => {
            const columns = [
              {
                title: "Course Name",
                dataIndex: "course_name",
                key: "course_name",
              },
              {
                title: "Unit Title",
                dataIndex: "unit_title",
                key: "unit_title"
              },
              {
                title: "User Course Status",
                dataIndex: "course_status",
                key: "course_status",
                render: (_: any, record: any) => (
                  <>
                    {(record.completed && <Tag color="green">Completed</Tag>) || (record.submitted && <Tag color="pink">Submitted</Tag>) || <Tag color="blue">In Progress</Tag>}
                  </>
                ),
              },
              {
                title: "Actions",
                key: "actions",
                render: (_: any, record: any) => (
                  <>
                    <Link href={`/courses/view/${record.course_id}`}>Course</Link>
                    {record.unit_content_type === "quest" && <Link style={{ marginLeft: "13px" }} href={`/unit/submission/${record.progress_id}`}>
                      Submission
                    </Link>}
                  </>
                ),
              },
            ];
            return <CustomTableFour data={record.courses} columns={columns}/>;
          },
          rowExpandable: (record: any) => record.courses && record.courses.length !== 0,
        }}
      />
  );
};

export default CustomTableThree;
