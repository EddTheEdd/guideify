"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Typography, Card, Space } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import UnitsBox from '@/components/UnitsBox';

const { Title, Text } = Typography;

interface Course {
    id: number;
    name: string;
    description: string;
    // Add other fields as needed
}

const CoursePage: React.FC = ({params}: any) => {
    const id = params.id; 
    console.log(id);
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        if (!id) return; // Return if id is not available yet

        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/courses/${id}`);
                setCourse(response.data.course);
            } catch (error) {
                console.error("Error fetching the course data", error);
            }
        };

        fetchCourse(); // Call the async function
    }, [id]);

    return (
        console.log(id),
        <Layout>
            {course ? (
                <Card bordered={false} style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Title level={2}>{course.name}</Title>
                    <Text>{course.description}</Text>
                    {/* You can add more course details here */}
                </Card>
            ) : (
                <Content>Loading...</Content> // Adjust this part based on your design preferences
            )}
            {/* Space for more development work */}
            <Space direction="vertical" style={{ width: '100%', marginTop: 20 }}>
                <UnitsBox courseId={id}/>
            </Space>
        </Layout>
    );
};

export default CoursePage;
