import React, { useState, useEffect } from 'react';
import Header from '../../../componentsVC/header';
import { Link } from 'react-router-dom';
import Footer from '../../../componentsVC/footer';
import apiCandidat from '../../../service/apiCandidat';

const MonCompte = () => {
  const [data, setData] = useState({});

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const user = localStorage.getItem("utilisateur");
  const parseUser = JSON.parse(user);

  const getInformation = async (id) => {
    try {
      const response = await apiCandidat.getCandidat(id);
      setData(response.data.getCandidat);
    } catch (error) {
      console.log("Erreur lors de la récupération des données:", error);
    }
  };

  useEffect(() => {
    if (parseUser && parseUser.utilisateur && parseUser.utilisateur._id) {
      getInformation(parseUser.utilisateur._id);
    }
  }, []);

  const updateRecruteur = async (e) => {
    e.preventDefault();
    try {
      const response = await apiCandidat.updateCandidat(parseUser.utilisateur._id, data);
      alert("Profil modifié avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: "100px" }}>

        <div className="card shadow rounded">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">👤 Mon Espace Candidat</h4>
          </div>
          <div className="card-body">
            <form onSubmit={updateRecruteur} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="nom" className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nom"
                    name="Nom"
                    value={data?.Nom || ""}
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="prenom" className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="prenom"
                    name="Prenom"
                    value={data?.Prenom || ""}
                    onChange={onChangeHandler}
                  />
                </div>
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
                <label htmlFor="CIN" className="form-label">CIN</label>
                <input
                  type="email"
                  className="form-control"
                  id="CIN"
                  name="CIN"
                  value={data?.CIN || ""}
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
              <div className="text-end">
  <button type="submit" className="btn btn-success px-4">
    🖉 Modifier Profil
  </button>

</div>


     

            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MonCompte;
