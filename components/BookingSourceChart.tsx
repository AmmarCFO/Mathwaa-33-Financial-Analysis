import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BookingSourceData {
  name: string;
  value: number;
}

interface BookingSourceChartProps {
  data: BookingSourceData[];
}

const COLORS = ['#A99484', '#8A6E99', '#2A5B64', '#4A2C5A', '#C98B8B'];

const BookingSourceChart: React.FC<BookingSourceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-[#4A2C5A]/70">No booking source data available.</p>;
  }

  return (
    <div style={{ width: '100%', height: 350 }} className="mb-12">
       <h3 className="text-xl sm:text-2xl font-bold text-[#4A2C5A] mb-6 text-center">Tenant Acquisition Channels</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #A99484',
                borderRadius: '0.5rem',
                color: '#4A2C5A'
            }} 
          />
          <Legend wrapperStyle={{ color: '#4A2C5A' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingSourceChart;
