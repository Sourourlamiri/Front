import React, { useState, useEffect } from 'react';
import Header from '../../../componentsVC/header';
import { Link } from 'react-router-dom';
import Footer from '../../../componentsVC/footer';
import apiCandidat from '../../../service/apiCandidat';
import SnackbarAlert from "../../../components/SnackbarAlert";

const MonCompte = () => {
  const [data, setData] = useState({});

  // Gestion des champs du formulaire
  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // État pour l'affichage des messages Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const user = localStorage.getItem("utilisateur");
  const parseUser = JSON.parse(user);

  // Récupérer les infos du candidat
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

  // Mise à jour du profil candidat
  const updateCandidat= async (e) => {
    e.preventDefault();
    try {
      await apiCandidat.updateCandidat(parseUser.utilisateur._id, data);
      // Afficher message de succès
      showSnackbar("Profil mis à jour avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      // Afficher message d'erreur
      showSnackbar("Erreur lors de la mise à jour du profil", "error");
    }
  };

  // Fermer la Snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Afficher une alerte Snackbar
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
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
            <form onSubmit={updateCandidat} encType="multipart/form-data">
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
                  type="text"
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

        {/* Snackbar pour les messages de succès ou d'erreur */}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
        />
      </div>
      <Footer />
    </>
  );
};

export default MonCompte;
