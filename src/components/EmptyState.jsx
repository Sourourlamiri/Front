import React from 'react';

/**
 * Component for displaying an empty state message
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.message - Message to display
 * @returns {React.ReactElement}
 */
const EmptyState = ({ icon, message }) => {
  return (
    <div className="text-center py-4 text-muted">
      <div className="mb-2">
        {icon}
      </div>
      <p className="mb-0">{message}</p>
    </div>
  );
};

export default EmptyState; 