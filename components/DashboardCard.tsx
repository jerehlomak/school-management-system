
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 ${className}`}>
      {icon && (
        <div className="flex-shrink-0 p-3 rounded-full bg-blue-100 text-blue-600">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
