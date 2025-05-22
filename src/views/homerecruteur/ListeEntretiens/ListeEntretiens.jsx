import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import apiRecruteurinterface from "../../../service/apiRecruteurinterface";

const ListeEntretiens = () => {
  const [entretiens, setEntretiens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEntretien, setSelectedEntretien] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editHeure, setEditHeure] = useState("");
  const [editDateFin, setEditDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEntretiens = async (id) => {
    try {
      setLoading(true);
      const response = await apiRecruteurinterface.getRecruteur(id);
      if (response.data && response.data.getRecruteur.entretien) {
        setEntretiens(response.data.getRecruteur.entretien);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des entretiens :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const localstoragedata = JSON.parse(localStorage.getItem("utilisateur"));
    if (localstoragedata?.utilisateur?._id) {
      fetchEntretiens(localstoragedata.utilisateur._id);
    }
  }, []);

  const filteredEntretiens = entretiens.filter(
    (entretien) =>
      entretien.date.includes(searchTerm) ||
      entretien.heure.includes(searchTerm) ||
      (entretien.titre || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (entretien.candidat?.nom || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleEditSave = async () => {
    try {
      setLoading(true);
      await apiRecruteurinterface.updateEntretien(selectedEntretien._id, {
        date: editDate,
        heure: editHeure,
        dateFin: editDateFin ? new Date(editDateFin) : null,
      });

      setEntretiens(
        entretiens.map((ent) =>
          ent._id === selectedEntretien._id
            ? {
                ...ent,
                date: editDate,
                heure: editHeure,
                dateFin: editDateFin,
              }
            : ent
        )
      );

      setShowEditModal(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      // Call the API to delete the entretien
      await apiRecruteurinterface.deleteEntretien(selectedEntretien._id);

      // Update local state
      setEntretiens(
        entretiens.filter((ent) => ent._id !== selectedEntretien._id)
      );

      setShowConfirmModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  return (
    <div className="candidats-container">
      <div className="header-actions d-flex justify-content-start align-items-center gap-3 flex-wrap">
        <h2 className="main-title">Liste des Entretiens</h2>
      </div>

      <p className="subtitle">
        Consultez et gérez les informations des entretiens de votre plateforme.
      </p>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Rechercher un entretien ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {loading && (
        <div className="text-center my-3">Chargement en cours...</div>
      )}

      <div className="table-responsive mt-4">
        <table className="table table-bordered table-hover table-lg text-center">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Candidat</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntretiens.length > 0 ? (
              filteredEntretiens.map((entretien) => (
                <tr key={entretien._id}>
                  <td>{entretien.titre || "Non spécifié"}</td>
                  <td>
                    {entretien.Candidat
                      ? `${entretien.Candidat.Prenom || ""} ${
                          entretien.Candidat.Nom || ""
                        }`.trim()
                      : "Non attribué"}
                  </td>
                  <td>{formatDate(entretien.date)}</td>
                  <td>{entretien.heure}</td>
                  <td>{entretien.description || "Aucune description"}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="outline-warning"
                        className="icon-button"
                        onClick={() => {
                          setSelectedEntretien(entretien);
                          setEditDate(entretien.date.split("T")[0]);
                          setEditHeure(entretien.heure);
                          setEditDateFin(
                            entretien.dateFin
                              ? new Date(entretien.dateFin)
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          );
                          setShowEditModal(true);
                        }}
                        disabled={loading}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        className="icon-button"
                        onClick={() => {
                          setSelectedEntretien(entretien);
                          setShowConfirmModal(true);
                        }}
                        disabled={loading}
                      >
                        <FaTrashAlt />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Aucun entretien trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de modification */}
      <Modal
        show={showEditModal}
        onHide={() => !loading && setShowEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'entretien</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                value={selectedEntretien?.titre || ""}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Heure</Form.Label>
              <Form.Control
                type="time"
                value={editHeure}
                onChange={(e) => setEditHeure(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date de fin</Form.Label>
              <Form.Control
                type="datetime-local"
                value={editDateFin}
                onChange={(e) => setEditDateFin(e.target.value)}
                disabled={loading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedEntretien?.description || ""}
                readOnly
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={loading}
          >
            <FaTimes /> Annuler
          </Button>
          <Button variant="primary" onClick={handleEditSave} disabled={loading}>
            {loading ? (
              "En cours..."
            ) : (
              <>
                <FaSave /> Enregistrer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        show={showConfirmModal}
        onHide={() => !loading && setShowConfirmModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cet entretien ?
          <br />
          <strong>Titre:</strong> {selectedEntretien?.titre}
          <br />
          <strong>Date:</strong>{" "}
          {selectedEntretien && formatDate(selectedEntretien.date)}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            <FaTimes /> Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              "Suppression..."
            ) : (
              <>
                <FaTrashAlt /> Supprimer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListeEntretiens;
