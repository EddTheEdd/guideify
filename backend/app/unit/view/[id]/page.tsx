"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Divider, Tag, Typography } from "antd";
import DOMPurify from "dompurify";

const { Title, Text } = Typography;

interface Unit {
  unit_id: number;
  title: string;
  content_type: string;
  description: string;
  type: string;
  content: string;
}

const tags = [
  {
    text: "Not Started",
  },
  {
    text: "In Progress",
  },
  {
    text: "Completed",
  },
  {
    text: "Failed",
  },
  {
    text: "Withdrawn",
  },
];

const tagColors = {
  "Not Started": "orange",
  "In Progress": "blue",
  Completed: "green",
  Failed: "red",
  Withdrawn: "gray",
};

const UnitPage: React.FC = ({ params }: any) => {
  const id = params.id;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [wasInserted, setWasInserted] = useState(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (!id) return;

    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/api/unit/${id}`);
        setUnit(response.data.unit);
        setWasInserted(response.data.wasInserted);
        console.log(response.data.unit);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the unit data", error);
      }
    };

    fetchUnit();
  }, [id]);

  const safeContent = unit ? DOMPurify.sanitize(unit.content) : "";

  return (
    console.log(unit),
    (
      <>
        <Layout>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="unitpage_main_content">
                <h1>{unit ? unit.title : ""}</h1>
                <p className="unitpage_main_description">
                  {unit ? unit.description : ""}
                </p>
                <Tag
                  color={`${
                    tagColors[
                      wasInserted ? "Not Started" : "In Progress"
                    ]
                  }`}
                >
                  {wasInserted ? tags[0].text : tags[1].text}
                </Tag>
                <Divider></Divider>
                <div className="unitpage_main_body" dangerouslySetInnerHTML={{ __html: safeContent }}></div>
              </div>
            </>
          )}
        </Layout>
      </>
    )
  );
};

export default UnitPage;
