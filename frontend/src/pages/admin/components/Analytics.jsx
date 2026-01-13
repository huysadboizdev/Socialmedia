import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AnalyticsChart from './AnalyticsChart';

const Analytics = ({ data }) => {
  const stats = data || {
    totalClicks: 0,
    uniqueVisitors: 0,
    bounceRate: "0%",
    avgSession: "0s",
    referrers: [],
    devices: []
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Tổng Quan Lưu Lượng</CardTitle>
          <CardDescription>Lượt click và khách truy cập hàng tuần</CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          <AnalyticsChart data={data?.weeklyData} />
        </CardContent>
      </Card>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng Lượt Click</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 3v18h18' />
              <path d='M7 15l4-4 4 4 4-6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{(stats.totalClicks || 0).toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>+12.4% so với tuần trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Khách Truy Cập Duy Nhất
            </CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <circle cx='12' cy='7' r='4' />
              <path d='M6 21v-2a6 6 0 0 1 12 0v2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{(stats.uniqueVisitors || 0).toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>+5.8% so với tuần trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tỷ Lệ Thoát</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 12h6l3 6 3-6h6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.bounceRate}</div>
            <p className='text-xs text-muted-foreground'>-3.2% so với tuần trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Thời Gian Phiên TB</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M12 6v6l4 2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.avgSession}</div>
            <p className='text-xs text-muted-foreground'>+18s so với tuần trước</p>
          </CardContent>
        </Card>
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Nguồn Giới Thiệu</CardTitle>
            <CardDescription>Các nguồn dẫn lưu lượng hàng đầu</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={stats.referrers && stats.referrers.length > 0 ? stats.referrers : [
                { name: 'Đang tải...', value: 0 }
              ]}
              barClass='bg-slate-900 dark:bg-slate-100'
              valueFormatter={(n) => `${n.toLocaleString()}`}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Thiết Bị</CardTitle>
            <CardDescription>Cách người dùng truy cập ứng dụng</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={stats.devices && stats.devices.length > 0 ? stats.devices : [
                { name: 'Đang tải...', value: 0 }
              ]}
              barClass='bg-slate-500'
              valueFormatter={(n) => `${n}%`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function SimpleBarList({ items, valueFormatter, barClass }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className='space-y-3'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`;
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 truncate text-xs text-muted-foreground'>
                {i.name}
              </div>
              <div className='h-2.5 w-full rounded-full bg-muted'>
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium tabular-nums'>
              {valueFormatter(i.value)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default Analytics;
