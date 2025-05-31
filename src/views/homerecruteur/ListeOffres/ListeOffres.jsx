import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Card,
  Badge,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import apiRecruteurinterface from "../../../service/apiRecruteurinterface";
import { Link } from "react-router-dom";
import "./ListeOffres.css";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

const ListeOffres = () => {
  const [offres, setOffres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [offreToDelete, setOffreToDelete] = useState(null);

  // Filtres
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // États pour la gestion des entretiens
  const [showEntretienModal, setShowEntretienModal] = useState(false);
  const [selectedEntretienOffre, setSelectedEntretienOffre] = useState(null);
  const [dateFin, setDateFin] = useState("");
  const [link, setLink] = useState("");
  // État pour le type d'entretien
  const [selectedType, setSelectedType] = useState("");
 const type = [
  { _id: '1', nom: 'Présentiel' },
  { _id: '2', nom: 'En ligne' }
];


  const [entretien, setEntretien] = useState({
    titre: "",
    description: "",
    type: "", //
    date: "",
    heure: "",
    statut: "Planifié",
    dateFin: "",
        link: "",
        

    Offre: null,
    Recruteur: null,
    Candidat: null,
    CIN: "",
  });

  // État pour une offre
  dayjs.extend(relativeTime);
  dayjs.locale("fr");

  const [offre, setOffre] = useState({
    titre: "",
    description: "",
    statut: "",
    date_Creation: "",
    date_expiration: "",
    localisation: "",
    createdAt: "2025-04-29T09:30:00Z",
    categorie: "",
    candidats: [],
    recruteurs: [],
    entretiens: [],
    candidatures: [],
  });

  // État pour stocker les candidats d'une offre
  const [candidats, setCandidats] = useState([]);

  // État pour gérer le modal de détails d'offre
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOfferDetails, setSelectedOfferDetails] = useState(null);

  // Récupérer les offres du recruteur
  const fetchOffres = async (id) => {
    try {
      const response = await apiRecruteurinterface.getRecruteur(id);
      setOffres(response.data.getRecruteur.Offre);
    } catch (error) {
      console.error("Erreur lors de la récupération des offres :", error);
      toast.error("Erreur lors de la récupération des offres.");
    }
  };

  useEffect(() => {
    const localstoragedata = JSON.parse(localStorage.getItem("utilisateur"));
    fetchOffres(localstoragedata.utilisateur._id);
  }, []);

  const localstoragedata = JSON.parse(localStorage.getItem("utilisateur"));
  const idUtilisateur = localstoragedata.utilisateur._id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffre({ ...offre, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const offreData = {
        ...offre,
        recruteur: idUtilisateur,
      };

      if (selectedOffre) {
        await apiRecruteurinterface.updateOffre(selectedOffre._id, offreData);
        toast.success("Offre modifiée avec succès !");
      } else {
        await apiRecruteurinterface.addOffre(offreData);
        toast.success("Offre ajoutée avec succès !");
      }

      fetchOffres(idUtilisateur);
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'offre :", error);
      toast.error("Erreur lors de l'enregistrement de l'offre.");
    }
  };

  const handleShowModal = (offre) => {
    if (offre) {
      setOffre({
        ...offre,
        date_expiration: offre.date_expiration?.split("T")[0] || "",
      });
      setSelectedOffre(offre);
    } else {
      setOffre({
        titre: "",
        description: "",
        statut: "",
        date_Creation: "",
        date_expiration: "",
        localisation: "",
        candidats: [],
        recruteurs: [],
        entretiens: [],
        candidatures: [],
      });
      setSelectedOffre(null);
    }
    setShowModal(true);
  };

  // Récupérer toutes les catégories
  const [categ, setCateg] = useState([]);

  const getAllCategory = async () => {
    try {
      const response = await apiRecruteurinterface.getAllCategories();
      setCateg(response.data.list);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  const deleteOffre = async (id) => {
    try {
      const localstoragedata = JSON.parse(localStorage.getItem("utilisateur"));
      await apiRecruteurinterface.deleteOffre(id);
      fetchOffres(localstoragedata.utilisateur._id);
      toast.success("Offre supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'offre :", error);
      toast.error("Erreur ne peut pas être supprimée car des candidats ont déjà postulé.");
    }
  };

  const handleCloseModal = () => setShowModal(false);

  // Villes tunisiennes pour le filtre
  const tunisianCities = [
    "Tunis",
    "Sfax",
    "Sousse",
    "Kairouan",
    "Bizerte",
    "Gabès",
    "Medenine",
    "Nabeul",
    "Kasserine",
    "Tozeur",
    "Jendouba",
    "Beja",
    "Monastir",
    "Zaghouan",
    "Gafsa",
    "Sidi Bouzid",
    "Tataouine",
    "El Kef",
    "Mahdia",
    "Manouba",
    "Ariana",
    "Ben Arous",
    "Siliana",
    "Kébili",
    "La Manouba",
  ];

  // Fonction appelée lors de l'ouverture du modal d'entretien
  const handleOpenEntretienModal = async (offre) => {
    setSelectedEntretienOffre(offre);
    setEntretien({
      ...entretien,
      Offre: offre._id,
    });

    try {
      const response = await apiRecruteurinterface.getCandidatsByOffre(
        offre._id
      );
      const allCandidats = response.data.getOffre.Candidature.flatMap(
        (c) => c.Candidat
      );
      setCandidats(allCandidats);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats :", error);
      toast.error("Erreur lors du chargement des candidats.");
    }

    setShowEntretienModal(true);
  };

  // Fonction pour gérer le changement des champs de l'entretien
  const handleEntretienChange = (e) => {
    const { name, value } = e.target;
    setEntretien({ ...entretien, [name]: value });
  };

  // Fonction pour soumettre l'entretien
  const handleSubmitEntretien = async (e) => {
    e.preventDefault();
    try {
      const offreData = {
        ...entretien,
        Offre: selectedEntretienOffre._id,
        Recruteur: idUtilisateur,
        dateFin: dateFin ? new Date(dateFin) : null, // Convert to Date object
      };
      await apiRecruteurinterface.addEntretien(offreData);
      toast.success("Entretien programmé avec succès !");
      setShowEntretienModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'entretien :", error);
      toast.error("Erreur lors de la programmation de l'entretien.");
    }

    setDateFin("");
  };

  const handleCloseEntretienModal = () => {
    setShowEntretienModal(false);
    setDateFin("");
    setEntretien({
      titre: "",
      description: "",
      type: "",
      date: "",
      heure: "",
      statut: "Planifié",
      dateFin: "",
      Offre: null,
      Recruteur: null,
      Candidat: null,
      CIN: "",
    });
  };

  // Fonction pour obtenir le statut avec badge
  const getStatusBadge = (status) => {
    if (!status)
      return (
        <Badge bg="primary" className="rounded-pill px-3">
          Ouvert
        </Badge>
      );

    switch (status.toLowerCase()) {
      case "fermé":
      case "fermée":
      case "ferme":
        return (
          <Badge bg="danger" className="rounded-pill px-3">
            Fermé
          </Badge>
        );
      case "en cours":
        return (
          <Badge bg="warning" className="rounded-pill px-3">
            En cours
          </Badge>
        );
      default:
        return (
          <Badge bg="success" className="rounded-pill px-3">
            Ouvert
          </Badge>
        );
    }
  };

  // Fonction pour formater la date d'expiration
  const formatExpirationDate = (date) => {
    if (!date) return "";

    const expirationDate = new Date(date);
    const now = new Date();
    const diffDays = Math.round((expirationDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Badge bg="danger" className="rounded-pill px-3">
          Expirée
        </Badge>
      );
    } else if (diffDays < 3) {
      return (
        <div className="d-flex flex-column align-items-start">
          <div>{expirationDate.toLocaleDateString()}</div>
          <Badge bg="warning" className="rounded-pill px-2 mt-1">
            Expire bientôt
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="d-flex flex-column align-items-start">
          <div>{expirationDate.toLocaleDateString()}</div>
          <small className="text-muted">{`Dans ${diffDays} jours`}</small>
        </div>
      );
    }
  };

  // Filtrer les offres selon les critères
  const filteredOffres = offres.filter((offre) => {
    const titleMatch =
      offre.titre &&
      offre.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch =
      offre.description &&
      offre.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch =
      categoryFilter === "" ||
      (offre.Categorie && offre.Categorie === categoryFilter);
    const locationMatch =
      locationFilter === "" ||
      (offre.localisation &&
        offre.localisation
          .toLowerCase()
          .includes(locationFilter.toLowerCase()));

    return (titleMatch || descriptionMatch) && categoryMatch && locationMatch;
  });

  // Fonction pour afficher les détails de l'offre
  const handleViewOffer = (offre) => {
    setSelectedOfferDetails(offre);
    setShowDetailsModal(true);
  };

  // Fonction pour fermer le modal de détails
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };

  // Fonction pour formater la date
  const formatDate = (date) => {
    if (!date) return "Non spécifiée";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h3 className="offers-title">Liste des Offres D'emplois</h3>
        <div className="w-100 d-flex justify-content-between align-items-center">
          <p className="offers-subtitle">
            Consultez et gérez vos offres d'emploi publiées
          </p>
          <Button
            variant="primary"
            className="add-offer-btn"
            onClick={() => handleShowModal(null)}
            aria-label="Ajouter une nouvelle offre"
          >
            <i className="ti ti-plus"></i>
            Nouvelle offre
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-0">
          <div className="p-4 bg-light border-bottom">
            <p className="text-muted mb-3">
              Consultez et gérez vos offres d'emploi publiées
            </p>
            <Row className="g-3">
              <Col md={5}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Rechercher par titre ou description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    aria-label="Rechercher"
                  />
                </InputGroup>
              </Col>

              <Col md={4}>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filtrer par catégorie"
                >
                  <option value="">Toutes les catégories</option>
                  {categ.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nom}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  aria-label="Filtrer par localisation"
                >
                  <option value="">Toutes les localisations</option>
                  {tunisianCities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </div>

          {filteredOffres.length > 0 ? (
            <div className="p-0">
              {filteredOffres.map((offre) => (
                <div key={offre._id} className="border-bottom p-4">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-2">
                          <h5 className="mb-0 me-2">{offre.titre}</h5>
                          {getStatusBadge(offre.statut)}
                        </div>
                        <p className="text-muted mb-2 small">
                          <FaMapMarkerAlt className="me-1" />
                          {offre.localisation}
                          <span className="mx-2">•</span>
                          <FaClock className="me-1" />
                          Publié {dayjs(offre.createdAt).fromNow()}
                        </p>
                        <div
                          className="mb-3"
                          style={{ maxHeight: "80px", overflow: "hidden" }}
                        >
                          <p className="mb-1 text-truncate">
                            {offre.description}
                          </p>
                          <small className="text-muted d-block">
                            <strong>Exigences:</strong>{" "}
                            {offre.exigences?.substring(0, 120) ||
                              "Non spécifiées"}
                            {offre.exigences?.length > 120 ? "..." : ""}
                          </small>
                        </div>
                      </div>
                    </Col>

                    <Col md={2}>
                      <div className="d-flex flex-column align-items-start">
                        <div className="text-muted small mb-1">
                          Date d'expiration
                        </div>
                        {formatExpirationDate(offre.date_expiration)}
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="d-flex flex-row justify-content-end flex-nowrap">
                        <div className="action-buttons-group">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-view-${offre._id}`}>
                                Voir détails
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="action-btn me-1"
                              aria-label="Voir les détails de l'offre"
                              onClick={() => handleViewOffer(offre)}
                            >
                              <i className="ti ti-eye"></i>
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-candidates-${offre._id}`}>
                                Voir candidats
                              </Tooltip>
                            }
                          >
                            <Link
                              to={`/homerecruteur/listeCandidatsRecruteur/${offre._id}`}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="action-btn me-1"
                                aria-label="Voir les candidats"
                              >
                                <i className="ti ti-users"></i>
                              </Button>
                            </Link>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-interview-${offre._id}`}>
                                Programmer entretien
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="action-btn me-1"
                              onClick={() => handleOpenEntretienModal(offre)}
                              aria-label="Programmer un entretien"
                            >
                              <i className="ti ti-calendar"></i>
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-edit-${offre._id}`}>
                                Modifier
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="action-btn me-1"
                              onClick={() => handleShowModal(offre)}
                              aria-label="Modifier l'offre"
                            >
                              <i className="ti ti-pencil"></i>
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-delete-${offre._id}`}>
                                Supprimer
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="action-btn"
                              onClick={() => {
                                setShowConfirmModal(true);
                                setOffreToDelete(offre._id);
                              }}
                              aria-label="Supprimer l'offre"
                            >
                              <i className="ti ti-trash"></i>
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center">
              <div className="py-5">
                <i
                  className="ti ti-file-off text-muted mb-3"
                  style={{ fontSize: "48px" }}
                ></i>
                <h5>Aucune offre trouvée</h5>
                <p className="text-muted">
                  Aucune offre ne correspond à vos critères de recherche
                </p>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-3">
            <i
              className="ti ti-alert-triangle text-danger"
              style={{ fontSize: "48px" }}
            ></i>
          </div>
          <p className="text-center">
            Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est
            irréversible.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteOffre(offreToDelete);
              setShowConfirmModal(false);
            }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour ajouter/modifier une offre */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {selectedOffre ? "Modifier l'offre" : "Ajouter une nouvelle offre"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Titre de l'offre</Form.Label>
                  <Form.Control
                    type="text"
                    name="titre"
                    value={offre.titre}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Développeur Web Full Stack"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="Categorie"
                    onChange={handleChange}
                    value={offre.categorie}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {categ.map((cat, index) => (
                      <option key={index} value={cat._id}>
                        {cat.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description du poste</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={offre.description}
                onChange={handleChange}
                required
                placeholder="Décrivez le poste, les responsabilités..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exigences</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="exigences"
                value={offre.exigences}
                onChange={handleChange}
                required
                placeholder="Compétences requises, qualifications, expérience..."
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date d'expiration</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_expiration"
                    value={offre.date_expiration}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Localisation</Form.Label>
                  <Form.Select
                    name="localisation"
                    value={offre.localisation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {tunisianCities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={handleCloseModal}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                {selectedOffre ? "Mettre à jour" : "Publier"} l'offre
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal pour programmer un entretien */}
      <Modal
        show={showEntretienModal}
        onHide={handleCloseEntretienModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Programmer un entretien</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmitEntretien}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Titre de l'entretien</Form.Label>
                  <Form.Control
                    type="text"
                    name="titre"
                    value={entretien.titre}
                    onChange={handleEntretienChange}
                    required
                    placeholder="Ex: Entretien technique"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    name="statut"
                    value={entretien.statut}
                    onChange={handleEntretienChange}
                    required
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Annulé">Annulé</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Candidat</Form.Label>
              <Form.Select
                name="Candidat"
                value={entretien.Candidat}
                onChange={handleEntretienChange}
                required
              >
                <option value="">-- Sélectionner un candidat --</option>
                {candidats.map((candidat) => (
                  <option key={candidat._id} value={candidat._id}>
                    {candidat.Nom} {candidat.Prenom} - {candidat.CIN}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>




            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={entretien.description}
                onChange={handleEntretienChange}
                required
                placeholder="Détails de l'entretien, sujets à aborder..."
              />
            </Form.Group>





        <Form.Group className="mb-3">
  <Form.Label>Type d'entretien</Form.Label>
  <Form.Select
    name="type"
    value={entretien.type}
    onChange={handleEntretienChange}
    required
  >
    <option value="">-- Sélectionner le type d'entretien --</option>
    {type.map((t) => (
      <option key={t._id} value={t._id}>
        {t.nom} {/* Affiche le nom du type, comme 'Présentiel', 'En ligne' */}
      </option>
    ))}
  </Form.Select>
</Form.Group>










            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={entretien.date}
                    onChange={handleEntretienChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Heure</Form.Label>
                  <Form.Control
                    type="time"
                    name="heure"
                    value={entretien.heure}
                    onChange={handleEntretienChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Date de fin</Form.Label>
              <Form.Control
                type="datetime-local"
                value={dateFin || ""}
                onChange={(e) => {
                  const newDateFin = e.target.value;
                  setDateFin(newDateFin);
                  setEntretien({ ...entretien, dateFin: newDateFin });
                }}
                required
              />
            </Form.Group>
                <Form.Group className="mb-3">
              <Form.Label>Lien</Form.Label>
              <Form.Control
                type="text"
                value={link || ""}
                onChange={(e) => {
                  const newLinkData = e.target.value;
                  setLink(newLinkData);
                  setEntretien({ ...entretien, link: newLinkData });
                }}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={handleCloseEntretienModal}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Programmer l'entretien
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer />

      {/* Modal pour voir les détails de l'offre */}
      <Modal
        show={showDetailsModal}
        onHide={handleCloseDetailsModal}
        size="lg"
        centered
        className="offer-details-modal"
      >
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <i
                  className="ti ti-briefcase text-primary"
                  style={{ fontSize: "28px" }}
                ></i>
              </div>
              <div>
                <h5 className="mb-0">{selectedOfferDetails?.titre}</h5>
                <p className="text-muted small mb-0">
                  <i className="ti ti-map-pin me-1"></i>{" "}
                  {selectedOfferDetails?.localisation}
                </p>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOfferDetails && (
            <div>
              <div className="d-flex justify-content-between mb-4">
                <Badge
                  bg={
                    selectedOfferDetails.statut === "fermé"
                      ? "danger"
                      : "success"
                  }
                  className="py-2 px-3"
                >
                  {selectedOfferDetails.statut || "Ouvert"}
                </Badge>
                <div className="text-muted small">
                  <strong>Publié le:</strong>{" "}
                  {formatDate(selectedOfferDetails.createdAt)}
                </div>
              </div>

              <div className="mb-4">
                <h6 className="offer-view-section-title">
                  <i className="ti ti-info-circle me-2"></i>
                  Détails du poste
                </h6>
                <div className="p-3 bg-light rounded">
                  <p>{selectedOfferDetails.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="offer-view-section-title">
                  <i className="ti ti-list-check me-2"></i>
                  Exigences
                </h6>
                <div className="p-3 bg-light rounded">
                  <p>
                    {selectedOfferDetails.exigences ||
                      "Aucune exigence spécifiée."}
                  </p>
                </div>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="offer-view-section-title">
                    <i className="ti ti-calendar me-2"></i>
                    Date d'expiration
                  </h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0">
                      {formatDate(selectedOfferDetails.date_expiration)}
                    </p>
                  </div>
                </Col>

                <Col md={6}>
                  <h6 className="offer-view-section-title">
                    <i className="ti ti-category me-2"></i>
                    Catégorie
                  </h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0">
                      {categ.find(
                        (c) => c._id === selectedOfferDetails.Categorie
                      )?.nom || "Non spécifiée"}
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="mb-4">
                <h6 className="offer-view-section-title">
                  <i className="ti ti-users me-2"></i>
                  Candidatures
                </h6>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-0">
                        <strong>Total:</strong>{" "}
                        {selectedOfferDetails.Candidature?.length || 0}{" "}
                        candidat(s)
                      </p>
                    </div>
                    <Link
                      to={`/homerecruteur/listeCandidatsRecruteur/${selectedOfferDetails._id}`}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center"
                      >
                        <i className="ti ti-eye me-1"></i>
                        Voir les candidats
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={handleCloseDetailsModal}>
            Fermer
          </Button>

          <div>
            <Button
              variant="outline-warning"
              className="me-2"
              onClick={() => {
                handleCloseDetailsModal();
                handleShowModal(selectedOfferDetails);
              }}
            >
              <i className="ti ti-pencil me-1"></i>
              Modifier
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                handleCloseDetailsModal();
                handleOpenEntretienModal(selectedOfferDetails);
              }}
            >
              <i className="ti ti-calendar me-1"></i>
              Programmer un entretien
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListeOffres;
