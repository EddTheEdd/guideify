"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button, Form, Input, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "", username: "" });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    console.log(1);
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });
      console.log("Login success", response.data);
      router.push("/profile");
    } catch (error: any) {
      console.log("Login failed", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.password.length > 0 &&
      user.username.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  return loading ? (
    // center the loading icon
    <div className="loading_spinner">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
    </div>
  ) : (
    <>
      <div className="login-container">
        <div className="login-form">
          <Form onFinish={onLogin}>
            <h1 style={{textAlign: "center"}}>EMAG</h1>
            <h2 style={{textAlign: "center"}}>Employee Management System</h2>
            <h1>Login</h1>
            <Form.Item label="Email">
              <Input
                placeholder="Enter your email"
                name="email"
                onChange={(e: any) => {
                  setEmail(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item label="Password">
              <Input
                style={{ color: "black" }}
                placeholder="Enter your password"
                name="password"
                type="password"
                onChange={(e: any) => {
                  setPassword(e.target.value);
                }}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form>
          <p>Forgot your password? Contact the administrator for a reset here!</p>
        </div>
      </div>
      {/* CREATE A FOOTER WITH CURRENT VERSION BELLOW: */}
      <div className="footer">
        <p>Current version: 0.1.0.9, 01.12.2023 version</p>
      </div>
    </>
  );
}
