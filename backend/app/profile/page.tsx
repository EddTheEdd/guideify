"use client";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import { DatePicker, Divider, Form, Input } from "antd";
import dayjs from "dayjs";
import PhoneInput from "antd-phone-input";

interface UserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  phone_number: string;
}

export default function ProfilePage({ params }: any) {
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    date_of_birth: new Date(),
    phone_number: "",
  });
  const [form] = Form.useForm();

  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get("/api/users/me");
      const fetchedUserData = res.data.user;

      // Handle date conversion
      const formattedUserData = {
        ...fetchedUserData,
        date_of_birth: fetchedUserData.date_of_birth
          ? dayjs(fetchedUserData.date_of_birth).toDate()
          : null,
      };

      setUserData(formattedUserData);
      form.setFieldsValue(formattedUserData); // Set form values here
    };

    getUserDetails();
  }, []); // Removed userData from dependencies

  return (
    <Layout>
      <div style={{maxWidth: "600px", margin: "auto", padding: "30px", borderRadius: "14px"}}>
        <Form form={form} key={userData.username}>
          <Divider>Account Data:</Divider>
          <Form.Item
            name="username"
            label={`Username`}
          >
            <Input disabled={true} placeholder="Username" />
          </Form.Item>
          <Form.Item name="email" label={`Email`}>
            <Input disabled={true} placeholder="Email" />
          </Form.Item>
          <Divider>User Profile:</Divider>
          <Form.Item required={false} name="first_name" label="First Name">
            <Input disabled={true} placeholder="First Name" />
          </Form.Item>
          <Form.Item required={false} name="last_name" label="Last Name">
            <Input disabled={true} placeholder="Last Name" />
          </Form.Item>
          <Form.Item
            required={false}
            name="date_of_birth"
            label="Date Of Birth"
          >
            <DatePicker disabled={true} placeholder="Date of Birth" />
          </Form.Item>
          <Form.Item required={false} name="phone_number" label="Phone Number">
            <PhoneInput disabled={true} enableSearch />
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
}
