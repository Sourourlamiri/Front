import React, { useState, useEffect } from "react";
import Header from "../../../componentsVC/header";
import Footer from "../../../componentsVC/footer";
import apiVC from "../../../service/apiVC";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Spinner,
  Card,
  Button,
  Badge,
  Row,
  Col,
  Tab,
  Nav,
  Form,
  Modal,
  Alert,
  Pagination,
} from "react-bootstrap";
import AvatarLetter from "../../../components/AvatarLetter";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaBriefcase,
  FaArrowLeft,
  FaCalendarAlt,
  FaBuilding,
  FaInfoCircle,
  FaList,
  FaClock,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaEdit,
  FaComments,
  FaCommentSlash,
  FaSyncAlt,
} from "react-icons/fa";
import authService from "../../../service/authService";

const DetailEntreprise = () => {
  const [recruteur, setRecruteur] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // États pour les avis
  const [avis, setAvis] = useState(null);
  const [allAvis, setAllAvis] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [avisError, setAvisError] = useState("");
  const [avisSuccess, setAvisSuccess] = useState("");
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Get the current user from authService
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchRecruteurDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiVC.getrecruteurById(id);
        console.log("Détails de l'recruteur:", response.data.getRecruteur);
        setRecruteur(response.data.getRecruteur);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails de l'recruteur",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecruteurDetails();
  }, [id]);

  // Fetch avis for this recruteur
  useEffect(() => {
    const fetchAvis = async () => {
      if (!id) return;

      try {
        setLoadingAvis(true);
        const response = await apiVC.getAvisByRecruteur(id);
        console.log("Avis de l'entreprise:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setAllAvis(response.data);

          // Check if the current user has already left an avis
          if (user && user._id) {
            const userExistingAvis = response.data.find(
              (a) => a.Candidat && a.Candidat._id === user._id
            );
            if (userExistingAvis) {
              setAvis(userExistingAvis);
              setRating(userExistingAvis.note);
              setComment(userExistingAvis.commentaire || "");
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des avis", error);
      } finally {
        setLoadingAvis(false);
      }
    };

    fetchAvis();
  }, [id, user?._id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Calculate days left until expiration
  const getDaysLeft = (expirationDate) => {
    if (!expirationDate) return "Non spécifié";

    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expirée";
    if (diffDays === 0) return "Expire aujourd'hui";
    if (diffDays === 1) return "Expire demain";
    return `${diffDays} jours restants`;
  };

  // Fetch the logged in user's review for this recruiter (if any)
  const fetchUserAvis = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("utilisateur"))?.utilisateur;

      if (!user || user.role !== "candidat") {
        return; // Only candidates can leave reviews
      }

      setLoadingAvis(true);
      // Use the service method instead of direct axios call
      const response = await apiVC.getAvisByRecruteurAndCandidat(id, user._id);

      console.log("User review response:", response.data);

      if (response.data.avis && response.data.avis.length > 0) {
        setAvis(response.data.avis[0]);
        setRating(response.data.avis[0].note);
        setComment(response.data.avis[0].commentaire);
      } else {
        setAvis(null);
        setRating(0);
        setComment("");
      }
    } catch (error) {
      console.error("Error fetching user avis:", error);
      setAvisError("Erreur lors de la récupération de votre avis");
    } finally {
      setLoadingAvis(false);
    }
  };

  // Fetch all reviews for this recruiter
  const fetchAllAvis = async () => {
    try {
      setLoadingAvis(true);
      // Use the service method instead of direct axios call
      const response = await apiVC.getAvisByRecruteur(id);

      console.log("All reviews response:", response.data);

      if (response.data.avis) {
        setAllAvis(response.data.avis);

        // Calculate average rating
        if (response.data.avis.length > 0) {
          const total = response.data.avis.reduce(
            (sum, review) => sum + review.note,
            0
          );
          setAverageRating((total / response.data.avis.length).toFixed(1));
        } else {
          setAverageRating(0);
        }
      } else {
        setAllAvis([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching all avis:", error);
      setAllAvis([]);
      setAverageRating(0);
    } finally {
      setLoadingAvis(false);
    }
  };

  // Submit a new review or update existing one
  const handleAvisSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setAvisError("Veuillez sélectionner une note");
      return;
    }

    if (!comment.trim()) {
      setAvisError("Veuillez ajouter un commentaire");
      return;
    }

    setAvisError("");
    setAvisSuccess("");
    setLoadingAvis(true);

    try {
      const user = JSON.parse(localStorage.getItem("utilisateur"))?.utilisateur;

      if (!user || user.role !== "candidat") {
        setAvisError(
          "Vous devez être connecté en tant que candidat pour laisser un avis"
        );
        return;
      }

      const avisData = {
        commentaire: comment,
        note: rating,
        Candidat: user._id,
        Recruteur: id,
      };

      let response;

      if (avis) {
        // Update existing review using service method
        console.log("Updating review:", avis._id, avisData);
        response = await apiVC.updateAvis(avis._id, avisData);
        setAvisSuccess("Votre avis a été mis à jour avec succès");
      } else {
        // Create new review using service method
        console.log("Creating new review:", avisData);
        response = await apiVC.createAvis(avisData);
        setAvisSuccess("Votre avis a été ajouté avec succès");
      }

      console.log("Review submission response:", response.data);

      // Update local state with the new/updated review
      if (response.data.avis) {
        setAvis(response.data.avis);
      } else if (response.data) {
        setAvis(response.data);
      }

      // Stay in edit mode briefly to show success message, then close
      setTimeout(() => {
        setEditMode(false);
        // Refresh the reviews list
        fetchAllAvis();
        fetchUserAvis();
      }, 1500);
    } catch (error) {
      console.error("Error submitting avis:", error);
      setAvisError("Erreur lors de l'enregistrement de votre avis");
    } finally {
      setLoadingAvis(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserAvis();
      fetchAllAvis();
    }
  }, [id]);

  // Function to refresh reviews
  const refreshReviews = () => {
    fetchUserAvis();
    fetchAllAvis();
  };

  // Custom CSS styles for the Avis section
  const avisStyles = {
    avisCard: {
      padding: "1.25rem",
      borderRadius: "0.5rem",
      backgroundColor: "#f8f9fa",
      marginBottom: "1rem",
      border: "1px solid #e9ecef",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    avisCardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    starRating: {
      display: "inline-flex",
      fontSize: "1.25rem",
      marginRight: "0.5rem",
    },
    filledStar: {
      color: "#ffc107",
      marginRight: "0.15rem",
    },
    emptyStar: {
      color: "#e4e5e9",
      marginRight: "0.15rem",
    },
    interactiveStar: {
      cursor: "pointer",
      fontSize: "2rem",
      marginRight: "0.25rem",
    },
    summary: {
      textAlign: "center",
      padding: "1.5rem",
      borderRadius: "0.5rem",
      backgroundColor: "#fff",
      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
      marginBottom: "2rem",
    },
    averageRating: {
      fontSize: "3rem",
      fontWeight: "bold",
      color: "#212529",
      margin: "0.5rem 0",
    },
    ratingCount: {
      color: "#6c757d",
      fontSize: "0.9rem",
    },
    noReviews: {
      textAlign: "center",
      padding: "2rem",
      borderRadius: "0.5rem",
      backgroundColor: "#f8f9fa",
      color: "#6c757d",
    },
    ratingBar: {
      display: "flex",
      alignItems: "center",
      marginBottom: "0.5rem",
    },
    ratingLabel: {
      minWidth: "4rem",
    },
    progressContainer: {
      flex: "1",
      height: "8px",
      margin: "0 0.75rem",
    },
    emptyState: {
      padding: "3rem",
      textAlign: "center",
      backgroundColor: "#f8f9fa",
      borderRadius: "0.5rem",
      margin: "1rem 0",
    },
    emptyIcon: {
      color: "#adb5bd",
      marginBottom: "1rem",
    },
  };

  // Enhanced star rating renderer with custom styles
  const renderStarRating = (rating) => {
    return (
      <div style={avisStyles.starRating}>
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? (
              <FaStar style={avisStyles.filledStar} />
            ) : i < rating ? (
              <FaStarHalfAlt style={avisStyles.filledStar} />
            ) : (
              <FaRegStar style={avisStyles.emptyStar} />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!allAvis || allAvis.length === 0) return 0;

    const sum = allAvis.reduce((total, item) => total + item.note, 0);
    return (sum / allAvis.length).toFixed(1);
  };

  // Function to check if a review belongs to the current user
  const isUserReview = (reviewCandidatId) => {
    const user = JSON.parse(localStorage.getItem("utilisateur"))?.utilisateur;
    return user && user._id === reviewCandidatId;
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="spinner">
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
          </div>
          <p className="loading-text">
            Chargement des informations de l'entreprise...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!recruteur) {
    return (
      <div>
        <Header />
        <div className="container my-5 pt-5 text-center">
          <FaBuilding size={50} className="text-muted mb-3" />
          <h2>Entreprise non trouvée</h2>
          <p className="text-muted mb-4">
            Nous n'avons pas pu trouver les détails de cette entreprise.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/entreprises")}
            className="d-flex align-items-center gap-2 mx-auto"
          >
            <FaArrowLeft /> Retour aux entreprises
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Header />

      <div className="container pt-5 mt-3">
        {/* Page header with company name and back button */}
        <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
          <h1 className="mb-0 fw-bold">{recruteur.Nom}</h1>
          <Link
            to="/entreprises"
            className="btn btn-outline-primary d-flex align-items-center gap-2"
          >
            <FaArrowLeft size={14} /> Retour aux entreprises
          </Link>
        </div>

        {/* Company profile header */}
        <div className="card shadow-sm border-0 rounded-lg overflow-hidden mb-4">
          <div className="company-header p-4">
            <div className="row align-items-center">
              <div className="col-md-auto mb-3 mb-md-0">
                <AvatarLetter
                  user={recruteur}
                  customSize="120px"
                  style={{
                    boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
                    border: "3px solid white",
                    fontSize: "2.5rem",
                  }}
                />
              </div>
              <div className="col-md">
                <div className="company-meta">
                  {recruteur.secteur && (
                    <Badge
                      bg="light"
                      text="primary"
                      className="me-2 company-badge"
                    >
                      {recruteur.secteur}
                    </Badge>
                  )}
                  {recruteur.Offre && (
                    <Badge bg="light" text="primary" className="company-badge">
                      <FaBriefcase className="me-1" /> {recruteur.Offre.length}{" "}
                      offres
                    </Badge>
                  )}
                </div>
                <h2 className="mb-1 mt-2">{recruteur.Nom}</h2>
                <p className="text-muted mb-3">
                  {recruteur.slogan || "Entreprise partenaire de RecruitEase"}
                </p>

                <div className="company-contact-details">
                  {recruteur.Email && (
                    <div className="contact-item">
                      <FaEnvelope className="contact-icon" /> {recruteur.Email}
                    </div>
                  )}
                  {recruteur.Telephone && (
                    <div className="contact-item">
                      <FaPhone className="contact-icon" /> {recruteur.Telephone}
                    </div>
                  )}
                  {recruteur.Adresse && (
                    <div className="contact-item">
                      <FaMapMarkerAlt className="contact-icon" />{" "}
                      {recruteur.Adresse}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-auto mt-3 mt-md-0">
                {recruteur.website && (
                  <a
                    href={
                      recruteur.website.startsWith("http")
                        ? recruteur.website
                        : `https://${recruteur.website}`
                    }
                    className="btn btn-primary d-flex align-items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGlobe /> Visiter le site web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for company information and job listings */}
        <Tab.Container
          id="company-tabs"
          defaultActiveKey="info"
          onSelect={(k) => setActiveTab(k)}
        >
          <div className="card shadow-sm border-0 rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom-0 p-0">
              <Nav variant="tabs" className="custom-tabs">
                <Nav.Item>
                  <Nav.Link
                    eventKey="info"
                    className="d-flex align-items-center gap-2"
                  >
                    <FaInfoCircle /> À propos
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="jobs"
                    className="d-flex align-items-center gap-2"
                  >
                    <FaBriefcase /> Offres d'emploi{" "}
                    {recruteur.Offre?.length > 0 &&
                      `(${recruteur.Offre.length})`}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="avis"
                    className="d-flex align-items-center gap-2"
                  >
                    <FaComments /> Avis{" "}
                    {allAvis?.length > 0 && `(${allAvis.length})`}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
            <div className="card-body p-4">
              <Tab.Content>
                <Tab.Pane eventKey="info">
                  <div className="about-section">
                    <h4 className="mb-3">À propos de {recruteur.Nom}</h4>

                    <div className="company-description mb-4">
                      <p>
                        {recruteur.description ||
                          "Aucune description disponible pour cette entreprise."}
                      </p>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <div className="info-card h-100">
                          <div className="info-card-header">
                            <FaBuilding className="info-icon" />
                            <h5>Informations générales</h5>
                          </div>
                          <div className="info-card-body">
                            <div className="info-item">
                              <span className="info-label">
                                Nom de l'entreprise
                              </span>
                              <span className="info-value">
                                {recruteur.Nom}
                              </span>
                            </div>
                            {recruteur.dateCreation && (
                              <div className="info-item">
                                <span className="info-label">
                                  Date de création
                                </span>
                                <span className="info-value">
                                  {formatDate(recruteur.dateCreation)}
                                </span>
                              </div>
                            )}
                            {recruteur.secteur && (
                              <div className="info-item">
                                <span className="info-label">
                                  Secteur d'activité
                                </span>
                                <span className="info-value">
                                  {recruteur.secteur}
                                </span>
                              </div>
                            )}
                            {recruteur.taille && (
                              <div className="info-item">
                                <span className="info-label">
                                  Taille de l'entreprise
                                </span>
                                <span className="info-value">
                                  {recruteur.taille}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-4">
                        <div className="info-card h-100">
                          <div className="info-card-header">
                            <FaMapMarkerAlt className="info-icon" />
                            <h5>Coordonnées</h5>
                          </div>
                          <div className="info-card-body">
                            <div className="info-item">
                              <span className="info-label">Email</span>
                              <span className="info-value">
                                {recruteur.Email || "Non spécifié"}
                              </span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Téléphone</span>
                              <span className="info-value">
                                {recruteur.Telephone || "Non spécifié"}
                              </span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Adresse</span>
                              <span className="info-value">
                                {recruteur.Adresse || "Non spécifiée"}
                              </span>
                            </div>
                            {recruteur.website && (
                              <div className="info-item">
                                <span className="info-label">Site web</span>
                                <span className="info-value">
                                  <a
                                    href={
                                      recruteur.website.startsWith("http")
                                        ? recruteur.website
                                        : `https://${recruteur.website}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="website-link"
                                  >
                                    {recruteur.website}
                                  </a>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="jobs">
                  <div className="jobs-section">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">
                        Offres d'emploi de {recruteur.Nom}
                      </h4>
                    </div>

                    {recruteur.Offre && recruteur.Offre.length > 0 ? (
                      <div className="jobs-list">
                        {recruteur.Offre.map((job) => (
                          <div key={job._id} className="job-card">
                            <div className="job-card-body">
                              <div className="job-title-section">
                                <h5 className="job-title">{job.titre}</h5>
                                <Badge
                                  bg={
                                    job.statut === "ouvert"
                                      ? "success"
                                      : "secondary"
                                  }
                                  className="job-status"
                                >
                                  {job.statut === "ouvert" ? "Ouvert" : "Fermé"}
                                </Badge>
                              </div>

                              <div className="job-meta-info">
                                {job.localisation && (
                                  <span className="job-meta-item">
                                    <FaMapMarkerAlt className="job-meta-icon" />{" "}
                                    {job.localisation}
                                  </span>
                                )}
                                {job.type_emploi && (
                                  <span className="job-meta-item">
                                    <FaBriefcase className="job-meta-icon" />{" "}
                                    {job.type_emploi}
                                  </span>
                                )}
                                {job.date_expiration && (
                                  <span className="job-meta-item">
                                    <FaCalendarAlt className="job-meta-icon" />
                                    <span
                                      className={
                                        getDaysLeft(job.date_expiration) ===
                                        "Expirée"
                                          ? "text-danger"
                                          : getDaysLeft(
                                              job.date_expiration
                                            ).includes("Expire")
                                          ? "text-warning"
                                          : "text-success"
                                      }
                                    >
                                      {getDaysLeft(job.date_expiration)}
                                    </span>
                                  </span>
                                )}
                                {job.createdAt && (
                                  <span className="job-meta-item">
                                    <FaClock className="job-meta-icon" /> Publié
                                    le {formatDate(job.createdAt)}
                                  </span>
                                )}
                              </div>

                              {job.description && (
                                <div className="job-description">
                                  {job.description.length > 200
                                    ? `${job.description.substring(0, 200)}...`
                                    : job.description}
                                </div>
                              )}

                              <Link
                                to={`/offre/${job._id}`}
                                className="view-job-btn"
                              >
                                Voir détails
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-jobs-message">
                        <FaBriefcase size={40} className="text-muted mb-3" />
                        <h5>Aucune offre disponible</h5>
                        <p className="text-muted">
                          Cette entreprise n'a pas encore publié d'offres
                          d'emploi.
                        </p>
                        <Link
                          to="/VoirOffres"
                          className="btn btn-outline-primary mt-2"
                        >
                          Explorer toutes les offres
                        </Link>
                      </div>
                    )}
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="avis">
                  <div className="avis-section">
                    {loadingAvis ? (
                      <div className="text-center p-4">
                        <Spinner
                          animation="border"
                          role="status"
                          variant="primary"
                        >
                          <span className="visually-hidden">
                            Chargement des avis...
                          </span>
                        </Spinner>
                        <p className="mt-2 text-muted">
                          Chargement des avis...
                        </p>
                      </div>
                    ) : allAvis && allAvis.length > 0 ? (
                      <>
                        {/* Reviews Summary Section */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4 className="mb-0">
                            Avis des candidats{" "}
                            {allAvis.length > 0 && `(${allAvis.length})`}
                          </h4>
                        </div>

                        {/* Rating Summary */}
                        <div style={avisStyles.summary}>
                          <Row className="align-items-center">
                            <Col md={4} className="mb-3 mb-md-0">
                              <div className="average-rating">
                                <div style={avisStyles.averageRating}>
                                  {calculateAverageRating()}
                                </div>
                                {renderStarRating(
                                  parseFloat(calculateAverageRating())
                                )}
                                <div style={avisStyles.ratingCount}>
                                  {allAvis.length} avis
                                </div>
                              </div>
                            </Col>
                            <Col md={8}>
                              <div className="rating-distribution">
                                {[5, 4, 3, 2, 1].map((star) => {
                                  const count = allAvis.filter(
                                    (a) => Math.floor(a.note) === star
                                  ).length;
                                  const percentage = allAvis.length
                                    ? (count / allAvis.length) * 100
                                    : 0;

                                  return (
                                    <div
                                      key={star}
                                      style={avisStyles.ratingBar}
                                    >
                                      <div style={avisStyles.ratingLabel}>
                                        {star}{" "}
                                        <FaStar
                                          style={{
                                            color: "#ffc107",
                                            fontSize: "0.8rem",
                                          }}
                                        />
                                      </div>
                                      <div
                                        className="progress"
                                        style={avisStyles.progressContainer}
                                      >
                                        <div
                                          className="progress-bar bg-warning"
                                          style={{ width: `${percentage}%` }}
                                          role="progressbar"
                                          aria-valuenow={percentage}
                                          aria-valuemin="0"
                                          aria-valuemax="100"
                                        ></div>
                                      </div>
                                      <div
                                        style={{
                                          minWidth: "2.5rem",
                                          textAlign: "right",
                                        }}
                                      >
                                        {count}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => {
                            if (!authService.isAuthenticated()) {
                              navigate("/login", {
                                state: { from: location.pathname },
                              });
                            } else {
                              setEditMode(true);
                            }
                          }}
                          className="btn-avis d-flex align-items-center justify-content-center gap-1 mx-auto mt-3 mb-4"
                          disabled={loadingAvis}
                          style={{
                            background:
                              "linear-gradient(45deg, #8c52ff, #5e17eb)",
                            border: "none",
                            borderRadius: "30px",
                            boxShadow: "0 3px 8px rgba(140, 82, 255, 0.2)",
                            fontWeight: "500",
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem",
                            maxWidth: "160px",
                            minWidth: "max-content",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(140, 82, 255, 0.3)";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 3px 8px rgba(140, 82, 255, 0.2)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {avis ? (
                            <>
                              <FaEdit style={{ fontSize: "14px" }} />{" "}
                              <span>Modifier mon avis</span>
                            </>
                          ) : (
                            <>
                              <FaStar style={{ fontSize: "14px" }} />{" "}
                              <span>Donner mon Avis</span>
                            </>
                          )}
                        </Button>
                        {/* Reviews list */}
                        <div className="avis-list">
                          {allAvis.map((avisItem) => (
                            <div
                              key={avisItem._id}
                              style={{
                                ...avisStyles.avisCard,
                                ...(isUserReview(avisItem.Candidat) && {
                                  borderLeft: "4px solid #0d6efd",
                                }),
                              }}
                              className="avis-card"
                              onMouseEnter={(e) =>
                                Object.assign(
                                  e.currentTarget.style,
                                  avisStyles.avisCardHover
                                )
                              }
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "none";
                                if (isUserReview(avisItem.Candidat)) {
                                  e.currentTarget.style.borderLeft =
                                    "4px solid #0d6efd";
                                }
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <div className="mb-2">
                                    {renderStarRating(avisItem.note)}
                                  </div>
                                  <div className="text-muted small">
                                    {new Date(
                                      avisItem.createdAt
                                    ).toLocaleDateString("fr-FR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                    {avisItem.createdAt !==
                                      avisItem.updatedAt &&
                                      ` (Modifié le ${new Date(
                                        avisItem.updatedAt
                                      ).toLocaleDateString("fr-FR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })})`}
                                  </div>
                                </div>
                                {isUserReview(avisItem.Candidat) && (
                                  <div>
                                    <Badge bg="info" className="me-2">
                                      Votre avis
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="avis-content">
                                <p className="mb-0">{avisItem.commentaire}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={avisStyles.emptyState}>
                        <FaCommentSlash
                          size={48}
                          style={avisStyles.emptyIcon}
                        />
                        <h5>Aucun avis pour le moment</h5>
                        <p className="text-muted">
                          Soyez le premier à laisser un avis pour{" "}
                          {recruteur.Nom}
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => {
                            if (!authService.isAuthenticated()) {
                              navigate("/login", {
                                state: { from: location.pathname },
                              });
                            } else {
                              setEditMode(true);
                            }
                          }}
                          className="d-inline-flex align-items-center justify-content-center gap-1 mt-3"
                          style={{
                            background:
                              "linear-gradient(45deg, #8c52ff, #5e17eb)",
                            border: "none",
                            borderRadius: "30px",
                            boxShadow: "0 3px 8px rgba(140, 82, 255, 0.2)",
                            fontWeight: "500",
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem",
                            maxWidth: "160px",
                            minWidth: "max-content",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(140, 82, 255, 0.3)";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 3px 8px rgba(140, 82, 255, 0.2)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <FaStar style={{ fontSize: "14px" }} />{" "}
                          <span>Avis</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Pagination if there are many reviews */}
                  {allAvis.length > 10 && (
                    <div className="pagination-container d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev />
                        <Pagination.Item active>{1}</Pagination.Item>
                        <Pagination.Item>{2}</Pagination.Item>
                        <Pagination.Item>{3}</Pagination.Item>
                        <Pagination.Ellipsis />
                        <Pagination.Next />
                      </Pagination>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
        </Tab.Container>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .loading-text {
          margin-top: 1rem;
          color: #6c757d;
        }

        .company-header {
          background-color: white;
        }

        .company-badge {
          font-weight: 500;
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .company-contact-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .contact-icon {
          color: #8c52ff;
          margin-right: 0.5rem;
        }

        .custom-tabs .nav-link {
          color: #495057;
          padding: 1rem 1.5rem;
          border: none;
          border-bottom: 3px solid transparent;
          font-weight: 500;
        }

        .custom-tabs .nav-link.active {
          color: #8c52ff;
          background-color: transparent;
          border-bottom: 3px solid #8c52ff;
        }

        .info-card {
          background-color: #f8f9fa;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e9ecef;
        }

        .info-card-header {
          padding: 1rem;
          background-color: #f1f3f5;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .info-icon {
          color: #8c52ff;
          font-size: 1.1rem;
        }

        .info-card-header h5 {
          margin-bottom: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .info-card-body {
          padding: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.75rem;
        }

        .info-label {
          font-size: 0.85rem;
          color: #6c757d;
          margin-bottom: 0.2rem;
        }

        .info-value {
          font-weight: 500;
        }

        .website-link {
          color: #8c52ff;
          text-decoration: none;
        }

        .website-link:hover {
          text-decoration: underline;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .job-card {
          background-color: #f8f9fa;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .job-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          border-color: #8c52ff;
        }

        .job-card-body {
          padding: 1.25rem;
        }

        .job-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .job-title {
          margin-bottom: 0;
          font-weight: 600;
          color: #212529;
        }

        .job-status {
          font-size: 0.75rem;
          padding: 0.4rem 0.75rem;
          border-radius: 50px;
        }

        .job-meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .job-meta-item {
          display: flex;
          align-items: center;
          color: #6c757d;
          font-size: 0.85rem;
        }

        .job-meta-icon {
          color: #8c52ff;
          margin-right: 0.4rem;
        }

        .job-description {
          color: #495057;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        .view-job-btn {
          display: inline-block;
          padding: 0.5rem 1.25rem;
          background-color: transparent;
          color: #8c52ff;
          border: 1px solid #8c52ff;
          border-radius: 50px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .view-job-btn:hover {
          background-color: #8c52ff;
          color: white;
        }

        .no-jobs-message {
          text-align: center;
          padding: 3rem 1rem;
        }

        .text-danger {
          color: #dc3545 !important;
        }

        .text-warning {
          color: #ffc107 !important;
        }

        .text-success {
          color: #28a745 !important;
        }

        /* Styles pour les avis */
        .avis-section {
          padding: 0.5rem 0;
        }

        .no-avis-message {
          text-align: center;
          padding: 3rem 1rem;
        }

        .avis-overview {
          margin-bottom: 2rem;
        }

        .avis-summary {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .average-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .rating-value {
          font-size: 3rem;
          font-weight: 700;
          color: #212529;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .star-rating {
          display: flex;
          margin-bottom: 0.5rem;
        }

        .star-icon {
          font-size: 1.2rem;
          color: #dee2e6;
          margin: 0 0.1rem;
        }

        .star-icon.filled {
          color: #ffc107;
        }

        .rating-count {
          font-size: 0.9rem;
          color: #6c757d;
        }

        .rating-bars {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .rating-bar-item {
          margin-bottom: 0.5rem;
        }

        .rating-label {
          min-width: 80px;
          font-size: 0.85rem;
          color: #495057;
        }

        .rating-bar {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .rating-bar-fill {
          height: 100%;
          background-color: #ffc107;
        }

        .rating-percent {
          min-width: 40px;
          text-align: right;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .avis-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .avis-card {
          background-color: white;
          border-radius: 10px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
          transition: transform 0.3s ease;
        }

        .avis-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .avis-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .avis-user {
          display: flex;
          align-items: center;
        }

        .avis-user-info {
          display: flex;
          flex-direction: column;
        }

        .avis-user-name {
          font-weight: 600;
          color: #212529;
          font-size: 1rem;
        }

        .avis-date {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .avis-content {
          color: #495057;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .avis-footer {
          display: flex;
          justify-content: flex-end;
        }

        .edit-avis-btn {
          font-size: 0.85rem;
          padding: 0.3rem 0.8rem;
        }

        /* Styles pour le formulaire d'avis */
        .interactive-stars {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .interactive-star {
          cursor: pointer;
          font-size: 2rem;
          transition: transform 0.2s ease;
        }

        .interactive-star:hover {
          transform: scale(1.2);
        }

        /* Styles pour les boutons d'avis */
        .btn-avis:focus {
          box-shadow: 0 0 0 0.25rem rgba(140, 82, 255, 0.25) !important;
        }

        @media (max-width: 768px) {
          .d-flex.justify-content-between.align-items-center {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-avis {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="mt-5">
        <Footer />
      </div>

      {/* Modal pour ajouter/modifier un avis */}
      <Modal
        show={editMode}
        onHide={() => {
          setEditMode(false);
          setAvisError("");
          setAvisSuccess("");
          // Reset form to existing values if editing, or clear if creating new
          if (avis) {
            setRating(avis.note);
            setComment(avis.commentaire);
          } else {
            setRating(0);
            setComment("");
          }
        }}
        centered
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="h5">
            {avis ? "Modifier votre avis" : "Ajouter un avis"} sur{" "}
            {recruteur.Nom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {avisError && <Alert variant="danger">{avisError}</Alert>}
          {avisSuccess && <Alert variant="success">{avisSuccess}</Alert>}

          <Form onSubmit={handleAvisSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Votre note</Form.Label>
              <div className="d-flex justify-content-center mb-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <span
                    key={value}
                    style={avisStyles.interactiveStar}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    className="interactive-star"
                  >
                    {value <= (hover || rating) ? (
                      <FaStar style={{ color: "#ffc107" }} />
                    ) : (
                      <FaRegStar style={{ color: "#adb5bd" }} />
                    )}
                  </span>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Votre commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Partagez votre expérience avec cette entreprise..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="shadow-sm"
              />
              <Form.Text className="text-muted">
                Soyez honnête et constructif dans votre évaluation pour aider
                les autres candidats.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setEditMode(false);
              setRating(avis?.note || 0);
              setComment(avis?.commentaire || "");
            }}
            disabled={loadingAvis}
            className="me-2"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleAvisSubmit}
            disabled={loadingAvis || rating === 0 || !comment.trim()}
          >
            {loadingAvis ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Envoi en cours...
              </>
            ) : avis ? (
              "Mettre à jour"
            ) : (
              "Soumettre"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DetailEntreprise;
