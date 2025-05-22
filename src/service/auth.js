import { data } from "react-router-dom";
import axiosContext from "./axiosContext";

const signIn=(data)=>{
    return axiosContext.post("/auth/signin",data)
}
const forget=(Email)=>{
    return axiosContext.post('/auth/forget',Email)
}
const reset = (token, newPassword) => {
    return axiosContext.post(`/auth/reset-password/${token}`, {newPassword });
  };
  

const createrecruteur=(formData)=>{
    return axiosContext.post("/recruteur", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
}

const createCandidat=(formData)=>{
    return axiosContext.post("/Candidat",formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
}

export default{signIn,forget,reset,createrecruteur,createCandidat }