import axiosContext from "./axiosContext";

// (Recruteur)
const getRecruteur = (id) => {
  return axiosContext.get(`/recruteur/${id}`, { responseType: "json" });
};

// (Recruteur)
const updateRecruteur = (id, data) => {
  return axiosContext.put(`/recruteur/${id}`, data);
};

// changer mot de passe recruteur
const updateMotDePasse = (id, MotDePasse, newPassword) => {
  return axiosContext.put(`/auth/update-password/${id}`, {
    MotDePasse,
    newPassword,
  });
};

const getAllCategories = () => {
  return axiosContext.get("/Categorie");
};

// (Offres d'emploi)
const getAllOffre = () => {
  console.log("Fetching all offres");
  return axiosContext.get("/Offre");
};

const getByIdOffre = (id) => {
  console.log("Fetching offre ID:", id);
  return axiosContext.get(`/Offre/${id}`);
};

const addOffre = (data) => {
  console.log("Adding offre:", data);
  return axiosContext.post("/Offre", data);
};

const updateOffre = (id, data) => {
  console.log("Updating offre ID:", id);
  return axiosContext.put(`/Offre/${id}`, data);
};

const deleteOffre = (id) => {
  console.log("delete offre ID:", id);
  return axiosContext.delete(`/Offre/${id}`);
};

const getByICandidateur = (id) => {
  console.log("Fetching candidateur ID:", id);
  return axiosContext.get(`/Candidature/${id}`);
};

// (Entretiens)
const getAllEntretien = () => {
  console.log("Fetching all entretiens");
  return axiosContext.get("/entretien");
};

const getByIdEntretien = (id) => {
  console.log("Fetching entretien ID:", id);
  return axiosContext.get(`/entretien/${id}`);
};

const addEntretien = (data) => {
  console.log("Adding Entretien:", data);
  return axiosContext.post("/entretien", data);
};

const updateEntretien = (id, data) => {
  console.log("Updating Entretien ID:", id);
  return axiosContext.put(`/entretien/${id}`, data);
};

const deleteEntretien = (id) => {
  console.log("Deleting Entretien ID:", id);
  return axiosContext.delete(`/entretien/${id}`);
};

// (Catégories)
const getAllCategorie = () => {
  console.log("Fetching all categories");
  return axiosContext.get("/Categorie");
};

const getByIdCategorie = (id) => {
  console.log("Fetching category ID:", id);
  return axiosContext.get(`/Categorie/${id}`);
};

const addCategorie = (data) => {
  console.log("Adding Categorie:", data);
  return axiosContext.post("/Categorie", data);
};

const updateCategorie = (id, data) => {
  console.log("Fetching category ID:", id);
  return axiosContext.put(`/Categorie/${id}`, data);
};

const deleteCategorie = (id) => {
  console.log("delete Categorie ID:", id);
  return axiosContext.delete(`/Categorie/${id}`);
};

// (Candidat)
const getCandidatsByOffre = (offreId) => {
  return axiosContext.get(`/Offre/${offreId}`, { responseType: "json" });
};

// (Candidature status update)
const updateCandidatureStatus = (candidatureId, status) => {
  console.log(`Updating candidature ${candidatureId} status to ${status}`);
  return axiosContext.patch(`/Candidature/${candidatureId}/statut`, {
    statut: status,
  });
};

// Regrouper toutes les fonctions API
const apiRecruteurInterface = {
  getRecruteur,
  updateRecruteur,
  updateMotDePasse,

  getAllOffre,
  getByIdOffre,
  addOffre,
  updateOffre,
  deleteOffre,

  getAllEntretien,
  getByIdEntretien,
  addEntretien,
  updateEntretien,
  deleteEntretien,

  updateCandidatureStatus,

  getAllCategorie,
  getByIdCategorie,
  addCategorie,
  updateCategorie,
  deleteCategorie,

  getAllCategories,
  getCandidatsByOffre,
  getByICandidateur,
};

export default apiRecruteurInterface;
