"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "@/components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal, Select, Tag } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  name: string;
  description: string;
  units: number;
}

interface Unit {
  unit_id: number;
  title: string;
  content_type: string;
  description: string;
  type: string; // For instance: 'text', 'video', or 'questionnaire'
  progress: string;
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

const Card = ({ title, unitId, contentType, description, progress }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`card ${isExpanded ? "expanded" : ""}`}
      onClick={() => {
        router.push(`/unit/view/${unitId}`);
      }}
    >
      <div className="card-header">
        <div className="card_header_text">
          <strong>{title}</strong>
          <br />
          <em>{contentType}</em>
        </div>
        <div className="card_header_tag">
          {progress ? (
            <Tag
              color={`${
                tagColors[
                  progress.completed ? "Completed" : "In Progress"
                ] as keyof typeof tagColors
              }`}
            >
              {progress.completed ? "Completed" : "In Progress"}
            </Tag>
          ) : (
            <Tag color={`${tagColors["Not Started"]}`}>Not Started</Tag>
          )}
        </div>
      </div>
      <div className="card-body">
        {description
          ? description.length > 150
            ? isExpanded
              ? description
              : `${description.substring(0, 150)}...`
            : description
          : ""}
      </div>
      {description
        ? description.length > 150 && (
            <div
              className="read-more"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              Read {isExpanded ? "less" : "more"}
            </div>
          )
        : ""}
    </div>
  );
};

export default function CourceView({ params }: any) {
  const id = params.id;
  console.log(id);
  const [course, setCourse] = useState<Course | null>(null);
  const [colorRgb, setColorRgb] = useState<Color | string>("rgb(22, 119, 255)");
  const [units, setUnits] = useState<Unit[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    description: "",
    units: 0,
    id: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return; // Return if id is not available yet

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.course);
        setColorRgb(response.data.course.rgb_value);
      } catch (error) {
        console.error("Error fetching the course data", error);
      }
    };

    const fetchUnits = async () => {
      try {
        const response = await axios.get(`/api/units/${id}`);
        // extract answers and checked_answers, json decode and put back in:
        response.data.units.forEach((unit: any) => {
          if (unit.content_type === "quest") {
            unit.questionnaire.forEach((quest: any) => {
              quest.answers = JSON.parse(quest.answers);
              quest.checked_answers = JSON.parse(quest.checked_answers);
            });
          }
          if (!unit?.questionnaire) {
            unit.questionnaire = [];
          }
        });
        console.log(response.data.units);
        setUnits(response.data.units);
      } catch (error) {
        console.error("Error fetching the units data", error);
      }
    };

    fetchUnits();

    fetchCourse(); // Call the async function
  }, [id]);

  return (
    <Layout>
      <h1>{course?.name || "Course not found"}</h1>
      <h2>{course?.description || "Description not found"}</h2>
      <div className="courses_view_unit_container">
        {units.map((unit, index) => (
          <Card
            key={index}
            unitId={unit.unit_id}
            title={unit.title}
            contentType={unit.content_type}
            description={unit.description}
            progress={unit.progress}
          />
        ))}
      </div>
    </Layout>
  );
}
