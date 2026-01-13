import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const AnalyticsChart = ({ data = [] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'T2', clicks: 0, uniques: 0 },
    { name: 'T3', clicks: 0, uniques: 0 },
    { name: 'T4', clicks: 0, uniques: 0 },
    { name: 'T5', clicks: 0, uniques: 0 },
    { name: 'T6', clicks: 0, uniques: 0 },
    { name: 'T7', clicks: 0, uniques: 0 },
    { name: 'CN', clicks: 0, uniques: 0 },
  ];
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Area
          type='monotone'
          dataKey='clicks'
          name="Lượt click"
          stroke='currentColor'
          className='text-slate-900 dark:text-slate-100'
          fill='currentColor'
          fillOpacity={0.15}
        />
        <Area
          type='monotone'
          dataKey='uniques'
          name="Khách duy nhất"
          stroke='currentColor'
          className='text-slate-500'
          fill='currentColor'
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;
