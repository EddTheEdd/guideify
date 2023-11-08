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
  console.log(quest);
  const addQuestion = () => {
    setQuest((prev: any) => [
      ...prev,
      {
        question_text: "Type your question here.",
        type: "text",
        correct_answer: "What is the correct answer?",
        answers: ["Answer 1", "Answer 2", "Answer 3"],
        checked_answers: [0, 1],
        requires_review: false,
        order: 1,
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
    setQuest((prev: any) => {
      const updatedQuest = [...prev];
      const updatedItem = { ...updatedQuest[index] };
      updatedItem.question_text = value;
      updatedQuest[index] = updatedItem;
      return updatedQuest;
    });
  };

  const handleMultiAnswerChange = (
    value: string,
    index: number,
    answerIndex: number
  ) => {
    console.log(value);
    console.log(index);
    setQuest((prev: any) => {
      const updatedQuest = [...prev];
      const updatedItem = { ...updatedQuest[index] };
      updatedItem.answers[answerIndex] = value;
      updatedQuest[index] = updatedItem;
      return updatedQuest;
    });
  };

  const handleAnswerChange = (value: string, index: number) => {
    console.log(value);
    console.log(index);
    setQuest((prev: any) => {
      const updatedQuest = [...prev];
      const updatedItem = { ...updatedQuest[index] };
      updatedItem.correct_answer = value;
      updatedQuest[index] = updatedItem;
      return updatedQuest;
    });
  };

  const addAnswer = (index: number) => {
    setQuest((prev: any) => {
      const updatedQuest = [...prev];
      const updatedItem = { ...updatedQuest[index] };
      updatedItem.answers.push("Answer");
      updatedQuest[index] = updatedItem;
      return updatedQuest;
    });
  };

  const selectAnswer = (index: number, answerIndex: number) => {
    setQuest((prev: any) => {
      const updatedQuest = [...prev];
      const updatedItem = { ...updatedQuest[index] };
      if (updatedItem.checked_answers.includes(answerIndex)) {
        updatedItem.checked_answers.splice(
          updatedItem.checked_answers.indexOf(answerIndex),
          1
        );
      } else {
        updatedItem.checked_answers.push(answerIndex);
        updatedItem.checked_answers.sort((a: number, b: number) => a - b);
      }
      updatedQuest[index] = updatedItem;
      return updatedQuest;
    });
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
        <Form.Item className="questform_quest_block">
          {quest.map((question: any, index: number) => (
            console.log(question),
            <div key={index}>
              <Form.Item
                label="Question Type"
                name={`${index}-type`}
                initialValue={question.type}
              >
                <Select
                  placeholder="Select unit type"
                  onChange={(value) => handleQuestionTypeChange(value, index)}
                >
                  <Option value="text">Text</Option>
                  <Option value="multi_choice">Multiple Choice</Option>
                </Select>
              </Form.Item>
              <div className="questform_question_answer_block">
                <Form.Item
                  label="Question"
                  name={`${index}-text`}
                  initialValue={question.question_text}
                >
                  <Input
                    placeholder="Enter your question"
                    name="question_text"
                    value={question.question_text}
                    onChange={(e: any) =>
                      handleQuestionChange(e.target.value, index)
                    }
                  />
                </Form.Item>
                {question.type === "text" ? (
                  <Form.Item
                    label="Answer"
                    name={`${index}-correct_answer`}
                    initialValue={question.correct_answer}
                  >
                    <Input
                      placeholder="Enter your answer"
                      name="correct_answer"
                      value={question.correct_answer}
                      onChange={(e: any) =>
                        handleAnswerChange(e.target.value, index)
                      }
                    />
                  </Form.Item>
                ) : (
                  <div className="questform_answer_block">
                    {question.answers.map(
                      (answer: any, answerIndex: number) => (
                        <div
                          key={answerIndex}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Checkbox
                            checked={question.checked_answers.includes(
                              answerIndex
                            )}
                            onChange={() => {
                              selectAnswer(index, answerIndex);
                            }}
                          />
                          <Input
                            defaultValue={answer}
                            onChange={(e: any) => {
                              handleMultiAnswerChange(
                                e.target.value,
                                index,
                                answerIndex
                              );
                            }}
                            style={{ marginLeft: "10px" }}
                          />
                        </div>
                      )
                    )}
                    <Button
                      type="primary"
                      onClick={() => {
                        addAnswer(index);
                      }}
                      style={{ marginTop: "13px" }}
                    >
                      Add Answer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <Button
            type="primary"
            onClick={addQuestion}
            style={{ marginTop: "13px", width: "100%" }}
          >
            Add Question
          </Button>
        </Form.Item>
      </>
    )
  );
};

export default QuestForm;
