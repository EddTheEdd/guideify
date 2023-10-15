import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, message, Checkbox } from "antd";
import axios from "axios";
import TextEditor from "./TextEditor";

const { Option } = Select;

interface QuestFormProps {
  quest: array;
  setQuest({}): any;
}

const QuestForm: React.FC<QuestFormProps> = ({ quest, setQuest }) => {
  const addQuestion = () => {
    setQuest((prev: any) => [
      ...prev,
      {
        text: "Type your question here.",
        type: "text",
        correct_answer: "What is the correct answer?",
        answers: ["Answer 1", "Answer 2", "Answer 3"],
      },
    ]);
  };

  const handleQuestionTypeChange = (value: string, index: number) => {
    console.log(value);
    console.log(index);
    setQuest((prev: any) => {
      const updatedQuest = [...prev];
      const updatedItem = { ...updatedQuest[index] };
      updatedItem.type = value;
      updatedQuest[index] = updatedItem;
      return updatedQuest;
    });
  };

  const handleQuestionChange = (value: string, index: number) => {
    console.log(value);
    console.log(index);
  };

  const handleAnswerChange = (value: string, index: number) => {
    console.log(value);
    console.log(index);
  };

  // const handleUnitTypeChange = (value: string) => {
  //   setUnitType(value);
  // };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  // const handleEditorChange = (content: string) => {
  //   setFormData({
  //       ...formData,
  //       content: content,  // updating the 'content' property with the editor content
  //   });
  //   };

  // const handleSubmit = async () => {
  //   try {
  //     if (!unitType) {
  //       message.error('Please select a unit type');
  //       return;
  //     }
  //     console.log("Form Data:");
  //     console.log({...formData, type: unitType, title: unitName, courseId});
  //     const apiUrl = '/api/units';
  //     await axios.post(apiUrl, { ...formData, type: unitType, title: unitName, order: order, courseId, unitId: unit.unit_id });
  //     message.success('Unit saved successfully');
  //   } catch (error) {
  //     console.error('Error saving the unit', error);
  //     message.error('Failed to save the unit');
  //   }
  // };

  return (
    console.log(quest),
    (
      <>
        <Form.Item label="Questionnaire">
          {quest.map((question: any, index: number) => (
            <div key={index}>
              <Form.Item
                label="Question Type"
                name="type"
                initialValue={question.type}
              >
                <Select
                  placeholder="Select unit type"
                  onChange={(value) => handleQuestionTypeChange(value, index)}
                >
                  <Option value="text">Text</Option>
                  <Option value="multiple_choice">Multiple Choice</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Question" name="text">
                <Input
                  placeholder="Enter your question"
                  name="text"
                  value={question.text}
                  onChange={(e: any) => handleQuestionChange(e.target.value, index)}
                />
              </Form.Item>
              {question.type === "text" ? (
                <Form.Item label="Answer" name="correct_answer">
                  <Input
                    placeholder="Enter your answer"
                    name="correct_answer"
                    value={question.correct_answer}
                    onChange={(e: any) => handleAnswerChange(e.target.value, index)}
                  />
                </Form.Item>
              ) : (
                question.answers.map((answer: any, index: number) => (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Checkbox onChange={() => console.log(answer)} />
                    <Input
                      defaultValue={answer}
                      onChange={(e: any) => console.log(e.target.value)}
                      style={{ marginLeft: "10px" }}
                    />
                  </div>
                ))
              )}
            </div>
          ))}
          <Button
            type="primary"
            onClick={addQuestion}
            style={{ marginTop: "13px" }}
          >
            +
          </Button>
        </Form.Item>
      </>
    )
  );
};

export default QuestForm;
