"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Button, Divider, Result, Spin, Tag, Typography } from "antd";
import DOMPurify from "dompurify";
import AnswerForm from "@/components/AnswerForm";
import ReviewForm from "@/components/ReviewForm";
import { useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Progress {
  completed: boolean;
  startedAt?: Date;
  finishedAt?: Date;
}

interface Unit {
  unit_id: number;
  title: string;
  content_type: string;
  description: string;
  type: string;
  content: string;
  progress: Progress;
  hasDoneQuest?: boolean;
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

const UnitPage: React.FC = ({ params }: any) => {
  const submissionId = params.id;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [completed, setCompleted] = useState(false);
  const [hasDoneQuest, setHasDoneQuest] = useState(false);
  const [courseId, setCourseId] = useState(0);
  const [quest, setQuest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [frontendErrorMessage, setFrontendErrorMessage] = useState("");
  const router = useRouter();
  useEffect(() => {
    setLoading(true);
    if (!submissionId) return;

    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/api/submission/${submissionId}`);
        setUnit(response.data.unit);

        // extract answers, json decode and put back in:
        if (response.data.unit.questionnaire) {
          const quest = response.data.unit.questionnaire;
          quest.forEach((quest: any) => {
            quest.answers = JSON.parse(quest.answers);
            if (quest.type === "multi_choice") {
              quest.answer = JSON.parse(quest.answer);
            }
            if (response.data.unit.progress.completed) {
              quest.checked_answers = JSON.parse(quest.checked_answers);
            }
          });
          setQuest(quest);
        }

        setCompleted(response.data.unit.progress.completed);
        setHasDoneQuest(response.data.hasDoneQuest);
        setCourseId(response.data.unit.course_id);
        setLoading(false);
        console.log(response.data.unit);
      } catch (error: any) {
        const frontendErrorMessage = error.response.data.frontendErrorMessage;
        if (frontendErrorMessage) {
          setFrontendErrorMessage(error.response.data.frontendErrorMessage);
        }
        console.error("Error fetching the unit data", error);
        setLoading(false);
      }
    };

    fetchUnit();
  }, [submissionId]);

  const markAsComplete = async () => {
    try {
      if (!unit) {
        console.error("Unit is undefined");
        return;
      }

      const response = await axios.post(`/api/unit/${submissionId}/complete`);
      setCompleted(true);
      console.log(response);
    } catch (error) {
      console.error("Error marking unit as complete", error);
    }
  };

  const safeContent = unit ? DOMPurify.sanitize(unit.content) : "";

  return (
    console.log(unit),
    console.log(courseId),
    (
      <>
        <Layout>
          {loading ? (
            <div className="loading_spinner">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 100 }} spin />} />
            </div>
          ) : (
            frontendErrorMessage && (
              <Result
                title={frontendErrorMessage}
                extra={
                  <Button type="primary" key="console" onClick={() => {router.push("/courses")}}>
                    Go Back
                  </Button>
                }
              />
            )
            ||
            <>
              <div className="unitpage_main_content">
                <h1>{unit ? unit.title : ""}</h1>
                <p className="unitpage_main_description">
                  {unit ? unit.description : ""}
                </p>
                <Tag
                  color={`${
                    tagColors[completed ? "Completed" : "In Progress"]
                  }`}
                >
                  {completed ? "Completed" : "In Progress"}
                </Tag>
                {completed && <div style={{textAlign: "center"}}>This test has been completed, so you can&apos;t review it anymore!</div>}
                <Divider></Divider>
                <div
                  className="unitpage_main_body"
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                ></div>
              </div>
              {quest.length > 0 && (
                <ReviewForm submissionId={submissionId} courseId={courseId} hasDoneQuest={hasDoneQuest} quest={quest} setQuest={setQuest} unitId={unit?.unit_id} completed={completed} />
              )}
              {quest.length === 0 && (
                <Button
                  className="unitpage_main_button"
                  disabled={completed}
                  onClick={() => {
                    markAsComplete();
                  }}
                >
                  Mark as Completed
                </Button>
              )}
            </>
          )}
        </Layout>
      </>
    )
  );
};

export default UnitPage;
