import React, { useEffect, useState } from 'react';
import { Button, Divider } from 'antd';
import UnitForm from './UnitForm';
import axios from 'axios';

interface Unit {
    id: number;
    name: string;
    type: string;
    content: string;
  }

const UnitsBox: React.FC = ({courseId}) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTempId, setUnitTempId] = useState(100);

  useEffect(() => {

    const fetchUnits = async () => {
        try {
            const response = await axios.get(`/api/units/${courseId}`);
            console.log(response.data.units);
            setUnits(response.data.units);
        } catch (error) {
            console.error("Error fetching the units data", error);
        }
    };

    fetchUnits(); // Call the async function
    }, []);

  const addUnit = () => {
    setUnits(prev => [...prev, {id:unitTempId, name:"New Unit", type:"", content:""}]);
    setUnitTempId(prevId => prevId + 1);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Button type="primary" onClick={addUnit} style={{ marginBottom: '20px' }}>
        Add Unit
      </Button>

      {units.map((unit, index) => (
        <div key={index}>
          <UnitForm courseId={courseId} key={unit.id} unit={unit} index={index} />
          <Divider />
        </div>
      ))}
    </div>
  );
};

export default UnitsBox;
