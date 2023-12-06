"use client";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  LoadingOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
  UnlockOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  theme,
  Table,
  Input,
  Space,
  Pagination,
  Spin,
  Modal,
  Divider,
  Form,
  DatePicker,
  Dropdown,
  Select,
} from "antd";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useRouter } from "next/navigation";
import {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { ColumnType } from "antd/lib/table";
import { renderHighlightText } from "@/helpers/renderHighlightText";
import axios from "axios";

interface Props {
  onFinish: (value: any) => void;
  modalVisible: boolean;
  handleCancel: () => void;
  modalData: any;
  departments: any;
  positions: any;
  onOk: () => void;
}

const UserModal: React.FC<Props> = ({
  onFinish,
  modalVisible,
  handleCancel,
  modalData,
  departments,
  positions,
  onOk,
}) => {
  console.log("Modal data:");
  console.log(modalData);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("filler");
  const [email, setEmail] = useState(modalData?.email || "");
  const [form] = Form.useForm();

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return /[A-Z]/.test(password);
  };

  useEffect(() => {
    setIsEmailValid(emailTouched && validateEmail(email));
    setIsPasswordValid(passwordTouched && validatePassword(password));
  }, [email, password, emailTouched, passwordTouched]);

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const initialValues = {
    username: modalData.username,
    email: modalData.email,
    password: "filler",
    first_name: modalData.first_name,
    last_name: modalData.last_name,
    date_of_birth: modalData.date_of_birth
      ? dayjs(modalData.date_of_birth)
      : null,
    phone_number: modalData.phone_number,
    department_name: modalData.department_name,
    position_title: modalData.position_title,
  };

  useEffect(() => {
    form.resetFields(); // Resets all fields
    form.setFieldsValue(initialValues); // Sets new values
    setIsLocked(true);
    setPassword("filler");
  }, [modalData, form]);

  return (
    <Modal
      className="user_modal"
      title={modalData?.username ? "Update User Data" : "Create New User"}
      open={modalVisible}
      onCancel={handleCancel}
      onOk={onOk}
      okText={"Delete"}
    >
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
        key={modalData.id}
      >
        <Divider>Account Data:</Divider>
        <Form.Item name="username" label="Username">
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="email"
          label={`Email ${modalData?.username ? "(not editable)" : ""}`}
          validateStatus={emailTouched && !isEmailValid ? "error" : ""}
          help={emailTouched && !isEmailValid && "Please enter a valid email"}
        >
          <Input
            placeholder="Email"
            disabled={modalData?.username}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!emailTouched) setEmailTouched(true);
            }}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          validateStatus={passwordTouched && !isPasswordValid ? "error" : ""}
          help={
            passwordTouched &&
            !isPasswordValid &&
            "Password must contain at least one capital letter"
          }
        >
          <Input.Password
            placeholder="Password"
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
              if (!passwordTouched) setPasswordTouched(true);
            }}
            disabled={isLocked}
            addonAfter={
              <Button
                type="text"
                icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
                onClick={toggleLock}
              />
            }
          />
        </Form.Item>
        <Divider>User Profile:</Divider>
        <Form.Item name="first_name" label="First Name">
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item name="last_name" label="Last Name">
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item name="date_of_birth" label="Date Of Birth">
          <DatePicker placeholder="Date of Birth" />
        </Form.Item>
        <Form.Item name="phone_number" label="Phone Number">
          <Input placeholder="Phone Number" />
        </Form.Item>
        <Form.Item name={"department_name"} label="Department Name">
          <Select>
            {departments.map((department: any, index: number) => (
              <Select.Option value={department.department_name} key={index}>
                {department.department_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name={"position_title"} label="Position">
          <Select>
            {positions.map((position: any, index: number) => (
              <Select.Option value={position.position_title} key={index}>
                {position.position_title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {modalData?.username ? "Save" : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
