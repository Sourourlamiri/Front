import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiAward, FiCode, FiBook, FiBriefcase, FiInfo, FiUser, FiDownload, FiEye } from 'react-icons/fi';
import Header from '../../../componentsVC/header';
import Footer from '../../../componentsVC/footer';
import apiCandidat from '../../../service/apiCandidat';
import ProfileItem from '../../../components/ProfileItem';
import EmptyState from '../../../components/EmptyState';
import { formatDateForAPI, formatDateForDisplay } from '../../../utils/dateUtils';
// Import MUI components
import { Snackbar, Alert, LinearProgress, Chip, Button, Tooltip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Avatar, Divider, Box, Typography, IconButton, Card, CardContent } from '@mui/material';

const InformationCandidat = () => {
  const [candidat, setCandidat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // États pour les modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalAction, setModalAction] = useState('add');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // États pour les formulaires
  const [formData, setFormData] = useState({
    nomCertification: '',
    date_Dobtention: '',
    nomCompétence: '',
    niveau: 'Débutant',
    nomFormation: '',
    date_obtention: '',
    etablissement: '',
    formationDescription: '',
    nomExpérience: '',
    date_Debut: '',
    date_Fin: '',
    entreprise: '',
    description: ''
  });

  // État de validation
  const [formErrors, setFormErrors] = useState({});

  // Function to show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Function to close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCandidat.getByIdCandidat(id);
        setCandidat(response.data.getCandidat);
      } catch (err) {
        setError("Erreur de chargement des données");
        console.error(err);
        showSnackbar("Erreur de chargement des données du profil", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOpenModal = (type, action, data = null) => {
    setModalType(type);
    setModalAction(action);

    // Réinitialiser le formulaire
    setFormData({
      nomCertification: '',
      date_Dobtention: '',
      nomCompétence: '',
      niveau: 'Débutant',
      nomFormation: '',
      date_obtention: '',
      etablissement: '',
      formationDescription: '',
      nomExpérience: '',
      date_Debut: '',
      date_Fin: '',
      entreprise: '',
      description: ''
    });

    // Reset form errors
    setFormErrors({});

    // Si c'est une modification, pré-remplir le formulaire
    if (action === 'edit' && data) {
    setModalData(data);

      if (type === 'Certification') {
        const dateStr = data.date_Dobtention ? new Date(data.date_Dobtention).toISOString().split('T')[0] : '';
        setFormData(prev => ({
          ...prev,
          nomCertification: data.nomCertification || '',
          date_Dobtention: dateStr
        }));
      }
      else if (type === 'Competence') {
        setFormData(prev => ({
          ...prev,
          nomCompétence: data.nomCompétence || '',
          niveau: data.niveau || 'Débutant'
        }));
      }
      else if (type === 'Formation') {
        const dateStr = data.date_obtention ? new Date(data.date_obtention).toISOString().split('T')[0] : '';
        setFormData(prev => ({
          ...prev,
          nomFormation: data.nomFormation || '',
          date_obtention: dateStr,
          etablissement: data.etablissement || '',
          formationDescription: data.description || ''
        }));
      }
      else if (type === 'Experience') {
        const dateDebutStr = data.date_Debut ? new Date(data.date_Debut).toISOString().split('T')[0] : '';
        const dateFinStr = data.date_Fin ? new Date(data.date_Fin).toISOString().split('T')[0] : '';
        setFormData(prev => ({
          ...prev,
          nomExpérience: data.nomExpérience || '',
          date_Debut: dateDebutStr,
          date_Fin: dateFinStr,
          entreprise: data.entreprise || '',
          description: data.description || ''
        }));
      }
    } else {
      setModalData(null);
    }

    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear specific field error when user is typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validation based on modal type
    if (modalType === 'Certification') {
      if (!formData.nomCertification?.trim()) {
        errors.nomCertification = 'Veuillez entrer le nom de la certification';
      }

      if (!formData.date_Dobtention) {
        errors.date_Dobtention = 'Veuillez sélectionner une date d\'obtention';
      }
    }
    else if (modalType === 'Competence') {
      if (!formData.nomCompétence?.trim()) {
        errors.nomCompétence = 'Veuillez entrer le nom de la compétence';
      }
    }
    else if (modalType === 'Formation') {
      if (!formData.nomFormation?.trim()) {
        errors.nomFormation = 'Veuillez entrer le nom de la formation';
      }

      if (!formData.date_obtention) {
        errors.date_obtention = 'Veuillez sélectionner une date d\'obtention';
      }
      if (!formData.etablissement?.trim()) {
        errors.etablissement = 'Veuillez entrer le nom de l\'établissement';
      }
      if (!formData.formationDescription?.trim()) {
        errors.formationDescription = 'Veuillez entrer une description';
      }
    }
    else if (modalType === 'Experience') {
      if (!formData.nomExpérience?.trim()) {
        errors.nomExpérience = 'Veuillez entrer l\'intitulé du poste';
      }

      if (!formData.date_Debut) {
        errors.date_Debut = 'Veuillez sélectionner une date de début';
      }

      if (!formData.date_Fin) {
        errors.date_Fin = 'Veuillez sélectionner une date de fin';
      }

      if (!formData.entreprise?.trim()) {
        errors.entreprise = 'Veuillez entrer le nom de l\'entreprise';
      }
      if (!formData.description?.trim()) {
        errors.description = 'Veuillez entrer une description';
      }

      if (formData.date_Debut && formData.date_Fin) {
        const start = new Date(formData.date_Debut);
        const end = new Date(formData.date_Fin);

        if (start > end) {
          errors.date_Fin = 'La date de fin doit être postérieure à la date de début';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Validate form before submission
    if (!validateForm()) {
      showSnackbar("Veuillez corriger les erreurs dans le formulaire", "error");
      return;
    }

    try {
      let dataToSubmit = { ...formData, candidatId: id };

      // Format dates properly for the API
      if (modalType === 'Certification') {
        dataToSubmit.date_Dobtention = formatDateForAPI(formData.date_Dobtention);
      }
      else if (modalType === 'Formation') {
        dataToSubmit.date_obtention = formatDateForAPI(formData.date_obtention);
        dataToSubmit.etablissement = formData.etablissement;
        dataToSubmit.description = formData.formationDescription;
        // Remove the formationDescription field as the API expects 'description'
        delete dataToSubmit.formationDescription;
      }
      else if (modalType === 'Experience') {
        dataToSubmit.date_Debut = formatDateForAPI(formData.date_Debut);
        dataToSubmit.date_Fin = formatDateForAPI(formData.date_Fin);
        dataToSubmit.entreprise = formData.entreprise;
        dataToSubmit.description = formData.description;

        // Debug logging
        console.log('Experience data being prepared:', {
          nomExpérience: dataToSubmit.nomExpérience,
          date_Debut: dataToSubmit.date_Debut,
          date_Fin: dataToSubmit.date_Fin,
          entreprise: dataToSubmit.entreprise,
          description: dataToSubmit.description
        });
      }

      let response;

      if (modalAction === 'add') {
        switch (modalType) {
          case 'Certification':
            await apiCandidat.addCertification(dataToSubmit);
            break;
          case 'Competence':
            await apiCandidat.addCompetence(dataToSubmit);
            break;
          case 'Formation':
            await apiCandidat.addFormation(dataToSubmit);
            break;
          case 'Experience':
            await apiCandidat.addExperience(dataToSubmit);
            break;
          default:
            throw new Error("Type non reconnu");
        }
      } else {
        // Modification
        switch (modalType) {
          case 'Certification':
            await apiCandidat.updateCertification(modalData._id, dataToSubmit);
            break;
          case 'Competence':
            await apiCandidat.updateCompetence(modalData._id, dataToSubmit);
            break;
          case 'Formation':
            await apiCandidat.updateFormation(modalData._id, dataToSubmit);
            break;
          case 'Experience':
            await apiCandidat.updateExperience(modalData._id, dataToSubmit);
            break;
          default:
            throw new Error("Type non reconnu");
        }
      }

      // Actualiser les données
      response = await apiCandidat.getByIdCandidat(id);
      setCandidat(response.data.getCandidat);
      setShowModal(false);

      // Show success message with snackbar instead of alert
      const successMessage = modalAction === 'add' ? 'ajouté' : 'modifié';
      showSnackbar(`${modalType} ${successMessage} avec succès !`, "success");
    } catch (err) {
      console.error("Erreur de sauvegarde", err);
      showSnackbar("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.", "error");
    }
  };

  const handleDelete = async (type, itemId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      try {
        switch (type) {
          case 'Certification':
            await apiCandidat.deleteCertification(itemId);
            break;
          case 'Competence':
            await apiCandidat.deleteCompetence(itemId);
            break;
          case 'Formation':
            await apiCandidat.deleteFormation(itemId);
            break;
          case 'Experience':
            await apiCandidat.deleteExperience(itemId);
            break;
          default:
            throw new Error("Type non reconnu");
        }

        // Actualiser les données
        const response = await apiCandidat.getByIdCandidat(id);
        setCandidat(response.data.getCandidat);
        showSnackbar("Élément supprimé avec succès", "success");
      } catch (err) {
        console.error("Erreur de suppression", err);
        showSnackbar("Une erreur est survenue lors de la suppression. Veuillez réessayer.", "error");
      }
    }
  };

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="text-center mb-4">
        <h4 className="mb-3 text-primary">Chargement du profil...</h4>
        <LinearProgress style={{ width: '200px' }} color="primary" />
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger text-center mt-5">
      {error}
    </div>
  );

  if (!candidat) return (
    <div className="alert alert-warning text-center mt-5">
      Aucune information disponible
    </div>
  );

  return (
    <div className="modern-profile-cv">
      <Header />

      <div className="container py-5">
        {/* Modern Profile Header */}
        <Paper elevation={3} className="profile-header mb-4 rounded-lg">
          <div className="gradient-overlay rounded-lg">
            <div className="container py-5">
              <div className="row align-items-center">
                <div className="col-md-3 text-center text-md-start mb-4 mb-md-0">
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      backgroundColor: 'primary.main',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                    }}
                    className="mx-auto mx-md-0"
                  >
                    <Typography variant="h3">
                      {candidat.Nom ? candidat.Nom.charAt(0) : 'C'}
                    </Typography>
                  </Avatar>
          </div>
                <div className="col-md-6">
                  <Typography variant="h4" className="text-white mb-1">
                    {candidat.Nom || 'Prénom Nom'}
                  </Typography>
                  <Typography variant="subtitle1" className="text-white-50 mb-3">
                    {getLatestTitle() || 'Titre professionnel'}
                  </Typography>
                  <div className="profile-stats d-flex text-white-50">
                    <div className="me-4">
                      <small className="text-uppercase">Certifications</small>
                      <Typography variant="h6" className="text-white m-0">
                        {candidat.Certification?.length || 0}
                      </Typography>
                      </div>
                    <div className="me-4">
                      <small className="text-uppercase">Compétences</small>
                      <Typography variant="h6" className="text-white m-0">
                        {candidat.Competence?.length || 0}
                      </Typography>
                      </div>
                    <div className="me-4">
                      <small className="text-uppercase">Expériences</small>
                      <Typography variant="h6" className="text-white m-0">
                        {candidat.Experience?.length || 0}
                      </Typography>
                    </div>
                  </div>
              </div>
                <div className="col-md-3 text-center text-md-end mt-4 mt-md-0">
                  <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-end">

              </div>
          </div>
        </div>
            </div>
          </div>
          <div className="profile-completion px-4 pb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Typography variant="body2" color="text.secondary">
                Profil complété à {calculateProfileCompleteness()}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getTotalProfileItems()} éléments ajoutés
              </Typography>
            </div>
            <LinearProgress
              variant="determinate"
              value={calculateProfileCompleteness()}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundImage: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)'
                }
              }}
            />
          </div>
        </Paper>

        {/* Content Row Layout */}
        <div className="row">
          {/* Left Column - Skills & Certifications */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            {/* Skills Section */}
            <Card className="shadow-sm border-0 mb-4 rounded-lg overflow-hidden">
              <Box sx={{
                backgroundColor: 'primary.main',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box display="flex" alignItems="center">
                  <FiCode className="text-white me-2" size={20} />
                  <Typography variant="h6" className="text-white m-0">
                    Compétences
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiPlus />}
              onClick={() => handleOpenModal('Competence', 'add')}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none'
                  }}
                >
              Ajouter
                </Button>
              </Box>
              <CardContent className="p-0">
            {candidat.Competence?.length > 0 ? (
                  <div className="p-3">
                    <div className="row g-3">
                {candidat.Competence.map((comp, index) => (
                        <div key={comp._id || index} className="col-12">
                          <Paper
                            elevation={0}
                            className="skill-card p-3 border h-100 position-relative"
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <Typography variant="subtitle1" className="mb-0 fw-medium">
                                {comp.nomCompétence}
                              </Typography>
                        <div className="d-flex align-items-center">
                                <Chip
                                  label={comp.niveau}
                                  size="small"
                                  color={
                                    comp.niveau === 'Débutant' ? 'info' :
                                      comp.niveau === 'Intermédiaire' ? 'primary' :
                                        comp.niveau === 'Avancé' ? 'warning' :
                                          'success'
                                  }
                                  sx={{ borderRadius: '12px', fontWeight: 500, mr: 1 }}
                                />
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenModal('Competence', 'edit', comp)}
                                  sx={{ padding: '4px', mr: 0.5 }}
                                >
                                  <FiEdit2 size={14} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete('Competence', comp._id)}
                                  sx={{ padding: '4px' }}
                                >
                                  <FiTrash2 size={14} />
                                </IconButton>
                              </div>
                            </div>
                            <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                              <div
                                className="progress-bar"
                              style={{ 
                                  width: `${comp.niveau === 'Débutant' ? '25%' :
                                  comp.niveau === 'Intermédiaire' ? '50%' :
                                  comp.niveau === 'Avancé' ? '75%' :
                                  '100%'
                                    }`,
                                  borderRadius: '3px',
                                  backgroundImage: comp.niveau === 'Débutant' ? 'linear-gradient(90deg, #29B6F6 0%, #4FC3F7 100%)' :
                                    comp.niveau === 'Intermédiaire' ? 'linear-gradient(90deg, #42A5F5 0%, #2196F3 100%)' :
                                      comp.niveau === 'Avancé' ? 'linear-gradient(90deg, #FFB74D 0%, #FFA726 100%)' :
                                        'linear-gradient(90deg, #66BB6A 0%, #4CAF50 100%)'
                              }}
                            ></div>
                          </div>
                          </Paper>
                        </div>
                      ))}
                      </div>
                  </div>
                ) : (
                  <Box sx={{ p: 4 }}>
                    <EmptyState
                      icon={<FiCode size={32} className="text-muted" />}
                      message="Aucune compétence enregistrée"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Certifications Section */}
            <Card className="shadow-sm border-0 mb-4 rounded-lg overflow-hidden">
              <Box sx={{
                backgroundColor: '#FF9800',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box display="flex" alignItems="center">
                  <FiAward className="text-white me-2" size={20} />
                  <Typography variant="h6" className="text-white m-0">
                    Certifications
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiPlus />}
                  onClick={() => handleOpenModal('Certification', 'add')}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none'
                  }}
                >
                  Ajouter
                </Button>
              </Box>
              <CardContent className="p-0">
                {candidat.Certification?.length > 0 ? (
                  <div>
                    {candidat.Certification.map((cert, index) => (
                      <Box
                        key={cert._id || index}
                        sx={{
                          p: 3,
                          borderBottom: index < candidat.Certification.length - 1 ? '1px solid #eee' : 'none',
                          position: 'relative'
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <Typography variant="subtitle1" className="mb-1 fw-medium">
                            {cert.nomCertification}
                          </Typography>
                          <div>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenModal('Certification', 'edit', cert)}
                        >
                          <FiEdit2 size={14} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete('Certification', cert._id)}
                        >
                          <FiTrash2 size={14} />
                            </IconButton>
                      </div>
                    </div>
                        <div className="d-flex align-items-center">
                          <i className="far fa-calendar-alt text-muted me-2"></i>
                          <Typography variant="body2" color="text.secondary">
                            Obtenue le {new Date(cert.date_Dobtention).toLocaleDateString('fr-FR')}
                          </Typography>
                  </div>
                      </Box>
                ))}
              </div>
            ) : (
                  <Box sx={{ p: 4 }}>
                    <EmptyState
                      icon={<FiAward size={32} className="text-muted" />}
                      message="Aucune certification disponible"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
        </div>

          {/* Right Column - Experiences & Education */}
          <div className="col-lg-8">
            {/* Experience Section */}
            <Card className="shadow-sm border-0 mb-4 rounded-lg overflow-hidden">
              <Box sx={{
                backgroundColor: '#E91E63',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box display="flex" alignItems="center">
                  <FiBriefcase className="text-white me-2" size={20} />
                  <Typography variant="h6" className="text-white m-0">
                    Expériences
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiPlus />}
                  onClick={() => handleOpenModal('Experience', 'add')}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none'
                  }}
                >
              Ajouter
                </Button>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {candidat.Experience?.length > 0 ? (
                  <Box className="modern-timeline p-4">
                    {candidat.Experience.map((exp, index) => (
                      <div key={exp._id || index} className="timeline-item position-relative">
                        <Paper
                          elevation={0}
                          className="timeline-content border p-3 mb-4 rounded-lg"
                          sx={{
                            ml: 4,
                            position: 'relative',
                            '&:before': {
                              content: '""',
                              position: 'absolute',
                              left: '-20px',
                              top: '22px',
                              width: '20px',
                              height: '2px',
                              backgroundColor: '#e0e0e0'
                            },
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                              borderColor: '#E91E63',
                              '&:before': {
                                backgroundColor: '#E91E63'
                              }
                            }
                          }}
                        >
                          <Box className="timeline-dot" sx={{
                            position: 'absolute',
                            left: '-30px',
                            top: '22px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#E91E63',
                            border: '4px solid #fff',
                            boxShadow: '0 0 0 2px rgba(233, 30, 99, 0.2)',
                            zIndex: 1
                          }}></Box>

                          <div className="d-flex justify-content-between">
                            <Typography variant="h6" className="mb-1">
                              {exp.nomExpérience}
                            </Typography>
                      <div>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenModal('Experience', 'edit', exp)}
                        >
                          <FiEdit2 size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete('Experience', exp._id)}
                        >
                          <FiTrash2 size={14} />
                              </IconButton>
                      </div>
                    </div>

                          <div className="mb-2">
                            <Chip
                              size="small"
                              icon={<i className="fas fa-building"></i>}
                              label={exp.entreprise}
                              color="primary"
                              variant="outlined"
                              className="me-2 mb-1"
                              sx={{ borderRadius: '12px' }}
                            />
                            <Chip
                              size="small"
                              icon={<i className="far fa-calendar-alt"></i>}
                              label={`${new Date(exp.date_Debut).toLocaleDateString('fr-FR')} - ${new Date(exp.date_Fin).toLocaleDateString('fr-FR')}`}
                              color="secondary"
                              variant="outlined"
                              className="mb-1"
                              sx={{ borderRadius: '12px' }}
                            />
                  </div>

                          {exp.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {exp.description}
                            </Typography>
                          )}
                        </Paper>
              </div>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 4 }}>
                    <EmptyState
                      icon={<FiBriefcase size={32} className="text-muted" />}
                      message="Aucune expérience enregistrée"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card className="shadow-sm border-0 mb-4 rounded-lg overflow-hidden">
              <Box sx={{
                backgroundColor: '#4CAF50',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box display="flex" alignItems="center">
                  <FiBook className="text-white me-2" size={20} />
                  <Typography variant="h6" className="text-white m-0">
                    Formations
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiPlus />}
                  onClick={() => handleOpenModal('Formation', 'add')}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none'
                  }}
                >
              Ajouter
                </Button>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {candidat.Formation?.length > 0 ? (
                  <Box className="modern-timeline p-4">
                    {candidat.Formation.map((form, index) => (
                      <div key={form._id || index} className="timeline-item position-relative">
                        <Paper
                          elevation={0}
                          className="timeline-content border p-3 mb-4 rounded-lg"
                          sx={{
                            ml: 4,
                            position: 'relative',
                            '&:before': {
                              content: '""',
                              position: 'absolute',
                              left: '-20px',
                              top: '22px',
                              width: '20px',
                              height: '2px',
                              backgroundColor: '#e0e0e0'
                            },
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                              borderColor: '#4CAF50',
                              '&:before': {
                                backgroundColor: '#4CAF50'
                              }
                            }
                          }}
                        >
                          <Box className="timeline-dot" sx={{
                            position: 'absolute',
                            left: '-30px',
                            top: '22px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#4CAF50',
                            border: '4px solid #fff',
                            boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)',
                            zIndex: 1
                          }}></Box>

                          <div className="d-flex justify-content-between">
                            <Typography variant="h6" className="mb-1">
                              {form.nomFormation}
                            </Typography>
                      <div>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenModal('Formation', 'edit', form)}
                        >
                          <FiEdit2 size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete('Formation', form._id)}
                        >
                          <FiTrash2 size={14} />
                              </IconButton>
                      </div>
                    </div>

                          <div className="mb-2">
                            <Chip
                              size="small"
                              icon={<i className="fas fa-university"></i>}
                              label={form.etablissement}
                              color="primary"
                              variant="outlined"
                              className="me-2 mb-1"
                              sx={{ borderRadius: '12px' }}
                            />
                            <Chip
                              size="small"
                              icon={<i className="far fa-calendar-alt"></i>}
                              label={new Date(form.date_obtention).toLocaleDateString('fr-FR')}
                              color="secondary"
                              variant="outlined"
                              className="mb-1"
                              sx={{ borderRadius: '12px' }}
                            />
                  </div>

                          {form.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {form.description}
                            </Typography>
                          )}
                        </Paper>
              </div>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 4 }}>
                    <EmptyState
                      icon={<FiBook size={32} className="text-muted" />}
                      message="Aucune formation enregistrée"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Replace Bootstrap Modal with MUI Dialog */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
                  {modalAction === 'add' ? 'Ajouter une' : 'Modifier la'} {modalType}
        </DialogTitle>
        <DialogContent dividers>
          {/* Certification form fields */}
                {modalType === 'Certification' && (
                  <>
              <TextField
                label="Nom de la certification"
                fullWidth
                margin="normal"
                name="nomCertification"
                value={formData.nomCertification}
                onChange={handleInputChange}
                error={!!formErrors.nomCertification}
                helperText={formErrors.nomCertification}
                required
              />
              <TextField
                label="Date d'obtention"
                        type="date" 
                fullWidth
                margin="normal"
                name="date_Dobtention"
                value={formData.date_Dobtention}
                onChange={handleInputChange}
                error={!!formErrors.date_Dobtention}
                helperText={formErrors.date_Dobtention}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
                  </>
                )}

          {/* Competence form fields */}
                {modalType === 'Competence' && (
                  <>
              <TextField
                label="Nom de la compétence"
                fullWidth
                margin="normal"
                name="nomCompétence"
                value={formData.nomCompétence}
                onChange={handleInputChange}
                error={!!formErrors.nomCompétence}
                helperText={formErrors.nomCompétence}
                required
              />
              <TextField
                select
                label="Niveau"
                fullWidth
                margin="normal"
                name="niveau"
                value={formData.niveau}
                onChange={handleInputChange}
                helperText="Choisissez votre niveau d'expertise"
                SelectProps={{
                  native: true,
                }}
                required
              >
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Expert">Expert</option>
              </TextField>
              <div className="d-flex justify-content-between mt-2">
                <Chip size="small" label="Débutant" color="info" className="me-1" />
                <Chip size="small" label="Intermédiaire" color="primary" className="me-1" />
                <Chip size="small" label="Avancé" color="warning" className="me-1" />
                <Chip size="small" label="Expert" color="success" />
                    </div>
                  </>
                )}

          {/* Formation form fields */}
          {modalType === 'Formation' && (
            <>
              <TextField
                label="Nom de la formation"
                fullWidth
                margin="normal"
                name="nomFormation"
                value={formData.nomFormation}
                onChange={handleInputChange}
                error={!!formErrors.nomFormation}
                helperText={formErrors.nomFormation}
                required
              />
              <TextField
                label="Établissement"
                fullWidth
                margin="normal"
                name="etablissement"
                value={formData.etablissement}
                onChange={handleInputChange}
                error={!!formErrors.etablissement}
                helperText={formErrors.etablissement}
                required
              />
              <TextField
                label="Date d'obtention"
                type="date"
                fullWidth
                margin="normal"
                name="date_obtention"
                value={formData.date_obtention}
                onChange={handleInputChange}
                error={!!formErrors.date_obtention}
                helperText={formErrors.date_obtention}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                name="formationDescription"
                value={formData.formationDescription}
                onChange={handleInputChange}
                error={!!formErrors.formationDescription}
                helperText={formErrors.formationDescription}
                multiline
                rows={3}
                required
              />
            </>
          )}

          {/* Experience form fields */}
          {modalType === 'Experience' && (
            <>
              <TextField
                label="Intitulé du poste"
                fullWidth
                margin="normal"
                name="nomExpérience"
                value={formData.nomExpérience}
                onChange={handleInputChange}
                error={!!formErrors.nomExpérience}
                helperText={formErrors.nomExpérience}
                required
              />
              <TextField
                label="Entreprise"
                fullWidth
                margin="normal"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleInputChange}
                error={!!formErrors.entreprise}
                helperText={formErrors.entreprise}
                required
              />
              <div className="row">
                <div className="col-md-6">
                  <TextField
                    label="Date de début"
                    type="date"
                    fullWidth
                    margin="normal"
                    name="date_Debut"
                    value={formData.date_Debut}
                    onChange={handleInputChange}
                    error={!!formErrors.date_Debut}
                    helperText={formErrors.date_Debut}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
              </div>
                <div className="col-md-6">
                  <TextField
                    label="Date de fin"
                    type="date"
                    fullWidth
                    margin="normal"
                    name="date_Fin"
                    value={formData.date_Fin}
                    onChange={handleInputChange}
                    error={!!formErrors.date_Fin}
                    helperText={formErrors.date_Fin}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </div>
              </div>
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                multiline
                rows={3}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
                >
                  {modalAction === 'add' ? 'Ajouter' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Additional custom styles for modern UI */}
      <style jsx="true">{`
        .modern-profile-cv {
          background-color: #f5f7fa;
          min-height: 100vh;
        }
        
        .profile-header {
          position: relative;
          overflow: hidden;
        }
        
        .gradient-overlay {
          background: linear-gradient(135deg, #6d5bba 0%, #8b5fbf 100%);
          color: white;
          position: relative;
        }
        
        .profile-completion {
          background-color: white;
          border-radius: 0 0 8px 8px;
        }
        
        .modern-timeline {
          position: relative;
        }
        
        .modern-timeline:before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          height: 100%;
          width: 2px;
          background-color: #e9ecef;
        }

        .rounded-lg {
          border-radius: 12px !important;
        }
        
        /* Card hover effects */
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      {/* Use MUI Snackbar instead of alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </div>
  );

  // Helper function to calculate profile completeness
  function calculateProfileCompleteness() {
    const sections = [
      candidat.Certification?.length > 0,
      candidat.Competence?.length > 0,
      candidat.Formation?.length > 0,
      candidat.Experience?.length > 0
    ];

    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  }

  // Helper function to get total number of profile items
  function getTotalProfileItems() {
    return (
      (candidat.Certification?.length || 0) +
      (candidat.Competence?.length || 0) +
      (candidat.Formation?.length || 0) +
      (candidat.Experience?.length || 0)
    );
  }

  // Helper function to get most recent job title for profile header
  function getLatestTitle() {
    if (!candidat.Experience || candidat.Experience.length === 0) {
      return null;
    }

    // Sort experiences by date (most recent first)
    const sortedExperiences = [...candidat.Experience].sort((a, b) => {
      return new Date(b.date_Fin) - new Date(a.date_Fin);
    });

    return sortedExperiences[0].nomExpérience;
  }
};

export default InformationCandidat;