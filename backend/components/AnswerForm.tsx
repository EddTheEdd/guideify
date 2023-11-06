import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, message, Checkbox, Divider } from "antd";
import axios from "axios";
import TextEditor from "./TextEditor";

const { Option } = Select;

interface QuestFormProps {
  quest: array;
  setQuest({}): any;
}

const AnswerForm: React.FC<QuestFormProps> = ({ quest, setQuest }) => {
  const [answerData, setAnswerData] = useState<any>({});
  const [submittedData, setSubmittedData] = useState<any>({});
  console.log(quest);

  useEffect(() => {
    console.log("fettch stuff:");
    const fetchSubmittedData = async () => {
      try {
        const res = await axios.get(`/api/user-answers/${quest[0].quest_id}`);
        const data = await res.data;
        if (data.success) {
          setSubmittedData(data.answers);
        }
      } catch (error) {

      }
    };

    fetchSubmittedData();
  }, []);

  const submitAnswers = async () => {
    try {
      const res = await axios.post("/api/user-answers", {
        answers: answerData,
      });
      const data = await res.data;
      if (data.success) {
        message.success("Answers submitted successfully");
      } else {
        message.error("Failed to submit answers");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnswerChange = (value: string, questId: number) => {
    setAnswerData((prev: any) => {
      const updatedAnswerData = { ...prev };
      updatedAnswerData[questId] = value;
      return updatedAnswerData;
    });
  };

  const selectAnswer = (questIndex: number, answerIndex: number) => {
    // same as handleanswerchange but for a key we hold an array of checked indexes
    setAnswerData((prev: any) => {
      const updatedAnswerData = { ...prev };
      if (updatedAnswerData[questIndex]) {
        if (updatedAnswerData[questIndex].includes(answerIndex)) {
          updatedAnswerData[questIndex] = updatedAnswerData[questIndex].filter(
            (item: number) => item !== answerIndex
          );
        } else {
          updatedAnswerData[questIndex] = [
            ...updatedAnswerData[questIndex],
            answerIndex,
          ];
          updatedAnswerData[questIndex].sort((a: number, b: number) => a - b);
        }
      } else {
        updatedAnswerData[questIndex] = [answerIndex];
      }
      return updatedAnswerData;
    });
  };

  return (
    console.log(answerData),
    (
      <>
        <Form className="questform_quest_block">
          {quest.map(
            (question: any, index: number) => (
              console.log(question),
              (
                <div key={index}>
                <p>{question.is_correct != null ? question.is_correct ? "YAY" : "NAY" : ""}</p>
                  <div className="questform_question_answer_block">
                    <Form.Item
                      label="Question"
                      name={`${question.question_id}-text`}
                      initialValue={question.question_text}
                    >
                      <Input
                        placeholder="Enter your question"
                        name="question_text"
                        disabled={true}
                        value={question.question_text}
                        style={{ color: "black" }}
                      />
                    </Form.Item>
                    {question.type === "text" ? (
                      <Form.Item
                        label="Answer"
                        name={`${question.question_id}-correct_answer`}
                      >
                        <Input
                          placeholder="Enter your answer"
                          name="correct_answer"
                          onChange={(e: any) =>
                            handleAnswerChange(
                              e.target.value,
                              question.question_id
                            )
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
                                onChange={() => {
                                  selectAnswer(
                                    question.question_id,
                                    answerIndex
                                  );
                                }}
                              />
                              <Input
                                defaultValue={answer}
                                disabled={true}
                                style={{ marginLeft: "10px", color: "black" }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  <Divider></Divider>
                </div>
              )
            )
          )}
          <Button
            type="primary"
            onClick={submitAnswers}
            style={{ marginTop: "13px", width: "100%" }}
          >
            Submit
          </Button>
        </Form>
      </>
    )
  );
};

export default AnswerForm;
