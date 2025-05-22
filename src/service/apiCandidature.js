import axiosContext from "./axiosContext";

// Objet qui contient toutes les méthodes pour interagir avec l'API des candidatures
const apiCandidature = {
  // Récupérer la liste de toutes les candidatures
  getAllCandidatures: () => axiosContext.get("/Candidature"),

  // Récupérer une candidature par son ID
  getCandidatureById: (id) => axiosContext.get(`/Candidature/${id}`),

  // Récupérer les candidatures d'un candidat
  getCandidaturesByCandidat: (candidatId) =>
    axiosContext.get(`/Candidat/${candidatId}`),

  // Créer une nouvelle candidature
  createCandidature: (data) => axiosContext.post("/Candidature", data),

  // Mettre à jour une candidature
  updateCandidature: (id, data) => axiosContext.put(`/Candidature/${id}`, data),

  // Mettre à jour uniquement le statut d'une candidature
  updateCandidatureStatus: (id, statut) =>
    axiosContext.patch(`/Candidature/${id}/statut`, { statut }),

  // Supprimer une candidature
  deleteCandidature: (id) => axiosContext.delete(`/Candidature/${id}`),

  // Obtenir des statistiques sur les candidatures
  getCandidaturesStatsByStatus: () =>
    axiosContext.get("/Candidature/stat/par-statut"),
  getCandidaturesTotal: () => axiosContext.get("/Candidature/stat/total"),
};

export default apiCandidature;
