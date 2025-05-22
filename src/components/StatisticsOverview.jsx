import React, { useState, useEffect } from 'react';
import { 
  getTotalCandidates, 
  getTotalApplications, 
  getTotalJobOffers, 
  getTotalRecruiters 
} from '../service/stats';

const StatisticsOverview = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalApplications: 0,
    totalJobOffers: 0,
    totalRecruiters: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [
          candidatesResponse,
          applicationsResponse,
          jobOffersResponse,
          recruitersResponse
        ] = await Promise.all([
          getTotalCandidates(),
          getTotalApplications(),
          getTotalJobOffers(),
          getTotalRecruiters()
        ]);

        console.log('Total candidates API response:', candidatesResponse.data);
        console.log('Total applications API response:', applicationsResponse.data);
        console.log('Total job offers API response:', jobOffersResponse.data);
        console.log('Total recruiters API response:', recruitersResponse.data);

        // Extract values with safe fallbacks
        const extractTotal = (response) => {
          if (response && response.data && typeof response.data.total === 'number') {
            return response.data.total;
          }
          return 0;
        };

        setStats({
          totalCandidates: extractTotal(candidatesResponse),
          totalApplications: extractTotal(applicationsResponse),
          totalJobOffers: extractTotal(jobOffersResponse),
          totalRecruiters: extractTotal(recruitersResponse),
          loading: false,
          error: null
        });
      } catch (error) {
        setStats(prevState => ({
          ...prevState,
          loading: false,
          error: 'Failed to load statistics'
        }));
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  if (stats.loading) {
    return <div className="flex justify-center items-center p-8">Loading statistics...</div>;
  }

  if (stats.error) {
    return <div className="text-red-500 p-4">{stats.error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Platform Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-500 text-sm font-medium">Total Candidates</p>
          <p className="text-3xl font-bold">{stats.totalCandidates}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-500 text-sm font-medium">Total Applications</p>
          <p className="text-3xl font-bold">{stats.totalApplications}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-500 text-sm font-medium">Total Job Offers</p>
          <p className="text-3xl font-bold">{stats.totalJobOffers}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-orange-500 text-sm font-medium">Total Recruiters</p>
          <p className="text-3xl font-bold">{stats.totalRecruiters}</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsOverview; 