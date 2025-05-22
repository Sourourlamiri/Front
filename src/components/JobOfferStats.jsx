import React, { useState, useEffect } from 'react';
import { getTotalJobOffers, getApplicationsPerJobOffer } from '../service/stats';

const JobOfferStats = () => {
  const [statsData, setStatsData] = useState({
    totalOffers: 0,
    offersWithApplications: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchJobOfferStats = async () => {
      try {
        const [totalResponse, applicationsResponse] = await Promise.all([
          getTotalJobOffers(),
          getApplicationsPerJobOffer()
        ]);

        console.log('Total offers API response:', totalResponse.data);
        console.log('Applications per offer API response:', applicationsResponse.data);

        let offersData = [];
        let totalOffersCount = 0;

        // Extract total offers count
        if (totalResponse.data && typeof totalResponse.data.total === 'number') {
          totalOffersCount = totalResponse.data.total;
        }

        // Extract applications per offer data
        if (applicationsResponse.data && Array.isArray(applicationsResponse.data.data)) {
          offersData = applicationsResponse.data.data;
        } else if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
          offersData = applicationsResponse.data;
        }

        setStatsData({
          totalOffers: totalOffersCount,
          offersWithApplications: offersData,
          loading: false,
          error: null
        });
      } catch (error) {
        setStatsData(prevState => ({
          ...prevState,
          loading: false,
          error: 'Failed to load job offer statistics'
        }));
        console.error('Error fetching job offer statistics:', error);
      }
    };

    fetchJobOfferStats();
  }, []);

  if (statsData.loading) {
    return <div className="flex justify-center items-center p-8">Loading job offer statistics...</div>;
  }

  if (statsData.error) {
    return <div className="text-red-500 p-4">{statsData.error}</div>;
  }

  // Validate offers data
  const isValidOffersData = Array.isArray(statsData.offersWithApplications);
  
  if (!isValidOffersData || statsData.offersWithApplications.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Job Offer Statistics</h2>
        
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg inline-block">
            <p className="text-blue-500 text-sm font-medium">Total Job Offers</p>
            <p className="text-3xl font-bold">{statsData.totalOffers}</p>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-4">Applications per Job Offer</h3>
        <p className="text-gray-500">No application data available</p>
      </div>
    );
  }

  // Sort offers by number of applications (descending)
  const sortedOffers = [...statsData.offersWithApplications].sort((a, b) => 
    (b.nbCandidatures || 0) - (a.nbCandidatures || 0)
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Job Offer Statistics</h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg inline-block">
          <p className="text-blue-500 text-sm font-medium">Total Job Offers</p>
          <p className="text-3xl font-bold">{statsData.totalOffers}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Applications per Job Offer</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedOffers.map((offer, index) => {
              // Get application count with fallback to 0
              const applicationCount = offer.nbCandidatures || 0;
              
              // Calculate percentage for visualization
              const maxApplications = sortedOffers[0].nbCandidatures || 0;
              const percentage = maxApplications > 0 
                ? Math.round((applicationCount / maxApplications) * 100) 
                : 0;
              
              return (
                <tr key={offer.offreId || index}>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{offer.titre || 'Untitled Position'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{applicationCount}</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobOfferStats; 