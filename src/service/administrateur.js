
import axiosContext from "./axiosContext";

const getadministrateur=(id)=>{
    return axiosContext.get(`/administrateur/${id}`) 
}
const updateadministrateur=(id,data)=>{
    return axiosContext.put(`/administrateur/${id}`,data) 
}

// changer mot de passe
const updateMotDePasse=(id,MotDePasse,newPassword)=>{
    return axiosContext.put(`/auth/update-password/${id}`,{MotDePasse,newPassword}) 
}
const countRecreture=()=>{
    return axiosContext.get(`/recruteur/stat/total`) 
}

const countCandidat=()=>{
    return axiosContext.get(`/Candidat/stat/total`) 
}

// candidature 
const countCandidature=()=>{
    return axiosContext.get(`/Candidature/stat/total`)
}

// Méthode pour compter le nombre de candidature par poste
const nbCandidaturesOffre = () => {
    return axiosContext.get(`/stat/nbCandidature`)
  
}
  
export default {getadministrateur,updateadministrateur,updateMotDePasse,countRecreture,countCandidat,countCandidature,nbCandidaturesOffre}