import React, { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  changePeriod?: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changePeriod = 'vs. mes pasado',
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      light: 'bg-blue-100',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      light: 'bg-green-100',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      light: 'bg-red-100',
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      light: 'bg-purple-100',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      light: 'bg-yellow-100',
    }
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color].light}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change !== undefined && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="flex items-center">
              {isPositive && <ArrowUpIcon className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />}
              {isNegative && <ArrowDownIcon className="flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />}
              <span
                className={`font-medium ${
                  isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                } ml-1`}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="ml-1 text-gray-500">{changePeriod}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;