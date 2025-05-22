import axiosContext from "./axiosContext";

// Candidate Statistics
const getTotalCandidates = () => {
  return axiosContext.get('/Candidat/stat/total');
};

const getCandidatesGeographicalDistribution = () => {
  return axiosContext.get('/Candidat/stat/geographique');
};

// Job Application Statistics
const getTotalApplications = () => {
  return axiosContext.get('/Candidature/stat/total');
};

const getApplicationsByRecruiterStatus = () => {
  return axiosContext.get('/Candidature/stat/statut');
};

const getApplicationsByAddress = () => {
  return axiosContext.get('/Candidature/stat/par-adresse');
};

// Job Offer Statistics
const getTotalJobOffers = () => {
  return axiosContext.get('/Offre/stat/total');
};

const getApplicationsPerJobOffer = () => {
  return axiosContext.get('/Offre/stat/nbCandidature');
};

// Recruiter Statistics
const getTotalRecruiters = () => {
  return axiosContext.get('/recruteur/stat/total');
};

const getAvailablePositionsPerRecruiter = () => {
  return axiosContext.get('/recruteur/stat/nbPosteDispo');
};

export {
  getTotalCandidates,
  getCandidatesGeographicalDistribution,
  getTotalApplications,
  getApplicationsByRecruiterStatus,
  getApplicationsByAddress,
  getTotalJobOffers,
  getApplicationsPerJobOffer,
  getTotalRecruiters,
  getAvailablePositionsPerRecruiter
}; 