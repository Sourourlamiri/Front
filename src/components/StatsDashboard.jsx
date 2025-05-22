import React from 'react';
import StatisticsOverview from './StatisticsOverview';
import GeographicalStats from './GeographicalStats';
import JobOfferStats from './JobOfferStats';

const StatsDashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">RecruitEase Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <StatisticsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GeographicalStats />
          <JobOfferStats />
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard; 