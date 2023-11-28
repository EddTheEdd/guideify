"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import CustomTable from "@/components/CustomTable";
import { Button, Checkbox, Input, Modal, Select } from "antd";
import { Option } from "antd/lib/mentions";
import CustomTableTwo from "@/components/CustomTableTwo";

interface Course {
  id: number;
  name: string;
  description: string;
  units: number;
}

interface Unit {
  id: number;
  name: string;
  type: string; // For instance: 'text', 'video', or 'questionnaire'
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: "",
    description: "",
    units: 0,
    id: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();

      if (data.success) {
        setCourses(data.courses);
      } else {
        console.error("Failed to fetch courses", data.error);
      }
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("/api/units");
        const data = await res.json();

        if (data.success) {
          setUnits(data.units);
        } else {
          console.error("Failed to fetch units", data.error);
        }
      } catch (error) {
        console.error("Error fetching units", error);
      }
    };

    fetchUnits();

    fetchCourses();
  }, []);

  const showModal = () => {
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      await axios.post("/api/courses", newCourse);
      toast.success("Course created successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Error creating course");
      console.error("Error creating course", error);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const courseColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: any, record: any) => ({
        props: {
          style: { borderLeft: `6px solid ${record.rgb_value}` },
        },
        children: <div>{text}</div>,
      }),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Unit) => (
        <>
          <Link href={`/courses/view/${record.id}`}>View</Link>
          <Link style={{ marginLeft: "13px" }} href={`/courses/${record.id}`}>
            Edit
          </Link>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <CustomTableTwo data={courses} columns={courseColumns} sideModalFeature={false} showModal={() => {}}/>
      <Button onClick={showModal}>Create a Course</Button>

      <Modal
        title="Create a Course"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Course Name"
          value={newCourse.name}
          onChange={(e: any) =>
            setNewCourse({ ...newCourse, name: e.target.value })
          }
        />

        <Input
          placeholder="Course Description"
          value={newCourse.description}
          onChange={(e: any) =>
            setNewCourse({ ...newCourse, description: e.target.value })
          }
        />
      </Modal>
    </Layout>
  );
}
