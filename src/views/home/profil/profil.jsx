import React, { useState, useEffect } from "react";
import administrateur from "../../../service/administrateur";
import SnackbarAlert from "../../../components/SnackbarAlert";
import "./profil.css";

const Profil = () => {
  const [data, setData] = useState();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  //
  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  //
  const user = localStorage.getItem("utilisateur");
  console.log("utilisateur localstorage", user);
  const parseUser = JSON.parse(user);
  console.log("data localstorage", user);
  // tjib les donnees
  const getInformation = async (id) => {
    try {
      const response = await administrateur.getadministrateur(id);
      setData(response.data.getAdministrateur);
      console.log("Les informations de l'administrateur:", response.data);
    } catch (error) {
      console.log("Erreur lors de la récupération des données:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des données",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    if (parseUser && parseUser.utilisateur && parseUser.utilisateur._id) {
      console.log("id admin", parseUser.utilisateur._id);
      getInformation(parseUser.utilisateur._id);
    }
  }, []);

  // modifier
  const updateadministrateur = async (e) => {
    e.preventDefault();
    try {
      const response = await administrateur.updateadministrateur(
        parseUser.utilisateur._id,
        data
      );
      console.log("Les données ont été modifiées:", response.data);
      setSnackbar({
        open: true,
        message: "Profil modifié avec succès",
        severity: "success",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la mise à jour du profil",
        severity: "error",
      });
    }
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title fw-semibold mb-4">Espace administrateur</h5>
          <div className="card">
            <div className="card-body">
              <form
                onSubmit={updateadministrateur}
                encType="multipart/form-data"
              >
                <div className="mb-3">
                  <label htmlFor="nom" className="form-label">
                    Nom
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nom"
                    name="Nom"
                    value={data?.Nom}
                    onChange={onChangeHandler}
                  />
                </div>
              
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    E-mail
                  </label>
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
                  <label htmlFor="adresse" className="form-label">
                    Adresse
                  </label>
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
                  <label htmlFor="telephone" className="form-label">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="telephone"
                    name="Telephone"
                    value={data?.Telephone || ""}
                    onChange={onChangeHandler}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  🖉 Modifier Profil
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Profil;
