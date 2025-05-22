import axiosContext from "./axiosContext";

const getAllRecruteur = () => {
    return axiosContext.get('/recruteur');
};

const activerRecruteur = (id) => {
    return axiosContext.patch(`/recruteur/activer/${id}`);
};

const desactiverRecruteur = (id) => {
    return axiosContext.patch(`/recruteur/${id}/desactiver`);
};

const getByIdRecruteur = (id) => {
    console.log("Fetching recruteur ID:", id);
    return axiosContext.get(`/recruteur/${id}`);
};

export { activerRecruteur, desactiverRecruteur };
export default { getAllRecruteur, getByIdRecruteur, activerRecruteur, desactiverRecruteur };

