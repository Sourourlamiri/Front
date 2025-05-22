import axiosContext from "./axiosContext";

const getAllOffre=()=>{
    return axiosContext.get('/Offre')
}
const getAllrecruteur=()=>{
    return axiosContext.get('/recruteur')
}

const getAllcategorie=()=>{
    return axiosContext.get('/Categorie')
}


const getOffreById=(id)=>{
   return axiosContext.get(`/Offre/${id}`)
}

const getrecruteurById=(id)=>{
    return axiosContext.get(`/recruteur/${id}`)
 }
 
const getCandidatById=(id)=>{
    return axiosContext.get(`/Candidat/${id}`)
}
 
// Fonction pour soumettre une candidature
const postuler = (candidatId, offreId, cvFile) => {
    const formData = new FormData();
    formData.append('Candidat', candidatId);
    formData.append('Offre', offreId);
    if (cvFile) {
        formData.append('file', cvFile);
    }

    return axiosContext.post('/Candidature', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// Fonction pour supprimer une candidature
const supprimerCandidature = (candidatureId) => {
    return axiosContext.delete(`/Candidature/${candidatureId}`);
}

// Fonctions pour gérer les avis (reviews)
const getAllAvis = () => {
    return axiosContext.get('/avis');
}

const getAvisByRecruteur = (recruteurId) => {
    return axiosContext.get(`/avis/by-recruteur/${recruteurId}`);
}

const getAvisByRecruteurAndCandidat = (recruteurId, candidatId) => {
    return axiosContext.get(`/avis/by-recruteur-candidat/${recruteurId}/${candidatId}`);
}

const createAvis = (avisData) => {
    return axiosContext.post('/avis', avisData);
}

const updateAvis = (avisId, avisData) => {
    return axiosContext.put(`/avis/${avisId}`, avisData);
}

const deleteAvis = (avisId) => {
    return axiosContext.delete(`/avis/${avisId}`);
}

export default { 
    getAllOffre,
    getAllrecruteur,
    getAllcategorie,
    getOffreById,
    getrecruteurById,
    getCandidatById,
    postuler,
    supprimerCandidature,
    getAllAvis,
    getAvisByRecruteur,
    getAvisByRecruteurAndCandidat,
    createAvis,
    updateAvis,
    deleteAvis
};
