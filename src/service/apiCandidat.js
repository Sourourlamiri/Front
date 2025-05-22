import axiosContext from "./axiosContext";

// Objet qui contient toutes les méthodes pour interagir avec l'API des candidats
const apiCandidat = {
  //  Récupérer la liste de tous les candidats
  getAllCandidat: () => axiosContext.get("/Candidat"),

  //  Récupérer un candidat par son ID
  getByIdCandidat: (id) => axiosContext.get(`/Candidat/${id}`),

  //  Mettre à jour les informations d'un candidat
  updateCandidat: (id, data) => axiosContext.put(`/Candidat/${id}`, data),

  //  Changer le mot de passe d'un candidat
  updateMotDePasse: (id, MotDePasse, newPassword) =>
    axiosContext.put(`/auth/update-password/${id}`, {
      MotDePasse,
      newPassword,
    }),

  //  Récupérer un candidat avec la réponse en format JSON
  getCandidat: (id) =>
    axiosContext.get(`/Candidat/${id}`, { responseType: "json" }),

  // Récupérer les entretiens d'un candidat
  getEntretiensByCandidat: (id) =>
    axiosContext.get(`/entretien/candidat/${id}`, { responseType: "json" }),

  // Gestion des certifications
  getCertification: (id) =>
    axiosContext.get(`/Certification/${id}`, { responseType: "json" }),

  addCertification: (data) => {
    // Transforming from candidatId to Candidat for API compatibility
    const apiData = {
      nomCertification: data.nomCertification,
      date_Dobtention: data.date_Dobtention,
      Candidat: data.candidatId,
    };
    return axiosContext.post("/Certification", apiData);
  },

  updateCertification: (id, data) => {
    const apiData = { ...data };
    delete apiData.candidatId; // Remove candidatId if present
    return axiosContext.put(`/Certification/${id}`, apiData);
  },

  deleteCertification: (id) => axiosContext.delete(`/Certification/${id}`),

  // Gestion des compétences
  getCompetence: (id) =>
    axiosContext.get(`/Competence/${id}`, { responseType: "json" }),

  addCompetence: (data) => {
    // Transforming from candidatId to Candidat for API compatibility
    const apiData = {
      nomCompétence: data.nomCompétence,
      niveau: data.niveau,
      Candidat: data.candidatId,
    };
    return axiosContext.post("/Competence", apiData);
  },

  updateCompetence: (id, data) => {
    const apiData = { ...data };
    delete apiData.candidatId; // Remove candidatId if present
    return axiosContext.put(`/Competence/${id}`, apiData);
  },

  deleteCompetence: (id) => axiosContext.delete(`/Competence/${id}`),

  // Gestion des expériences professionnelles
  getExperience: (id) =>
    axiosContext.get(`/Experience/${id}`, { responseType: "json" }),

  addExperience: (data) => {
    // Transforming from candidatId to Candidat for API compatibility
    const apiData = {
      nomExpérience: data.nomExpérience,
      date_Debut: data.date_Debut,
      date_Fin: data.date_Fin,
      entreprise: data.entreprise,
      description: data.description,
      Candidat: data.candidatId,
    };
    console.log("Sending experience data to API:", apiData); // Debug
    return axiosContext.post("/Experience", apiData);
  },

  updateExperience: (id, data) => {
    const apiData = { ...data };
    delete apiData.candidatId; // Remove candidatId if present

    // Ensure critical fields are present
    if (!apiData.entreprise && data.entreprise) {
      apiData.entreprise = data.entreprise;
    }

    console.log("Updating experience with data:", apiData); // Debug
    return axiosContext.put(`/Experience/${id}`, apiData);
  },

  deleteExperience: (id) => axiosContext.delete(`/Experience/${id}`),

  // Gestion des formations
  getFormation: (id) =>
    axiosContext.get(`/Formation/${id}`, { responseType: "json" }),

  addFormation: (data) => {
    // Transforming from candidatId to Candidat for API compatibility
    const apiData = {
      nomFormation: data.nomFormation,
      date_obtention: data.date_obtention,
      etablissement: data.etablissement,
      description: data.description,
      Candidat: data.candidatId,
    };
    return axiosContext.post("/Formation", apiData);
  },

  updateFormation: (id, data) => {
    const apiData = { ...data };
    delete apiData.candidatId; // Remove candidatId if present
    return axiosContext.put(`/Formation/${id}`, apiData);
  },

  deleteFormation: (id) => axiosContext.delete(`/Formation/${id}`),
};

export default apiCandidat;
