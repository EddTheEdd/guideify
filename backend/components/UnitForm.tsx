import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, message, Divider, InputNumber } from "antd";
import axios from "axios";
import TextEditor from "./TextEditor";
import QuestForm from "./QuestForm";

const { Option } = Select;

interface UnitFormProps {
  courseId: number;
  unit: any;
  index: number;
  setUnits: any;
}

const UnitForm: React.FC<UnitFormProps> = ({ courseId, unit, index, setUnits }) => {
  console.log(unit);
  const [unitType, setUnitType] = useState<string | "null">(unit.content_type);
  const [formData, setFormData] = useState<any>({
    content: unit.content,
    videoUrl: unit.content_type === "video" ? unit.content : "",
    question: unit.content_type === "quest" ? unit.content : "",
  });
  const [unitName, setUnitName] = useState<string>(unit.title);
  const [unitDescription, setUnitDescription] = useState<string>(
    unit.description
  );
  const [order, setOrder] = useState(unit.order);
  const [quest, setQuest] = useState(unit?.questionnaire || []);
  const [questTitle, setQuestTitle] = useState(
    unit?.questionnaire[0] ? unit.questionnaire[0].title : ""
  );

  useEffect(() => {
    setUnitType(unit.content_type);
    setUnitName(unit.title);
    setUnitDescription(unit.description);
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
  };

  const handleEditorChange = (content: string) => {
    setFormData({
      ...formData,
      content: content, // updating the 'content' property with the editor content
    });
  };

  const handleSubmit = async () => {
    try {
      if (!unitName) {
        message.error("Please enter a unit name");
        return;
      }
      if (!unitDescription) {
        message.error("Please enter a unit description");
        return;
      }
      if (!order) {
        message.error("Please enter a unit weight");
        return;
      }
      if (unitType === "text" && !formData.content) {
        message.error("Please enter unit content!");
        return;
      }
      if (unitType === "video" && !formData.videoUrl) {
        message.error("Please enter a video url!");
        return;
      }
      if (!unitType) {
        message.error("Please select a unit type");
        return;
      }
      console.log("Form Data:");
      console.log({ ...formData, type: unitType, title: unitName, courseId });
      const apiUrl = "/api/units";
      const response: any = await axios.post(apiUrl, {
        ...formData,
        type: unitType,
        title: unitName,
        description: unitDescription,
        order: order,
        courseId,
        unitId: unit.unit_id,
        questTitle: questTitle,
        quest: quest,
      });
      if (response.data.createdUnit.content_type === "quest") {
        response.data.createdUnit.questionnaire.forEach((quest: any) => {
            quest.answers = JSON.parse(quest.answers);
            quest.checked_answers = JSON.parse(quest.checked_answers);
        });
      }
      if (!response.data.createdUnit?.questionnaire) {
        response.data.createdUnit.questionnaire = [];
      }
      setUnits((prev: any) => {
        const updatedUnits = [...prev];
        updatedUnits[index] = {...response.data.createdUnit};
        return updatedUnits;
      });
      setQuest(response.data.createdUnit.questionnaire);
      message.success("Unit saved successfully");
    } catch (error: any) {
      const frontendErrorMessage = error.response.data.frontendErrorMessage;
      if (frontendErrorMessage) {
        message.error(frontendErrorMessage);
      }
      console.error("Error saving the unit", error);
      message.error("Error saving unit");
    }
  };

  const handleDelete = async () => {
    try {
      setUnits((prev: any) => {
        const updatedUnits = [...prev];
        updatedUnits.splice(index, 1);
        return updatedUnits;
      });
      if (unit.unit_id) {
        const apiUrl = `/api/units/${unit.unit_id}`;
        await axios.delete(apiUrl);
        message.success("Unit deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting the unit", error);
      message.error("Error deleting unit");
    }
  }

  const unitTypes = {
    quest: "Questionnaire",
    text: "Reading Material",
    video: "Video Content",
  };

  const validateYouTubeURL = (_: any, value: any) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/watch\?v=.+$/;
    if (!value || pattern.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Please enter a valid YouTube video URL'));
  };

  return (
    console.log(formData),
    (
      <>
        <p className={"unitform-unitname"}>{unitName}</p>{" "}
        <Divider>{unitTypes[unitType as keyof typeof unitTypes]}</Divider>
        <Form layout="vertical" disabled={unit.interacted}>
          <Form.Item
            label="Unit Name"
            name="unitName"
            initialValue={unit.title}
            required={true}
            rules={[
              {
                required: true,
                message: "Please input the unit name!",
              },
            ]}
          >
            <Input
              placeholder="New Unit"
              value={unitName}
              onChange={(e: any) => setUnitName(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Unit Description"
            name="unitDescription"
            initialValue={unit.description}
            required={true}
            rules={[
              {
                required: true,
                message: "Please input the unit description!",
              },
            ]}
          >
            <Input
              placeholder="New Description"
              value={unitDescription}
              onChange={(e: any) => setUnitDescription(e.target.value)}
            />
          </Form.Item>

          <Form.Item rules={[
              {
                required: true,
                message: "Please input the unit weight!",
              },
            ]} label="Weight [min -100, max 100]" name="order" initialValue={unit.order} required={true} tooltip={"Higher values sink to the bottom, lower values rise to the top. Allows you to order units."}>
            <InputNumber
              placeholder="1"
              value={order}
              min={-100}
              max={100}
              onChange={(value: any) => setOrder(value)}
            />
          </Form.Item>

          <Form.Item
            label="Unit Type"
            name="unitType"
            initialValue={unit.content_type}
            required={true}
            rules={[
              {
                required: true,
                message: "Please input the unit type!",
              },
            ]}
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
                required={true}
                rules={[
                  {
                    required: true,
                    message: "Please input the unit content!",
                  },
                ]}
              >
                <TextEditor
                  readOnly={unit?.interacted}
                  placeholder="Start spreading your knowledge!"
                  value={unit.content}
                  onChange={handleEditorChange}
                />
              </Form.Item>
            </>
          )}

          {unitType === "video" && (
            <Form.Item
            label="Video URL"
            name="content"
            initialValue={unit.content}
            required={true}
            rules={[
              { 
                required: true, 
                message: 'Please enter a video URL' 
              },
              { 
                validator: validateYouTubeURL 
              }
            ]}
          >
            <Input
              placeholder="Enter video URL"
              name="content"
              onChange={handleInputChange}
            />
          </Form.Item>
          )}

          {unitType === "quest" && (
            <>
              <Form.Item
                label="Questionnaire Title"
                name={`${index}-quest_title`}
                initialValue={questTitle}
                required={true}
                rules={[
                  {
                    required: true,
                    message: "Please input the questionnaire title!",
                  },
                ]}
              >
                <Input
                  disabled={unit?.unit_id}
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

          <div className="unit_buttons">
            <Form.Item>
              <Button
                type="primary"
                onClick={handleSubmit}
                style={{ marginTop: "13px" }}
              >
                Save Unit
              </Button>
            </Form.Item>

            <Form.Item>
              <Button danger
                type="primary"
                onClick={handleDelete}
                style={{ marginTop: "13px" }}
              >
                Delete Unit
              </Button>
            </Form.Item>
          </div>
        </Form>
      </>
    )
  );
};

export default UnitForm;
