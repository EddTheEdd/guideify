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
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loginFail, setLoginFail] = useState(false);

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

  const onLogin = async () => {
    setLoginFail(false);
    console.log(1);
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });
      console.log("Login success", response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem("currency", response.data.site_config.currency);
      }
      router.push("/home");
    } catch (error: any) {
      setLoginFail(true);
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

  return (
    <>
      <div className="login-container">
        <div
          className={`login-form ${loading && "loading"}`}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {!loading && (
            <>
              <Form onFinish={onLogin}>
                <h1 style={{ textAlign: "center" }}>EMAG</h1>
                <h2 style={{ textAlign: "center" }}>
                  Employee Management System
                </h2>
                {loginFail && (
                  <p style={{ color: "red", textAlign: "center" }}>
                    Email or password is incorrect!
                  </p>
                )}
                {!loading && (
                  <>
                    <Form.Item label="Email">
                      <Input
                        placeholder="Enter your email"
                        name="email"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (!emailTouched) setEmailTouched(true);
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="Password">
                      <Input.Password
                        placeholder="Enter your password"
                        name="password"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (!passwordTouched) setPasswordTouched(true);
                        }}
                      />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                      Login
                    </Button>
                  </>
                )}
              </Form>
              <p>
                Forgot your password? Contact the administrator for a reset
                here!
              </p>
            </>
          )}
          {loading && (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />}
              />
          )}
        </div>
      </div>
      <div className="footer">
        <p>Current version: 0.1.2.9, 03.01.2023 version</p>
      </div>
    </>
  );
}
