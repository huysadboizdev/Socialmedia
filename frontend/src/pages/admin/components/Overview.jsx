import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const Overview = ({ data = [] }) => {
  // If no data is provided, use some dummy data for visualization
  const chartData = data.length > 0 ? data : [
    { name: 'Jan', total: 1200 },
    { name: 'Feb', total: 2100 },
    { name: 'Mar', total: 800 },
    { name: 'Apr', total: 1600 },
    { name: 'May', total: 900 },
    { name: 'Jun', total: 1700 },
    { name: 'Jul', total: 1500 },
    { name: 'Aug', total: 2300 },
    { name: 'Sep', total: 1800 },
    { name: 'Oct', total: 1400 },
    { name: 'Nov', total: 2000 },
    { name: 'Dec', total: 2200 },
  ];

  try {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value || 0).toLocaleString()}₫`}
          />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-slate-900 dark:fill-slate-100"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  } catch (err) {
    console.error("Overview Chart Error:", err);
    return <div className="h-[350px] flex items-center justify-center bg-muted/20">Lỗi hiển thị biểu đồ</div>;
  }
};

export default Overview;
