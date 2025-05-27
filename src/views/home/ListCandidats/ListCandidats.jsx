import React, { useEffect, useState } from 'react';
import { BsFillEyeFill } from 'react-icons/bs';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ListCandidats.css';
import apiCandidat from "../../../service/apiCandidat";

// Liste des candidats
const ListCandidats = () => {
  const [data, setData] = useState([]);     // État pour stocker la liste des candidats
  const [selectedCandidat, setSelectedCandidat] = useState(null); // État pour stocker le candidat sélectionné
  // État pour gérer l'affichage de la modale
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  // État pour gérer le statut d'approbation des candidats
  const getAllCandidat = async () => {
    try {
      const response = await apiCandidat.getAllCandidat();
      setData(response.data.list);
      console.log('Liste des Candidats:', response.data.list);
    } catch (error) {
      console.error("Erreur lors de la récupération des Candidats :", error);
    }
  };


  // Fonction pour récupérer les détails d'un candidat par ID
  const getByIdCandidat = async (id) => {
    if (!id) {
      console.error('ID invalide pour voir les détails !');
      return;
    }
    try {
      const response = await apiCandidat.getByIdCandidat(id);
      setSelectedCandidat(response.data.getCandidat);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération du candidat :', error);
    }
  };

  const filtereData = data.filter((item) => // Filtrer les candidats en fonction du terme de recherche
    item.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => { // Utiliser useEffect pour récupérer la liste des candidats au chargement du composant
    // Appel de la fonction pour récupérer tous les candidats
    getAllCandidat();
  }, []);

  return (
    <div className="candidats-container">
    
      <div className="header-container">
        <h2 className="main-title">Liste des Candidats</h2>
        <p className="subtitle"> Consultez et gérez les informations des candidats de votre plateforme.</p>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Rechercher un candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
      </div>

      {/* tableau */}
      <div className="table-wrapper">
        <table className="candidats-table">
          <thead>
            <tr>
            <th scope="col">Nombre</th>
              <th scope="col">Image</th>
              <th scope="col">Nom</th>
              <th scope="col">Prenom</th>
              <th scope="col">Email</th>
              <th scope="col">Adresse</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
          {filtereData.map((item, index) => (
              <tr key={index} className="text-center">
                <td>{index + 1}</td>
                <td>
                  <img
                   src={item.image ? `${process.env.REACT_APP_BACKEND_URL}/file/${item.image}` : "2.svg"}
                    className="img-fluid rounded-circle"
                    alt="profile"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  
                  />
               
                </td>
                 <td>{item.Nom}</td>
                 <td>{item.Prenom}</td>
                <td>{item.Email}</td>
                <td>{item.Adresse}</td>
               
                <td>
                <div className="action-buttons">
                <button className="btn btn-sm btn-view me-2" onClick={() => getByIdCandidat(item._id)}>
                <BsFillEyeFill /> Voir
                </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      // Modale pour afficher les détails du candidat sélectionné
      {selectedCandidat && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
             <Modal.Title>📜 Détails du Candidat </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-3">
            <img
            src={selectedCandidat.image ? `${process.env.REACT_APP_BACKEND_URL}/file/${selectedCandidat.image}` : "2.svg"}
            alt={selectedCandidat.Nom || "Candidat"}
            className="img-fluid rounded-circle"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>
            <p><strong>Nom :</strong> {selectedCandidat.Nom}</p>
            <p><strong>Prenom :</strong> {selectedCandidat.Prenom}</p>
            <p><strong>Email :</strong> {selectedCandidat.Email}</p>
            <p><strong>Adresse :</strong> {selectedCandidat.Adresse}</p>
            <p><strong>Téléphone :</strong> {selectedCandidat.Telephone}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ListCandidats;
