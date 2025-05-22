import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../../componentsVC/header";
import Footer from "../../../componentsVC/footer";
import apiCandidat from "../../../service/apiCandidat";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import {
  FiCalendar,
  FiClock,
  FiFilter,
  FiMapPin,
  FiUser,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiClock as FiClockCircle,
  FiVideo,
  FiLink,
  FiBriefcase,
} from "react-icons/fi";
import { Link } from "react-router-dom";

// Colors based on interview status
const STATUS_COLORS = {
  pending: {
    light: "#FFF8E1",
    main: "#FFC107",
    text: "#876500",
    icon: <FiClock size={16} />,
  },
  confirmed: {
    light: "#E8F5E9",
    main: "#4CAF50",
    text: "#1B5E20",
    icon: <FiCheckCircle size={16} />,
  },
  cancelled: {
    light: "#FFEBEE",
    main: "#F44336",
    text: "#B71C1C",
    icon: <FiAlertCircle size={16} />,
  },
  completed: {
    light: "#E3F2FD",
    main: "#2196F3",
    text: "#0D47A1",
    icon: <FiCheckCircle size={16} />,
  },
};

const MesEntretiens = () => {
  const [entretiens, setEntretiens] = useState([]);
  const [filteredEntretiens, setFilteredEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [currentEntretien, setCurrentEntretien] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_asc");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const candidatId = localStorage.getItem("utilisateur")
    ? JSON.parse(localStorage.getItem("utilisateur"))?.utilisateur?._id
    : null;

  useEffect(() => {
    if (candidatId) {
      setLoading(true);
      // Use the apiCandidat service instead of direct axios call
      apiCandidat
        .getEntretiensByCandidat(candidatId)
        .then((response) => {
          const entretienData = response.data.entretiens || [];

          // Process the interviews to add any missing information
          const processedEntretiens = entretienData.map((entretien) => {
            return {
              ...entretien,
              // Add any missing fields that might be needed
              offre: entretien.Offre
                ? {
                    id: entretien.Offre._id,
                    titre: entretien.Offre.titre,
                    entreprise: entretien.Recruteur.Nom,
                    recruteur: entretien.Offre.Recruteur,
                  }
                : null,
            };
          });

          setEntretiens(processedEntretiens);
          setFilteredEntretiens(processedEntretiens);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des entretiens:", error);
          setError(
            "Impossible de charger vos entretiens. Veuillez réessayer plus tard."
          );
          setLoading(false);

          // Fallback to the old method if the new endpoint fails
          fetchEntretiensFromCandidatures();
        });
    } else {
      setLoading(false);
      setError("Session utilisateur non trouvée. Veuillez vous reconnecter.");
    }
  }, [candidatId]);

  // Fallback method to fetch interviews from candidatures
  const fetchEntretiensFromCandidatures = () => {
    axios
      .get(`http://localhost:5002/Candidat/${candidatId}`)
      .then((response) => {
        const candidatureData = response.data.getCandidat.Candidature || [];

        // Extract entretiens from candidatures
        const allEntretiens = [];
        candidatureData.forEach((candidature) => {
          if (candidature.entretien && candidature.entretien.length > 0) {
            candidature.entretien.forEach((entretien) => {
              // Add candidature and job offer info to each entretien
              allEntretiens.push({
                ...entretien,
                candidature: {
                  id: candidature._id,
                  statut: candidature.statut,
                },
                offre:
                  candidature.Offre && candidature.Offre.length > 0
                    ? {
                        id: candidature.Offre[0]._id,
                        titre: candidature.Offre[0].titre,
                        entreprise: candidature.Offre[0].entreprise,
                        recruteur: candidature.Offre[0].Recruteur,
                      }
                    : null,
              });
            });
          }
        });

        setEntretiens(allEntretiens);
        setFilteredEntretiens(allEntretiens);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des candidatures:", error);
        setError(
          "Impossible de charger vos entretiens. Veuillez réessayer plus tard."
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    let result = [...entretiens];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (entretien) =>
          getEntretienStatus(entretien).toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entretien) =>
          entretien?.offre?.titre?.toLowerCase().includes(query) ||
          entretien?.type?.toLowerCase().includes(query) ||
          entretien?.lieu?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result = result.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      switch (sortBy) {
        case "date_asc":
          return dateA - dateB;
        case "date_desc":
          return dateB - dateA;
        default:
          return 0;
      }
    });

    setFilteredEntretiens(result);
  }, [entretiens, statusFilter, searchQuery, sortBy]);

  const handleOpenDetailDialog = (entretien) => {
    setCurrentEntretien(entretien);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setCurrentEntretien(null);
  };



  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getEntretienStatus = (entretien) => {
    const entretienDate = new Date(entretien.date);
    const now = new Date();

    if (entretien.statut?.toLowerCase() === "annulé") {
      return "cancelled";
    } else if (entretien.statut?.toLowerCase() === "terminé") {
      return "completed";
    } else if (entretien.statut?.toLowerCase() === "confirmé") {
      return "confirmed";
    } else if (entretienDate < now) {
      return "completed"; // Past date and no explicit status
    } else {
      return "pending"; // Future date and no explicit status
    }
  };

  const getStatusChip = (entretien) => {
    const status = getEntretienStatus(entretien);
    const statusConfig = STATUS_COLORS[status];

    let label;
    switch (status) {
      case "pending":
        label = "En attente";
        break;
      case "confirmed":
        label = "Confirmé";
        break;
      case "cancelled":
        label = "Annulé";
        break;
      case "completed":
        label = "Terminé";
        break;
      default:
        label = "Non défini";
    }

    return (
      <Chip
        icon={statusConfig.icon}
        label={label}
        sx={{
          fontWeight: 500,
          borderRadius: "12px",
          backgroundColor: statusConfig.light,
          color: statusConfig.text,
        }}
        size="small"
      />
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Date non spécifiée";

    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString("fr-FR", options);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non spécifiée";

    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("fr-FR", options);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Heure non spécifiée";

    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSortBy("date_asc");
  };

  const calculateDuration = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return "Durée non spécifiée";

    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    const durationMs = end - start;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours}h${minutes > 0 ? minutes : ""}`;
    }
  };

  return (
    <div>
      <Header />
      <div className="main-content">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="700"
            color="primary"
          >
            Mes Entretiens
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Retrouvez ici tous vos entretiens programmés avec les recruteurs.
          </Typography>

          {/* Filters Section */}
          <Paper
            elevation={0}
            sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un entretien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch size={20} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="status-filter-label">Statut</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Statut"
                    startAdornment={
                      <InputAdornment position="start">
                        <FiFilter size={20} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">Tous les statuts</MenuItem>
                    <MenuItem value="pending">En attente</MenuItem>
                    <MenuItem value="confirmed">Confirmé</MenuItem>
                    <MenuItem value="cancelled">Annulé</MenuItem>
                    <MenuItem value="completed">Terminé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="sort-label">Trier par</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Trier par"
                  >
                    <MenuItem value="date_asc">Date (croissant)</MenuItem>
                    <MenuItem value="date_desc">Date (décroissant)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={resetFilters}
                  fullWidth
                  size="medium"
                >
                  Réinitialiser
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Main Content */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              my={6}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : filteredEntretiens.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                border: "1px dashed #ccc",
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
              }}
            >
              <FiCalendar
                size={48}
                style={{ color: "#9e9e9e", marginBottom: "16px" }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun entretien trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous n'avez pas encore d'entretiens programmés ou aucun
                entretien ne correspond à vos filtres.
              </Typography>
              {statusFilter !== "all" || searchQuery !== "" ? (
                <Button color="primary" onClick={resetFilters} sx={{ mt: 2 }}>
                  Réinitialiser les filtres
                </Button>
              ) : null}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredEntretiens.map((entretien, index) => (
                <Grid item xs={12} md={6} key={entretien._id || index}>
                  <Card
                    elevation={0}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        {getStatusChip(entretien)}
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatDate(entretien.date)}
                        </Typography>
                      </Box>

                      <Typography variant="h6" gutterBottom fontWeight="600">
                        {entretien.offre?.titre || "Entretien sans titre"}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={1.5}>
                        <FiBriefcase
                          size={18}
                          style={{ marginRight: "8px", opacity: 0.7 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {entretien.offre?.entreprise ||
                            "Entreprise non spécifiée"}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <FiClock
                              size={16}
                              style={{ marginRight: "8px", opacity: 0.7 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(entretien.date)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <FiMapPin
                              size={16}
                              style={{ marginRight: "8px", opacity: 0.7 }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {entretien.lieu ||
                                entretien.type ||
                                "Non spécifié"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box mt={2}>
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={() => handleOpenDetailDialog(entretien)}
                        >
                          Voir les détails
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Interview Details Dialog */}
          <Dialog
            open={openDetailDialog}
            onClose={handleCloseDetailDialog}
            fullWidth
            maxWidth="md"
          >
            {currentEntretien && (
              <>
                <DialogTitle>
                  <Typography variant="h5" fontWeight="700">
                    Détails de l'entretien
                  </Typography>
                </DialogTitle>
                <DialogContent dividers>
                  <Box mb={3} pb={2} borderBottom={1} borderColor="divider">
                    <Typography variant="h6" gutterBottom>
                      {currentEntretien.offre?.titre || "Entretien sans titre"}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Statut:
                      </Typography>
                      {getStatusChip(currentEntretien)}
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: "#f8f9fa",
                          borderRadius: 2,
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="600"
                          gutterBottom
                        >
                          Informations sur l'entretien
                        </Typography>
                        <Box
                          display="flex"
                          flexDirection="column"
                          gap={2}
                          mt={2}
                        >
                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <FiCalendar
                              size={20}
                              style={{ color: "#5C6BC0", marginTop: "2px" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Date et heure
                              </Typography>
                              <Typography variant="body1">
                                {formatDateTime(currentEntretien.date)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <FiClock
                              size={20}
                              style={{ color: "#5C6BC0", marginTop: "2px" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Durée
                              </Typography>
                              <Typography variant="body1">
                                {calculateDuration(
                                  currentEntretien.date,
                                  currentEntretien.dateFin
                                ) || "Non spécifiée"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <FiMapPin
                              size={20}
                              style={{ color: "#5C6BC0", marginTop: "2px" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Lieu
                              </Typography>
                              <Typography variant="body1">
                                {currentEntretien.lieu || "Non spécifié"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <FiVideo
                              size={20}
                              style={{ color: "#5C6BC0", marginTop: "2px" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Type d'entretien
                              </Typography>
                              <Typography variant="body1">
                                {currentEntretien.type || "Non spécifié"}
                              </Typography>
                            </Box>
                          </Box>

                          {currentEntretien.lienVisio && (
                            <Box display="flex" alignItems="flex-start" gap={2}>
                              <FiLink
                                size={20}
                                style={{ color: "#5C6BC0", marginTop: "2px" }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Lien de visioconférence
                                </Typography>
                                <Button
                                  variant="text"
                                  color="primary"
                                  href={currentEntretien.lienVisio}
                                  target="_blank"
                                  sx={{
                                    p: 0,
                                    textTransform: "none",
                                    textAlign: "left",
                                  }}
                                >
                                  Accéder à la réunion
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: "#f8f9fa",
                          borderRadius: 2,
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="600"
                          gutterBottom
                        >
                          Informations sur l'offre
                        </Typography>
                        <Box
                          display="flex"
                          flexDirection="column"
                          gap={2}
                          mt={2}
                        >
                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <FiBriefcase
                              size={20}
                              style={{ color: "#5C6BC0", marginTop: "2px" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Poste
                              </Typography>
                              <Typography variant="body1">
                                {currentEntretien.offre?.titre ||
                                  "Non spécifié"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <FiUser
                              size={20}
                              style={{ color: "#5C6BC0", marginTop: "2px" }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Entreprise
                              </Typography>
                              <Typography variant="body1">
                                {currentEntretien.offre?.entreprise ||
                                  "Non spécifiée"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {currentEntretien.description && (
                          <Box mt={3}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="600"
                              gutterBottom
                            >
                              Description
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {currentEntretien.description}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button
                    onClick={handleCloseDetailDialog}
                    color="primary"
                    variant="contained"
                  >
                    Fermer
                  </Button>
                 
                   <Link to={`${currentEntretien.link}`}
                    color="primary"
                    variant="contained"
                  >
                    Participer
                  </Link>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default MesEntretiens;
