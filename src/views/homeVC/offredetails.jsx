import React, { useState, useEffect } from 'react';
import Header from '../../componentsVC/header';
import Footer from '../../componentsVC/footer';
import apiVC from '../../service/apiVC';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaFileUpload, 
         FaClock, FaBriefcase, FaListUl, FaCheck, FaTimes,
         FaEnvelope, FaPhone, FaMapMarkerAlt as FaLocation, FaLink } from 'react-icons/fa';
import axios from 'axios';
import AvatarLetter from '../../components/AvatarLetter';

const Offredetails = () => {
  const [offre, setOffre] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // États pour le formulaire de candidature
  const [showModal, setShowModal] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [candidatId, setCandidatId] = useState(null);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);
  const [isCheckingApplications, setIsCheckingApplications] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userInfo = localStorage.getItem('utilisateur');
    let userId = null;
    
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.utilisateur && user.utilisateur.role === 'candidat') {
        setIsUserLoggedIn(true);
        setCandidatId(user.utilisateur._id);
        userId = user.utilisateur._id;
      }
    }

    const fetchData = async () => {
      try {
        const [offerResponse, categoriesResponse] = await Promise.all([
          apiVC.getOffreById(id),
          apiVC.getAllcategorie()
        ]);
        
        // Process offer data
        const offerData = offerResponse.data.getOffre;
        
        // Match category by ID if needed
        if (offerData.Categorie && typeof offerData.Categorie === 'string' && Array.isArray(categoriesResponse.data.list)) {
          const matchedCategory = categoriesResponse.data.list.find(cat => cat._id === offerData.Categorie);
          if (matchedCategory) {
            offerData.Categorie = matchedCategory;
          }
        }
        
        // Ensure recruiter has proper format for AvatarLetter
        if (offerData.recruteur && !offerData.recruteur.NomEntreprise && offerData.recruteur.NomEntreprise) {
          offerData.recruteur.NomEntreprise = offerData.recruteur.NomEntreprise;
        }
        
        setOffre(offerData);
        setCategories(categoriesResponse.data.list || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'offre', error);
      }
    };

    // Fonction pour vérifier si le candidat a déjà postulé
    const checkExistingApplication = async (candidatId) => {
      if (!candidatId) {
        setIsCheckingApplications(false);
        return;
      }
      
      try {
        // Récupérer les candidatures du candidat
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/Candidat/${candidatId}`);
        const candidatures = response.data.getCandidat.Candidature || [];
        
        // Vérifier si l'une des candidatures est pour cette offre
        if (candidatures.length > 0) {
          for (const candidature of candidatures) {
            // Si la candidature contient cette offre
            if (candidature.Offre && candidature.Offre.some(offre => offre._id === id)) {
              setHasAlreadyApplied(true);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des candidatures:', error);
      } finally {
        setIsCheckingApplications(false);
      }
    };

    fetchData();
    if (userId) {
      checkExistingApplication(userId);
    } else {
      setIsCheckingApplications(false);
    }
  }, [id]);

  const handleOpenModal = () => {
    if (!isUserLoggedIn) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate('/login');
      return;
    }
    
    if (hasAlreadyApplied) {
      // Ne pas ouvrir le modal si l'utilisateur a déjà postulé
      return;
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCvFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedFileName('');
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setCvFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Vérifier si un fichier CV a été sélectionné
    if (!cvFile) {
      setErrorMsg('Veuillez télécharger votre CV');
      setIsSubmitting(false);
      return;
    }

    // Vérifier si le fichier est un PDF
    if (cvFile.type !== 'application/pdf') {
      setErrorMsg('Veuillez télécharger un fichier PDF');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiVC.postuler(candidatId, id, cvFile);
      console.log('Réponse de candidature:', response);
      setSuccessMsg('Votre candidature a été soumise avec succès!');
      setHasAlreadyApplied(true);
      
      // Réinitialiser le formulaire après soumission réussie
      setCvFile(null);
      setSelectedFileName('');
      
      // Fermer le modal après quelques secondes
      setTimeout(() => {
        handleCloseModal();
        // Rediriger vers la page des candidatures
        navigate('/mesCandidatures');
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la soumission de candidature:', error);
      setErrorMsg(error.response?.data?.message || 'Une erreur est survenue lors de la soumission de votre candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculate days left until expiration
  const getDaysLeft = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirée';
    if (diffDays === 0) return 'Expire aujourd\'hui';
    if (diffDays === 1) return 'Expire demain';
    return `${diffDays} jours restants`;
  };
  
  // Get recruiter name for display
  const getRecruiterName = (recruiter) => {
    if (!recruiter) return 'Non spécifié';
    return recruiter.NomEntreprise || recruiter.NomEntreprise || recruiter.name || 'Entreprise';
  };

  // Get category name for display
  const getCategoryName = (category) => {
    if (!category) return 'Non catégorisé';
    return typeof category === 'object' ? category.nom : 'Non catégorisé';
  };

  if (!offre || isCheckingApplications) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <Header />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement des détails de l'offre...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isOfferExpired = new Date(offre.date_expiration) < new Date() || offre.statut !== 'ouvert';

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />

      <div className="container my-5 flex-grow-1">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/homeVC" className="text-decoration-none">Accueil</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/VoirOffres" className="text-decoration-none">Offres d'emploi</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">{offre.titre}</li>
          </ol>
        </nav>

        <div className="row">
          <div className="col-lg-8">
            {/* Main Job Details */}
            <div className="card shadow-sm border-0 mb-4 rounded-3">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h1 className="h3 fw-bold mb-2">{offre.titre}</h1>
                    <div className="d-flex align-items-center text-muted">
                      <FaBuilding className="me-2" />
                      <span>{getRecruiterName(offre.recruteur)}</span>
                      <span className="mx-2">•</span>
                      <FaMapMarkerAlt className="me-2" />
                      <span>{offre.localisation || 'Non spécifié'}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column align-items-end">
  <span
                      className={`badge ${
                        isOfferExpired ? 'bg-danger' : 
                        getDaysLeft(offre.date_expiration) === 'Expire aujourd\'hui' || 
                        getDaysLeft(offre.date_expiration) === 'Expire demain' ? 
                        'bg-warning' : 'bg-success'
                      } mb-2 px-3 py-2`}
                    >
                      {isOfferExpired ? 'Offre expirée' : offre.statut === 'ouvert' ? 'Offre active' : 'Offre fermée'}
                    </span>
                    <small className="text-muted">{getDaysLeft(offre.date_expiration)}</small>
                  </div>
                </div>

            <hr />

                <div className="row mb-4 mt-4">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light p-3 rounded-circle me-3">
                        <FaCalendarAlt className="text-primary" />
                      </div>
                      <div>
                        <p className="text-muted mb-0 small">Date de publication</p>
                        <p className="mb-0 fw-medium">{formatDate(offre.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-light p-3 rounded-circle me-3">
                        <FaClock className="text-primary" />
                      </div>
                      <div>
                        <p className="text-muted mb-0 small">Date d'expiration</p>
                        <p className="mb-0 fw-medium">{formatDate(offre.date_expiration)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">Description</h5>
                  <p className="text-muted">{offre.description}</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">Exigences</h5>
                  <p className="text-muted">{offre.exigences}</p>
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  <h5 className="fw-bold">Catégorie</h5>
                  <span className="badge bg-primary px-3 py-2">{getCategoryName(offre.Categorie)}</span>
                  {offre.Categorie?.description && (
                    <p className="text-muted mt-2 small">{offre.Categorie.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Apply Button Section */}
            <div className="card shadow-sm border-0 mb-4 rounded-3">
              <div className="card-body p-4 text-center">
                {!isUserLoggedIn ? (
              <div>
                    <p className="mb-3">Connectez-vous pour postuler à cette offre</p>
                    <Link to="/login" className="btn btn-primary btn-lg px-5">
                      Se connecter
                    </Link>
                  </div>
                ) : hasAlreadyApplied ? (
                  <div className="d-flex align-items-center justify-content-center text-success">
                    <FaCheck size={20} className="me-2" />
                    <span>Vous avez déjà postulé à cette offre</span>
                  </div>
                ) : isOfferExpired ? (
                  <div className="d-flex align-items-center justify-content-center text-danger">
                    <FaTimes size={20} className="me-2" />
                    <span>Cette offre n'est plus disponible</span>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-lg px-5"
                    onClick={handleOpenModal}
                  >
                    Postuler maintenant
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Recruiter Info */}
            <div className="card shadow-sm border-0 mb-4 rounded-3">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">À propos du recruteur</h5>
                
                <div className="text-center mb-4">
                  <AvatarLetter 
                    user={{
                      nom: getRecruiterName(offre.recruteur),
                      name: getRecruiterName(offre.recruteur)
                    }} 
                    customSize="100px"
                    style={{
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                      border: '3px solid white',
                      margin: '0 auto 15px',
                      fontSize: '2.5rem'
                    }}
                  />
                  <h5 className="mt-3 mb-1">{getRecruiterName(offre.recruteur)}</h5>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-light rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaEnvelope className="text-primary" />
                    </div>
                    <small className="text-muted">{offre.recruteur?.Email}</small>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-light rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaPhone className="text-primary" />
                    </div>
                    <small className="text-muted">{offre.recruteur?.Telephone || 'Non spécifié'}</small>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaLocation className="text-primary" />
                    </div>
                    <small className="text-muted">{offre.recruteur?.Adresse || 'Non spécifié'}</small>
                  </div>
                </div>

            <div className="text-center mt-4">
                  <Link to={`/recruteur/${offre.recruteur?._id}`} className="btn btn-outline-primary">
                    Voir le profil du recruteur
              </Link>
                </div>
              </div>
            </div>

            {/* Share Section (Optional) */}
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Partager cette offre</h5>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                    <FaLink className="me-2" /> Copier le lien
                  </button>
                  <a href={`mailto:?subject=Offre d'emploi: ${offre.titre}&body=Découvrez cette offre d'emploi: ${window.location.href}`} className="btn btn-outline-primary btn-sm">
                    <FaEnvelope className="me-2" /> Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Postuler à cette offre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMsg && <Alert variant="success">{successMsg}</Alert>}
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <h5>{offre.titre}</h5>
              <p className="text-muted small mb-0">{getRecruiterName(offre.recruteur)}</p>
            </div>
            
            <Form.Group className="mb-4">
              <p className="mb-3">
                Veuillez télécharger votre CV au format PDF pour postuler à cette offre.
              </p>
              
              <div className="custom-file-upload">
                <input 
                  type="file"
                  id="cv-file"
                  className="d-none"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="cv-file" 
                  className="btn btn-outline-primary d-flex justify-content-center align-items-center gap-2 mb-2 w-100"
                >
                  <FaFileUpload /> Sélectionner votre CV
                </label>
                
                {selectedFileName && (
                  <div className="selected-file p-2 bg-light rounded text-center">
                    <small>{selectedFileName}</small>
                  </div>
                )}
              </div>
            </Form.Group>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting || !cvFile}
              >
                {isSubmitting ? (
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
                ) : 'Envoyer ma candidature'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default Offredetails;
