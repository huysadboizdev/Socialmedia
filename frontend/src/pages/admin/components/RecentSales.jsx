import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const RecentSales = ({ items = [] }) => {
  return (
    <div className="space-y-8">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Chưa có hoạt động nào gần đây.</p>
      ) : (
        items.map((item, index) => (
          <div key={`${item.type}-${item.id || index}`} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username || index}`} alt="Avatar" />
              <AvatarFallback>{(item.username || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1 flex-1">
              <p className="text-sm font-medium leading-none">{item.username}</p>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div className={`ml-auto font-medium ${item.type === 'deposit' ? 'text-green-600' : 'text-blue-600'}`}>
              {item.type === 'deposit' ? '+' : '-'}{item.amount?.toLocaleString()}₫
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentSales;
