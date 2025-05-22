import React, { useState, useEffect } from "react";
import apiRecruteurinterface from "../../../service/apiRecruteurinterface";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ListeCategorie.css";

const ListeCategorie = () => {
  // État pour stocker la liste des catégories
  const [categories, setCategories] = useState([]);

  // État pour gérer l'ouverture/fermeture de la modale d'ajout/modification
  const [showModal, setShowModal] = useState(false);

  // État pour gérer la catégorie sélectionnée lors de la modification
  const [selectedCategorie, setSelectedCategorie] = useState(null);

  // État du formulaire
  const [form, setForm] = useState({ nom: "", description: "" });

  // État pour la barre de recherche
  const [searchTerm, setSearchTerm] = useState("");

  // État pour gérer la modale de confirmation de suppression
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // État pour garder l’ID de la catégorie à supprimer
  const [categorieToDelete, setCategorieToDelete] = useState(null);

  // Récupération des catégories depuis l'API
  const fetchCategories = async () => {
    try {
      const response = await apiRecruteurinterface.getAllCategorie();
      setCategories(response.data.list);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories", error);
      toast.error("Erreur lors de la récupération des catégories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Gère la modification des champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire (ajout ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategorie) {
        await apiRecruteurinterface.updateCategorie(selectedCategorie._id, form);
        toast.success("Catégorie modifiée avec succès !");
      } else {
        await apiRecruteurinterface.addCategorie(form);
        toast.success("Catégorie ajoutée avec succès !");
      }
      setShowModal(false);
      fetchCategories();
      setForm({ nom: "", description: "" });
      setSelectedCategorie(null);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la catégorie", error);
      toast.error("Erreur lors de l'enregistrement de la catégorie");
    }
  };

  // Ouvre la modale de suppression avec confirmation
  const confirmDelete = (categorie) => {
    setCategorieToDelete(categorie);
    setShowConfirmModal(true);
  };

  // Suppression de la catégorie
  const deleteCategorie = async (id) => {
    try {
      await apiRecruteurinterface.deleteCategorie(id);
      fetchCategories();
      toast.success("Catégorie supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie", error);
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  // Ouvre la modale pour ajouter ou modifier une catégorie
  const handleShowModal = (categorie = null) => {
    if (categorie) {
      setForm({ nom: categorie.nom, description: categorie.description });
      setSelectedCategorie(categorie);
    } else {
      setForm({ nom: "", description: "" });
      setSelectedCategorie(null);
    }
    setShowModal(true);
  };

  // Ferme la modale
  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ nom: "", description: "" });
    setSelectedCategorie(null);
  };

  // Filtrer les catégories selon le texte recherché
  const filteredCategories = categories.filter((categorie) =>
    categorie.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="candidats-container">
          <div className="header-actions d-flex justify-content-start align-items-center gap-3 flex-wrap">
            <h2 className="main-title">Liste Catégories</h2>
            <Button variant="success" className="custom-publish-btn" onClick={() => handleShowModal(null)}>
              + Ajouter une catégorie
            </Button>
          </div>
          <p className="subtitle">Consultez et gérez les informations des catégories de votre plateforme.</p>
    

      {/* Barre de recherche */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Rechercher une catégorie ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {/* Tableau des catégories */}
      <div className="table-container mt-3">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Nom de la Catégorie</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((categorie) => (
                <tr key={categorie._id}>
                  <td>{categorie.nom}</td>
                  <td>{categorie.description}</td>
        
                  <td>              
                  <div className="icon-buttons-container">
                   <Button variant="warning" className="icon-button" onClick={() => handleShowModal(categorie)}>
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      className="icon-button"
                      onClick={() => confirmDelete(categorie)}
                    >
                      <FaTrash />
                    </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  Aucune catégorie trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modale de confirmation de suppression */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cette catégorie ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteCategorie(categorieToDelete._id);
              setShowConfirmModal(false);
            }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modale pour ajouter/modifier une catégorie */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCategorie ? "Modifier la catégorie" : "Ajouter une nouvelle catégorie"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nom</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {selectedCategorie ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListeCategorie;
