"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "@/components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal, Select, Spin, Tag } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";
import { useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";
import { on } from "events";
import { useGlobalContext } from "@/contexts/GlobalContext";

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

interface CardProps {
  title: string;
  unitId: number;
  contentType: string;
  description: string;
  progress: any;
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

const Card: React.FC<CardProps> = ({ title, unitId, contentType, description, progress }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`card ${isExpanded ? "expanded" : ""}`}
      style={{ cursor: "pointer" }}
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
  const [colorRgb, setColorRgb] = useState<string>("rgb(22, 119, 255)");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    description: "",
    units: 0,
    id: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const { userPermissions, finishedFetchingPermissions } = useGlobalContext();
  console.log(userPermissions);
  const canSeeOtherUserDropdown = userPermissions.includes("View Course Progress");

  useEffect(() => {
    if (!id) return; // Return if id is not available yet
    setLoading(true);

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users`);
        console.log(response.data.users);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching the users data", error);
      }
    }

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.course);
        setColorRgb(response.data.course.rgb_value);

      } catch (error: any) {
        console.error("Error fetching the course data", error);
        // router.push("/forbidden");
      }
      setLoading(false);
    };

    const fetchUnits = async () => {
      try {
        let queryStrying = "/api/units/" + id;
        console.log(selectedUserId);
        if (selectedUserId) {
          queryStrying += "?user_id=" + selectedUserId;
        }
        console.log(queryStrying);
        const response = await axios.get(queryStrying);
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

    fetchUsers();

    fetchUnits();

    fetchCourse(); // Call the async function
  }, [id, selectedUserId]);

  return (
    loading ? 
    <div className="loading_spinner">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
      </div>
    :
    <Layout>
      <h2>Course Unit Progress</h2>
      {canSeeOtherUserDropdown ?
        <h4>Check how far you have progressed in a given course</h4>
        :
        <h4>Check how far you and other people have progressed in a given course</h4>
      }
      <>
      {/* select with users: */}
      {canSeeOtherUserDropdown &&
      <>
      <p>You can view other users progress by selecting them bellow:</p>
      <Select
        showSearch
        value={selectedUserId || undefined}
        style={{ width: 200 }}
        placeholder="Select a user"
        optionFilterProp="children"
        onSelect={(value: any) => {setSelectedUserId(value)}}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }>
        {users.map((user: any) => (
          <Select.Option key={user.user_id} value={user.id}>{user.email}</Select.Option>
        ))}
      </Select></>}
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
      </>
    </Layout>
  );
}
