import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const RecentSales = ({ orders = [] }) => {
  return (
    <div className="space-y-8">
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Chưa có đơn hàng nào gần đây.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.userId?.username || index}`} alt="Avatar" />
              <AvatarFallback>{(order.userId?.username || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1 flex-1">
              <p className="text-sm font-medium leading-none">{order.userId?.username || 'Khách hàng'}</p>
              <p className="text-sm text-muted-foreground">
                {order.service?.name}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +{order.totalPrice?.toLocaleString()}₫
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentSales;
