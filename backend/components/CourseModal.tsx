"use client";
import dayjs from "dayjs";
import { Input, Modal, Form, message, Select, ColorPicker, Button, Tooltip } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  modalData: any;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  setRefetch: (value: boolean) => void;
  refetch: boolean;
  roles: any;
  rgbString?: string;
  setColorRgb?: (value: any) => void;
  formatRgb?: any;
}

const CourseModal: React.FC<Props> = ({
  modalData,
  modalVisible,
  setModalVisible,
  setRefetch,
  refetch,
  roles,
  rgbString,
  setColorRgb,
  formatRgb,
}) => {
  console.log("Modal data:");
  console.log(modalData);
  const router = useRouter();
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const onFormFinish = async (newCourse: any) => {
    try {
      if (modalData?.course_id) {
        await axios.put(`/api/courses/${modalData.course_id}`, {
          ...newCourse,
          color: rgbString,
        });
        message.success("Course updated successfully");
      } else {
        await axios.post("/api/courses", newCourse);
        message.success("Course created successfully");
      }
    } catch (error: any) {
      const frontendErrorMessage = error.response.data.frontendErrorMessage;
      if (frontendErrorMessage) {
        message.error(frontendErrorMessage);
      }
      console.error("Error updating course", error);
      message.error("Error updating course");
    }
    setRefetch(!refetch);
    setModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/courses/${modalData.course_id}`);
      message.success("Course deleted successfully");
      // 5 second countdown before page reloads:
      setTimeout(() => {
        router.push("/courses");
      }, 3000);
    } catch (error: any) {
      const frontendErrorMessage = error.response.data.frontendErrorMessage;
      if (frontendErrorMessage) {
        message.error(frontendErrorMessage);
      }
      console.error("Error deleting course", error);
      message.error("Error deleting course");
    }
    setRefetch(!refetch);
    setModalVisible(false);
  }

  const initialValues = {
    name: modalData?.course_name,
    description: modalData?.course_description,
    color: modalData?.course_color,
    role_ids: modalData?.course_roleIds,
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [modalData, form]);

  return (
    console.log(initialValues),
    console.log(modalData),
    (
      <Modal
        title={modalData?.course_id ? "Edit Course" : "Create Course"}
        open={modalVisible}
        onOk={handleOk}
        okText={modalData?.course_id ? "Save Course" : "Create Course"}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          onFinish={onFormFinish}
          name="courseForm"
          key={modalData?.course_id}
        >
          <Form.Item
            label="Course Name"
            name="name"
            rules={[
              { required: true, message: "Please input the course name!" },
            ]}
          >
            <Input placeholder="Course Name" />
          </Form.Item>

          <Form.Item
            label="Course Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input the course description!",
              },
            ]}
            style={{ marginTop: "13px" }}
          >
            <Input placeholder="Course Description" />
          </Form.Item>

          <Form.Item
            label="Roles"
            name="role_ids"
            style={{ marginTop: "13px" }}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Tags Mode"
              options={roles.map((role: any) => {
                return { label: role.name, value: role.role_id.toString() };
              })}
            />
          </Form.Item>

          {modalData?.course_id && (
            <Form.Item label="Color" name="color" style={{ marginTop: "13px" }}>
              <ColorPicker format={formatRgb} onChange={setColorRgb} />
              RGB: <span>{rgbString}</span>
            </Form.Item>
          )}
          {modalData?.course_id && (
            <>
              <Button danger
                  disabled={!modalData?.course_canBeDeleted}
                  type = "primary"
                  style = {{marginTop: "20px"}}
                  onClick={() => {handleDelete()}}
                >
                  Delete Course
              </Button>
              {!modalData?.course_canBeDeleted && <p>Course cant be deleted because its units have been answered to!</p>}
            </>
          )}
        </Form>
      </Modal>
    )
  );
};

export default CourseModal;
