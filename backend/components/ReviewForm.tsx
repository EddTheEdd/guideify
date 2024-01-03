import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, message, Checkbox, Divider } from "antd";
import axios from "axios";
import TextEditor from "./TextEditor";
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import Link from "next/link";

const { Option } = Select;

interface QuestFormProps {
  quest: any;
  setQuest({}): any;
  unitId?: number;
  completed: boolean;
  hasDoneQuest: boolean;
  courseId: number;
  submissionId: number;
}

const ReviewForm: React.FC<QuestFormProps> = ({
  submissionId,
  courseId,
  hasDoneQuest,
  quest,
  setQuest,
  unitId,
  completed,
}) => {
  const [answerData, setAnswerData] = useState<any>({});
  const [submittedData, setSubmittedData] = useState<any>({});
  console.log(quest);
  console.log(completed);

  useEffect(() => {
    console.log("fettch stuff:");
    const fetchSubmittedData = async () => {
      try {
        const res = await axios.get(`/api/user-answers/${quest[0].quest_id}`);
        const data = await res.data;
        if (data.success) {
          setSubmittedData(data.answers);
        }
      } catch (error) {}
    };

    fetchSubmittedData();
  }, []);

  const submitAnswers = async () => {
    try {
      const res = await axios.post(`/api/user-reviews/${submissionId}`, {
        review: answerData,
        unitId: unitId,
      });
      const data = await res.data;
      if (data.success) {
        message.success("Answers submitted successfully");
        window.location.reload();
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

  const handleAnswerCorrectChange = (value: string, questId: number) => {
    setAnswerData((prev: any) => {
      const updatedAnswerData = { ...prev };
      updatedAnswerData[questId] = value;
      return updatedAnswerData;
    })
  }

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
    console.log(hasDoneQuest),
    (
      <div>
        <Form className="questform_quest_block" style={{maxWidth: "1200px", margin: "auto"}}>
          {quest.map(
            (question: any, index: number) => (
              console.log(question),
              (
                <div key={index}>
                  <div>
                    {!completed && question.requires_review != null && question.requires_review === true ? (
                        <InfoCircleFilled className="answer_block_review_icon" />
                    ) : question.is_correct != null ? (
                      question.is_correct ? (
                        <CheckCircleFilled className="answer_block_correct_icon" />
                      ) : (
                        <ExclamationCircleFilled className="answer_block_incorrect_icon" />
                      )
                    ) : (
                      ""
                    )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "5px",
                          }}
                        >
                          <p>Mark answer as correct?</p>
                          <Checkbox
                            disabled={completed}
                            className="answer_block_review_checkbox"
                            checked={answerData[question.question_id] ?? question.is_correct}
                            onChange={(e: any) => {handleAnswerCorrectChange(e.target.checked, question.question_id)}}
                          />
                        </div>
                  </div>
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
                      <>
                        <Form.Item
                          label="Answer"
                          name={`${question.question_id}-correct_answer`}
                          initialValue={question?.answer}
                        >
                          <Input
                            style={{ color: "black" }}
                            placeholder="Enter your answer"
                            name="correct_answer"
                            disabled={true}
                            onChange={(e: any) =>
                              handleAnswerChange(
                                e.target.value,
                                question.question_id
                              )
                            }
                          />
                        </Form.Item>
                        {
                          <p
                            className={`answer_block_correct_answer ${
                              question.is_correct ? "correct" : "incorrect"
                            }`}
                          >
                            Pareizā atbilde: {question.correct_answer}
                          </p>
                        }
                      </>
                    ) : (
                      <div className="questform_answer_block">
                        {question?.answers.map(
                          (answer: any, answerIndex: number) => (
                            console.log(answerIndex),
                            console.log(question.checked_answers),
                            console.log(
                              completed &&
                                (question.checked_answers.includes(answerIndex) ||
                                  question?.answer.includes(answerIndex))
                            ),
                            (
                              <div
                                key={answerIndex}
                                style={{ display: "flex", alignItems: "center" }}
                              >
                                {
                                  <Checkbox
                                    className={
                                      completed
                                        ? (question.checked_answers.includes(answerIndex)
                                            ? "answer_block_checkbox_basic_check" +
                                              (!question?.answer.includes(answerIndex)
                                                ? " missed"
                                                : "" +
                                                  (question?.answer.includes(answerIndex)
                                                    ? " correct"
                                                    : ""))
                                            : question?.answer.includes(answerIndex)
                                              ? "answer_block_checkbox_basic_check incorrect"
                                              : "")
                                        : undefined // Ensures that if not completed, className receives 'undefined'
                                    }
                                    checked={
                                      question.checked_answers.includes(
                                        answerIndex
                                      ) || question?.answer.includes(answerIndex)
                                    }
                                    disabled={true}
                                    onChange={() => {
                                      selectAnswer(
                                        question.question_id,
                                        answerIndex
                                      );
                                    }}
                                  />
                                }
                                <Input
                                  defaultValue={answer}
                                  disabled={true}
                                  style={{ marginLeft: "10px", color: "black" }}
                                />
                              </div>
                            )
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
          {!completed && (
            <Button
              type="primary"
              onClick={submitAnswers}
              style={{ marginTop: "13px", width: "100%" }}
            >
              Submit Review
            </Button>
          )}
        </Form>
      </div>
    )
  );
};

export default ReviewForm;
