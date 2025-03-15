import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, footer, className = '' }) => {
  return (
    <div className={`bg-white overflow-hidden shadow-sm rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">{footer}</div>
      )}
    </div>
  );
};

export default Card;