"use client";
import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Table } from 'antd';
import LayoutTwo from "../../components/Layout";
import { useGlobalContext } from "@/contexts/GlobalContext";


const { Header, Sider, Content } = Layout;

const Home: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { userPermissions } = useGlobalContext();
    
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const activityColumns = [
    {
      title: 'Alert Title',
      dataIndex: 'alert_title',
      key: 'alert_title',
    },
    {
      title: 'Part Of Application',
      dataIndex: 'part_of_application',
      key: 'part_of_application',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    }
  ]

  const mockData = [
    {
      key: '1',
      alert_title: 'You have a new salary offer!',
      part_of_application: 'My Salary',
      time: '48 minutes ago'
    },
    {
      key: '2',
      alert_title: 'New Course Added',
      part_of_application: 'My Courses',
      time: '2 hours ago'
    },
    {
      key: '3',
      alert_title: 'Your course has been reviewed!',
      part_of_application: 'Course',
      time: '3 hours ago'
    },
    {
      key: '4',
      alert_title: 'New Course Added',
      part_of_application: 'My Courses',
      time: '4 hours ago'
    }
  ];

  return (
    <LayoutTwo style={{background: "blue"}}>
      
      <div className="welcome_text_container">
        <div className="welcome_text">
          <h1>Welcome to EMAGA!</h1>
          <h2>Employee Management And Growth Application</h2>
          <h3>Here are your alerts on new activity *mock example*:</h3>
          <Table className="alert_table" columns={activityColumns} dataSource={mockData}/>
        </div>
      </div>
    </LayoutTwo>
  );
};

export default Home;
