import React, { useState, useEffect } from 'react';
import apiRecruteurinterface from '../../../service/apiRecruteurinterface';


const Profilrecruteur = () => {
  const [data, setData] = useState({});

  //  Gestion du changement des inputs
  const onChangeHandler = (e) => {
      setData({ ...data, [e.target.name]: e.target.value });

  };
  //   Récupération de l'utilisateur depuis le localStorage
  const user = localStorage.getItem("utilisateur");
  console.log('utilisateur localstorage',user)
  const parseUser = JSON.parse(user);
  console.log('data localstorage',user)

  // Récupérer les informations du recruteur
  const getInformation = async (id) => {
    try {
      const response = await apiRecruteurinterface.getRecruteur(id);
      setData(response.data.getRecruteur);
      console.log("Les informations de recruteur:", response.data);
    } catch (error) {
      console.log("Erreur lors de la récupération des données:", error);
    }
  };

  useEffect(() => {
    if (parseUser && parseUser.utilisateur && parseUser.utilisateur._id) {
      console.log('id recruteur',parseUser.utilisateur._id)
      getInformation(parseUser.utilisateur._id);
    }
  }, []);

  // Modifier le recruteur
  const updateRecruteur = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRecruteurinterface.updateRecruteur(parseUser.utilisateur._id, data);
      console.log('Les données ont été modifiées:', response.data);
      alert("Profil modifié avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title fw-semibold mb-4">Espace recruteur</h5>
          <div className="card">
            <div className="card-body">
              <form onSubmit={updateRecruteur} encType="multipart/form-data">
               
                <div className="mb-3">
                  <label htmlFor="nom" className="form-label">NomEntreprise</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="nom" 
                    name="Nom"  
                    value={data?.NomEntreprise} 
                    onChange={onChangeHandler} 
                  />
                </div>

               

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-mail</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="Email"  
                    value={data?.Email || ""} 
                    onChange={onChangeHandler} 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="adresse" className="form-label">Adresse</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="adresse" 
                    name="Adresse"  
                    value={data?.Adresse || ""} 
                    onChange={onChangeHandler} 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="telephone" className="form-label">Téléphone</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="telephone" 
                    name="Telephone"  
                    value={data?.Telephone || ""} 
                    onChange={onChangeHandler} 
                  />
                </div>
                <button type="submit" className="btn btn-primary">🖉 Modifier Profil</button>


              
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profilrecruteur;
