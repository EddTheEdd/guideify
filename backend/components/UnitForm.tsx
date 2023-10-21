import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, message, Divider } from "antd";
import axios from "axios";
import TextEditor from "./TextEditor";
import QuestForm from "./QuestForm";

const { Option } = Select;

interface UnitFormProps {
  courseId: number;
  unit: any;
  index: number;
}

const UnitForm: React.FC<UnitFormProps> = ({ courseId, unit, index }) => {
  console.log(unit);
  const [unitType, setUnitType] = useState<string | "null">(unit.content_type);
  const [formData, setFormData] = useState<any>({
    content: unit.content,
    videoUrl: unit.content_type === "video" ? unit.content : "",
    question: unit.content_type === "quest" ? unit.content : "",
  });
  const [unitName, setUnitName] = useState<string>(unit.title);
  const [order, setOrder] = useState(unit.order);
  const [quest, setQuest] = useState(unit?.questionnaire || []);
  const [questTitle, setQuestTitle] = useState(unit?.questionnaire[0] ? unit.questionnaire[0].title : "");

  useEffect(() => {
    setUnitType(unit.content_type);
    setUnitName(unit.title);
    setOrder(unit.order);
  }, [unit]);

  const handleUnitTypeChange = (value: string) => {
    setUnitType(value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionTitleChance = (value: string) => {
    setQuestTitle(value);
  }

  const handleEditorChange = (content: string) => {
    setFormData({
      ...formData,
      content: content, // updating the 'content' property with the editor content
    });
  };

  const handleSubmit = async () => {
    try {
      if (!unitType) {
        message.error("Please select a unit type");
        return;
      }
      console.log("Form Data:");
      console.log({ ...formData, type: unitType, title: unitName, courseId });
      const apiUrl = "/api/units";
      await axios.post(apiUrl, {
        ...formData,
        type: unitType,
        title: unitName,
        order: order,
        courseId,
        unitId: unit.unit_id,
        questTitle: questTitle,
        quest: quest,
      });
      message.success("Unit saved successfully");
    } catch (error) {
      console.error("Error saving the unit", error);
      message.error("Failed to save the unit");
    }
  };

  const unitTypes = {
    quest: "Questionnaire",
    text: "Reading Material",
    video: "Video Content",
  }

  return (
    console.log(formData),
    (
      <>
        <p className={"unitform-unitname"}>{unitName}</p>{" "}
        <Divider>{unitTypes[unitType as keyof typeof unitTypes]}</Divider>
        <Form layout="vertical">
          <Form.Item
            label="Unit Name"
            name="unitName"
            initialValue={unit.title}
          >
            <Input
              placeholder="New Unit"
              value={unitName}
              onChange={(e: any) => setUnitName(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Order" name="order" initialValue={unit.order}>
            <Input
              placeholder="Order"
              value={order}
              onChange={(e: any) => setOrder(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Unit Type"
            name="unitType"
            initialValue={unit.content_type}
          >
            <Select
              placeholder="Select unit type"
              onChange={handleUnitTypeChange}
            >
              <Option value="text">Text</Option>
              <Option value="video">Video</Option>
              <Option value="quest">Questionnaire</Option>
            </Select>
          </Form.Item>

          <Divider></Divider>

          {unitType === "text" && (
            <>
              <Form.Item
                label="Content"
                name="course"
                initialValue={unit.content}
              >
                <TextEditor
                  placeholder="Start spreading your knowledge!"
                  onChange={handleEditorChange}
                />
              </Form.Item>
            </>
          )}

          {unitType === "video" && (
            <Form.Item
              label="Video URL"
              name="videoUrl"
              initialValue={unit.videoUrl}
            >
              <Input
                placeholder="Enter video URL"
                name="videoUrl"
                onChange={handleInputChange}
              />
            </Form.Item>
          )}

          {unitType === "quest" && (
            <>
              <Form.Item label="Questionnaire Title" tooltip="You can reuse this questionnaire in different units!" name={`${index}-quest_title`} initialValue={questTitle}>
                <Input
                  placeholder="The capitals of the world!"
                  name="text"
                  value={questTitle}
                  onChange={(e: any) =>
                    handleQuestionTitleChance(e.target.value)
                  }
                />
              </Form.Item>
              <QuestForm quest={quest} setQuest={setQuest} />
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ marginTop: "13px" }}
            >
              Save Unit
            </Button>
          </Form.Item>
        </Form>
      </>
    )
  );
};

export default UnitForm;
