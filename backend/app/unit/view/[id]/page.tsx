"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Button, Divider, Tag, Typography } from "antd";
import DOMPurify from "dompurify";
import AnswerForm from "@/components/AnswerForm";

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
  const id = params.id;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [completed, setCompleted] = useState(false);
  const [quest, setQuest] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (!id) return;

    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/api/unit/${id}`);
        setUnit(response.data.unit);

        // extract answers, json decode and put back in:
        const quest = response.data.unit.questionnaire;
        quest.forEach((quest: any) => {
          quest.answers = JSON.parse(quest.answers);
        });
        setQuest(quest);

        setCompleted(response.data.unit.progress.completed);
        console.log(response.data.unit);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the unit data", error);
      }
    };

    fetchUnit();
  }, [id]);

  const markAsComplete = async () => {
    try {
      if (!unit) {
        console.error("Unit is undefined");
        return;
      }

      const response = await axios.post(`/api/unit/${id}/complete`);
      setCompleted(true);
      console.log(response);
    } catch (error) {
      console.error("Error marking unit as complete", error);
    }
  }

  const safeContent = unit ? DOMPurify.sanitize(unit.content) : "";

  return (
    console.log(unit),
    (
      <>
        <Layout>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="unitpage_main_content">
                <h1>{unit ? unit.title : ""}</h1>
                <p className="unitpage_main_description">
                  {unit ? unit.description : ""}
                </p>
                <Tag
                  color={`${
                    tagColors[
                      completed ? "Completed" : "In Progress"
                    ]
                  }`}
                >
                  {completed ? "Completed" : "In Progress"}
                </Tag>
                <Divider></Divider>
                <div className="unitpage_main_body" dangerouslySetInnerHTML={{ __html: safeContent }}></div>
              </div>
              <AnswerForm quest={quest} setQuest={setQuest} />
              <Button className="unitpage_main_button" disabled={completed} onClick={() => {markAsComplete()}}>Mark as Completed</Button>
            </>
          )}
        </Layout>
      </>
    )
  );
};

export default UnitPage;
