import React, { useEffect, useState } from 'react';
import { Form, Select, Input, Button, message } from 'antd';
import axios from 'axios';
import TextEditor from './TextEditor';

const { Option } = Select;

interface UnitFormProps {
    courseId: number;
    unit: any;
    index: number;
  }

const UnitForm: React.FC<UnitFormProps> = ({ courseId, unit, index }) => { 
    const [unitType, setUnitType] = useState<string | null>(unit.content_type);
    const [formData, setFormData] = useState<any>({
        content: unit.content,
        videoUrl: unit.content_type === 'video' ? unit.content : '',
        question: unit.content_type === 'questionnaire' ? unit.content : ''
    });
  const [unitName, setUnitName] = useState<string>(unit.title);
  const [order, setOrder] = useState(unit.order);

  useEffect(() => {
    setUnitType(unit.content_type);
    setUnitName(unit.title);
    setOrder(unit.order);
}, [unit]);

  const handleUnitTypeChange = (value: string) => {
    setUnitType(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditorChange = (content: string) => {
    setFormData({
        ...formData,
        content: content,  // updating the 'content' property with the editor content
    });
    };

  const handleSubmit = async () => {
    try {
      if (!unitType) {
        message.error('Please select a unit type');
        return;
      }
      console.log("Form Data:");
      console.log({...formData, type: unitType, title: unitName, courseId});
      const apiUrl = '/api/units';
      await axios.post(apiUrl, { ...formData, type: unitType, title: unitName, order: order, courseId, unitId: unit.unit_id });
      message.success('Unit saved successfully');
    } catch (error) {
      console.error('Error saving the unit', error);
      message.error('Failed to save the unit');
    }
  };

  return (
    console.log(unit),
    <>
        <p>{unitName}</p>  {/* Use the index prop here for dynamic unit numbering */}
        <Form layout="vertical">

        <Form.Item label="Unit Name" name="unitName" initialValue={unit.title}>
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

        <Form.Item label="Unit Type" name="unitType" initialValue={unit.content_type}>
            <Select placeholder="Select unit type" onChange={handleUnitTypeChange}>
            <Option value="text">Text</Option>
            <Option value="video">Video</Option>
            <Option value="questionnaire">Questionnaire</Option>
            </Select>
        </Form.Item>

        {unitType === 'text' && (
            <>
            <Form.Item label="Content" name="course" initialValue={unit.content}>
             <TextEditor placeholder='Start spreading your knowledge!' onChange={handleEditorChange} />
            </Form.Item>
          </>
        )}

        {unitType === 'video' && (
            <Form.Item label="Video URL" name="videoUrl" initialValue={unit.videoUrl}>
                <Input placeholder="Enter video URL" name="videoUrl" onChange={handleInputChange} />
            </Form.Item>
        )}

        {unitType === 'questionnaire' && (
            <Form.Item label="Question" name="question">
                <Input placeholder="Enter your question" name="question" onChange={handleInputChange} />
            </Form.Item>
        )}

        <Form.Item>
            <Button type="primary" onClick={handleSubmit} style={{marginTop: "13px"}}>
                Save Unit
            </Button>
        </Form.Item>
        </Form>
    </>
  );
};

export default UnitForm;
