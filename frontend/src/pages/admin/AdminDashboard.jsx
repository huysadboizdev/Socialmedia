import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Overview from './components/Overview';
import RecentSales from './components/RecentSales';
import Analytics from './components/Analytics';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    systemBalance: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStatsData({
            totalUsers: res.data.stats?.totalUsers || 0,
            todayOrders: res.data.stats?.todayOrders || 0,
            totalOrders: res.data.stats?.totalOrders || 0,
            monthlyRevenue: res.data.stats?.monthlyRevenue || 0,
            totalRevenue: res.data.stats?.totalRevenue || 0,
            systemBalance: res.data.stats?.systemBalance || 0
          });
          
          // Process combined activity
          const orders = (res.data.recentOrders || []).map(o => ({
            type: 'order',
            id: o._id,
            date: new Date(o.orderDate),
            username: o.userId?.username || 'Khách hàng',
            description: o.service?.name || 'Dịch vụ đã xóa',
            amount: o.totalPrice,
            status: o.status
          }));

          const deposits = (res.data.recentDeposits || []).map(d => ({
            type: 'deposit',
            id: d._id,
            date: new Date(d.createdAt),
            username: d.userId?.username || 'Thành viên',
            description: `Nạp tiền: ${d.description || 'Qua ngân hàng'}`,
            amount: d.amount,
            status: d.status
          }));

          const combined = [...orders, ...deposits]
            .sort((a, b) => b.date - a.date)
            .slice(0, 10);
            
          setRecentActivity(combined);
          setAnalyticsData(res.data.analytics || null);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6 transition-colors duration-300 bg-[#f8f9fa] dark:bg-slate-950'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
      </div>
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value='analytics' className='space-y-4'>
          <Analytics data={analyticsData} />
        </TabsContent>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Tổng Doanh Thu
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
                  <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{(statsData.totalRevenue || 0).toLocaleString()} ₫</div>
                <p className='text-xs text-muted-foreground'>
                  +{(statsData.monthlyRevenue || 0).toLocaleString()} ₫ tháng này
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Thành Viên
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
                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                  <circle cx='9' cy='7' r='4' />
                  <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+{(statsData.totalUsers || 0).toLocaleString()}</div>
                <p className='text-xs text-muted-foreground'>
                  +180.1% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Đơn Hàng</CardTitle>
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
                  <rect width='20' height='14' x='2' y='5' rx='2' />
                  <path d='M2 10h20' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>+{(statsData.totalOrders || 0).toLocaleString()}</div>
                <p className='text-xs text-muted-foreground'>
                  +{statsData.todayOrders || 0} hôm nay
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Số Dư Hệ Thống
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
                  <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{(statsData.systemBalance || 0).toLocaleString()} ₫</div>
                <p className='text-xs text-muted-foreground'>
                  +201 kể từ giờ trước
                </p>
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Tổng Quan</CardTitle>
              </CardHeader>
              <CardContent className='pl-2'>
                <Overview />
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  {recentActivity.length} giao dịch gần nhất.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales items={recentActivity} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
