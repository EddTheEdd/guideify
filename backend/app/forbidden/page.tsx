"use client"
import React from "react";
import { Button, Result } from "antd";
import Layout from "../../components/Layout";

export default function Forbidden() {
  return (
    <Layout>
        <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={<Button type="primary">Back Home</Button>}
        />
    </Layout>
  );
}
