"use client"
import React from "react";
import { Button, Result } from "antd";
import Layout from "../../components/Layout";
import { Router } from "express";
import { useRouter } from "next/navigation";

export default function Forbidden() {
  const router = useRouter();

  return (
    <Layout>
        <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={<Button onClick={() => {router.push("/home")}} type="primary">Back Home</Button>}
        />
    </Layout>
  );
}
