import React, { useEffect, useState } from "react";
import apiRecruteur, {
  activerRecruteur,
  desactiverRecruteur,
} from "../../../service/apiRecruteur";
import {
  BsFillEyeFill,
  BsFillCheckCircleFill,
  BsFillXCircleFill,
} from "react-icons/bs";
import { Modal, Button } from "react-bootstrap";
import SnackbarAlert from "../../../components/SnackbarAlert";
// import 'bootstrap/dist/css/bootstrap.min.css';
import "./ListRecruteurs.css";

const ListeRecruteurs = () => {
  const [data, setData] = useState([]); // État pour stocker la liste des recruteurs
  const [selectedRecruteur, setSelectedRecruteur] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvedStatus, setApprovedStatus] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // État pour gérer le statut d'approbation des recruteurs
  const getAllRecruteur = async () => {
    try {
      const response = await apiRecruteur.getAllRecruteur();
      setData(response.data.list);
      console.log("Liste des recruteurs:", response.data.list);

      // Mettre à jour l'état des recruteurs approuvés
      // en utilisant la réponse de l'API
      setApprovedStatus(
        response.data.list.reduce((acc, item) => {
          acc[item._id] = item.approved;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des recruteurs :", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des recruteurs",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getByIdRecruteur = async (id) => {
    if (!id) {
      console.error("ID invalide pour voir les détails !");
      setSnackbar({
        open: true,
        message: "ID invalide pour voir les détails",
        severity: "error",
      });
      return;
    }
    try {
      const response = await apiRecruteur.getByIdRecruteur(id);
      setSelectedRecruteur(response.data.getRecruteur);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors de la récupération du recruteur :", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération du recruteur",
        severity: "error",
      });
    }
  };

  // Fonction pour activer le compte recruteur
  const activerCompteRecruteur = async (id) => {
    try {
      const response = await apiRecruteur.activerRecruteur(id); // appel de l'API pour activer le recruteur
      // Mise à jour de l'état d'approbation
      console.log("recruteur activé avec succès !", response);
      setSnackbar({
        open: true,
        message: "Recruteur activé avec succès !",
        severity: "success",
      });
      getAllRecruteur(); // actualiser la liste des recruteurs
    } catch (error) {
      console.error("Erreur lors de l'activation :", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de l'activation !",
        severity: "error",
      });
    }
  };

  // Fonction pour désactiver le compte recruteur
  const desactiverCompteRecruteur = async (id) => {
    try {
      await desactiverRecruteur(id);
      setSnackbar({
        open: true,
        message: "Recruteur désactivé avec succès !",
        severity: "success",
      });
      getAllRecruteur();
    } catch (error) {
      console.error("Erreur lors de la désactivation :", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la désactivation !",
        severity: "error",
      });
    }
  };

  const filtereData = data.filter((item) =>
  (item.Nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (item.Adresse || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (item.Email || "").toLowerCase().includes(searchTerm.toLowerCase())
);


  useEffect(() => {
    getAllRecruteur();
  }, []);

  return (
    <div className="candidats-container">
      <div className="header-container">
        <h2 className="main-title">Liste des Recruteurs</h2>
        <p className="subtitle">
          Consultez et gérez les informations des recruteurs de votre
          plateforme.
        </p>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Rechercher un recruteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="candidats-table">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Image</th>
              <th scope="col">NomEntreprise</th>
              <th scope="col">Email</th>
              <th scope="col">Adresse</th>
              <th scope="col">Statut</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtereData.map((item, index) => (
              <tr key={index} className="text-center">
                <td>{index + 1}</td>
                <td>
                  <img
                      src={
                        item.image
                          ? `${process.env.REACT_APP_BACKEND_URL}/file/${item.image}`
                          : "2.svg"
                      }
                    className="img-fluid rounded-circle"
                    alt="profile"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{item.NomEntreprise}</td>
                <td>{item.Email}</td>
                <td>{item.Adresse}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-view me-2"
                      onClick={() => getByIdRecruteur(item._id)}
                    >
                      <BsFillEyeFill /> Voir
                    </button>

                    {item.approved === "activé" ? (
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => desactiverCompteRecruteur(item._id)}
                      >
                        <BsFillXCircleFill /> Désactiver
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => activerCompteRecruteur(item._id)}
                      >
                        <BsFillCheckCircleFill /> Activer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRecruteur && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>📜 Détails du Recruteur</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-3">
              <img
                    src={
                      selectedRecruteur.image
                        ? `${process.env.REACT_APP_BACKEND_URL}/file/${selectedRecruteur.image}`
                        : "2.svg"
                    }
                alt={selectedRecruteur.Nom || "Recruteur"}
                className="img-fluid rounded-circle"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </div>
            <p>
              <strong>NomEntreprise:</strong> {selectedRecruteur.NomEntreprise}
            </p>
            <p>
              <strong>Email :</strong> {selectedRecruteur.Email}
            </p>
            <p>
              <strong>Adresse :</strong> {selectedRecruteur.Adresse}
            </p>
            <p>
              <strong>Téléphone :</strong> {selectedRecruteur.Telephone}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default ListeRecruteurs;
