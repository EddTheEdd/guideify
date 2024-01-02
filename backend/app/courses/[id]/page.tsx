"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Typography, Card, Space, Modal, ColorPicker, Input, Spin } from "antd";
import { Content } from "antd/lib/layout/layout";
import UnitsBox from "@/components/UnitsBox";
import { LoadingOutlined, SettingOutlined } from "@ant-design/icons";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useRouter } from "next/navigation";
import CourseModal from "@/components/CourseModal";

const { Title, Text } = Typography;

interface Course {
  course_id: number;
  name: string;
  description: string;
  color: string;
  roleIds: any[];
}

const CoursePage: React.FC = ({ params }: any) => {
  const id = params.id;
  console.log(id);
  const [course, setCourse] = useState<Course | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editableName, setEditableName] = useState<string>("");
  const [editableDescription, setEditableDescription] = useState<string>("");

  const [refetch, setRefetch] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [colorRgb, setColorRgb] = useState<any>("rgb(22, 119, 255)");
  const [formatRgb, setFormatRgb] = useState<"rgb">("rgb");
  const [textColor, setTextColor] = useState<string>("#000");

  const { userPermissions, theme } = useGlobalContext();
  const router = useRouter();
  // const canEditCourses = userPermissions.includes("Edit Courses");

  const rgbString = useMemo(() => {
    if (colorRgb) {
      return typeof colorRgb === "string" ? colorRgb : colorRgb.toRgbString();
    } else {
      return "rgb(22, 119, 255)"; // or any other default color or handling you prefer
    }
  }, [colorRgb]);

  useEffect(() => {
    if (course) {
      setEditableName(course.name);
      setEditableDescription(course.description);
    }
  }, [course]);

  useEffect(() => {
    if (!id) return; // Return if id is not available yet

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.course);
        setColorRgb(response.data.course.rgb_value);

        // if (!canEditCourses) {
        //     router.push('/forbidden');
        // }
      } catch (error) {
        console.error("Error fetching the course data", error);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/roles/names");
        const data = await res.json();

        if (data.success) {
          console.log(data.roles);
          setRoles(data.roles);
        } else {
          console.error("Failed to fetch roles", data.error);
        }
      } catch (error) {
        console.error("Error fetching roles", error);
      }
    };

    fetchCourse();
    fetchRoles();
  }, [id]);

  // const handleOk = async () => {
  //   try {
  //     if (!course) {
  //       console.error("Course is undefined");
  //       return;
  //     }

  //     const updatedCourse = {
  //       id: id,
  //       name: editableName,
  //       description: editableDescription,
  //       color: rgbString,
  //     };

  //     await axios.put(`/api/courses/${id}`, updatedCourse);
  //     setCourse(updatedCourse);
  //   } catch (error) {}
  //   setModalVisible(false);
  // };

  const handleCancel = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const rgbValues = rgbString.match(/\d+/g);
    if (rgbValues) {
      const [r, g, b] = rgbValues.map(Number);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setTextColor(brightness > 128 ? "#000" : "#fff");
    }
  }, [rgbString]);

  return (
    console.log(id),
    (
      <>
        <Layout>
          {course ? (
            <Card
              className="coursepage_course_card"
              bordered={false}
              style={{
                backgroundColor: rgbString,
                color: textColor,
                maxWidth: 800,
                margin: "0 auto",
              }}
            >
              <div>
                <Title level={2} style={{ color: textColor }}>
                  {course.name}
                </Title>
                <Text style={{ color: textColor }}>{course.description}</Text>
              </div>
              <SettingOutlined
                onClick={() => setModalVisible(true)}
                style={{ fontSize: "24px" }}
              />
            </Card>
          ) : (
            <Content>Loading...</Content>
          )}
          {/* Space for more development work */}
          <Space direction="vertical" style={{ width: "100%", marginTop: 20 }}>
            <UnitsBox
              courseId={id}
              rgbString={rgbString}
              textColor={textColor}
            />
          </Space>
        </Layout>
        {modalVisible && (
        <CourseModal
          modalData={{
            course_id: course?.course_id,
            course_name: course?.name,
            course_description: course?.description,
            course_color: rgbString,
            course_roleIds: course?.roleIds,
          }}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          setRefetch={setRefetch}
          refetch={refetch}
          roles={roles}
          rgbString={rgbString}
          setColorRgb={setColorRgb}
          formatRgb={formatRgb}
        />
        )}
      </>
    )
  );
};

export default CoursePage;
