import React, { useState, useEffect } from 'react';
import { getCandidatesGeographicalDistribution } from '../service/stats';

const GeographicalStats = () => {
  const [geoData, setGeoData] = useState({
    data: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchGeographicalData = async () => {
      try {
        const response = await getCandidatesGeographicalDistribution();
        console.log('Geographical API response:', response.data);
        
        let locationData = [];
        
        // Check if response.data.repartition exists and is an array
        if (response.data && Array.isArray(response.data.repartition)) {
          locationData = response.data.repartition;
        } 
        // Check if response.data itself is an array (if API returns array directly)
        else if (Array.isArray(response.data)) {
          locationData = response.data;
        }
        
        setGeoData({
          data: locationData,
          loading: false,
          error: null
        });
      } catch (error) {
        setGeoData({
          data: [],
          loading: false,
          error: 'Failed to load geographical data'
        });
        console.error('Error fetching geographical data:', error);
      }
    };

    fetchGeographicalData();
  }, []);

  if (geoData.loading) {
    return <div className="flex justify-center items-center p-8">Loading geographical data...</div>;
  }

  if (geoData.error) {
    return <div className="text-red-500 p-4">{geoData.error}</div>;
  }

  // Check if data is an array before using reduce
  const isValidData = Array.isArray(geoData.data);
  
  // Calculate total for percentage calculation
  const total = isValidData 
    ? geoData.data.reduce((sum, item) => sum + (item.count || 0), 0)
    : 0;

  if (!isValidData || geoData.data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Candidate Geographical Distribution</h2>
        <p className="text-gray-500">No geographical data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Candidate Geographical Distribution</h2>
      
      <div className="space-y-4">
        {geoData.data.map((location, index) => {
          const locationCount = location.count || 0;
          const percentage = total > 0 ? Math.round((locationCount / total) * 100) : 0;
          
          return (
            <div key={index} className="border-b pb-3">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{location.adresse || 'Unknown location'}</span>
                <span className="text-gray-600">{locationCount} candidates ({percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeographicalStats; 