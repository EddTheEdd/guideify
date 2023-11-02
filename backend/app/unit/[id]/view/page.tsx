"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Typography } from "antd";


const { Title, Text } = Typography;

interface Unit {
    unit_id: number;
    title: string;
    content_type: string;
    description: string;
    type: string;
  }

const UnitPage: React.FC = ({ params }: any) => {
  const id = params.id;

  useEffect(() => {
    if (!id) return;

    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/api/unit/${id}`);
        console.log(response);
      } catch (error) {
        console.error("Error fetching the unit data", error);
      }
    };

    fetchUnit();
  }, [id]);

  return (
    <>
      <Layout>
        <p>{id}</p>
      </Layout>
    </>
  );
};

export default UnitPage;
