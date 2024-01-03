"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Modal,
  Divider,
  Form,
  DatePicker,
  Select,
  InputNumber,
} from "antd";

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

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validateEmail = (email: any) => {
    console.log(email);
    if (!email || email.trim() === '') {
      return false; // Reject empty or only whitespace
    }
  
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    if (!password || password.trim() === '') {
      return false;
    }

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
    password: "PASSWORD_PLACEHOLDER",
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
    if (!modalData?.username) {initialValues.password = "";}
    form.setFieldsValue(initialValues); // Sets new values
    setIsLocked(true);
    setPassword("filler");
  }, [modalData, form]);

  return (
    console.log(modalData),
    <Modal
      className="user_modal"
      title={modalData?.username ? "Update User Data" : "Create New User"}
      open={modalVisible}
      onCancel={() => {setIsEmailValid(true); handleCancel();}}
      onOk={onOk}
      okText={"Delete"}
    >
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
        key={modalData.user_id}
      >
        <Divider>Account Data:</Divider>
        <Form.Item rules={[{ required: true, message: 'Username is requried' }]} name="username" label={`Username ${modalData?.username ? "(not editable)" : ""}`}>
          <Input disabled={modalData?.username} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="email"
          label={`Email ${modalData?.username ? "(not editable)" : ""}`}
          rules={[
            { required: true, message: 'Email is required!' },
            () => ({
              validator(_, value) {
                if (!value || validateEmail(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Please enter a valid email'));
              },
            }),
          ]}
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
          rules={[
            { required: true, message: 'Password is required!' },
            () => ({
              validator(_, value) {
                if (!value || validatePassword(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The password must contain atleast one uppercase letter'));
              },
            }),
          ]}
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
        <Form.Item required={false} name="first_name" label="First Name">
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item required={false} name="last_name" label="Last Name">
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item required={false} name="date_of_birth" label="Date Of Birth">
          <DatePicker placeholder="Date of Birth" />
        </Form.Item>
        <Form.Item required={false} name="phone_number" label="Phone Number">
          <InputNumber />
        </Form.Item>
        <Form.Item
          name={"department_name"}
          required={false}
          label="Department Name"
        >
          <Select>
            {departments.map((department: any, index: number) => (
              <Select.Option value={department.department_name} key={index}>
                {department.department_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name={"position_title"} required={false} label="Position">
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
