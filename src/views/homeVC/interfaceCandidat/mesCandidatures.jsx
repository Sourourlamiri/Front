import React, { useEffect, useState } from "react";
import Header from "../../../componentsVC/header";
import Footer from "../../../componentsVC/footer";
import axios from "axios";
import apiCandidature from "../../../service/apiCandidature";
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
} from "@mui/material";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiFilter,
  FiEye,
  FiTrash2,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiClock as FiClockCircle,
  FiFile,
} from "react-icons/fi";

const MesCandidatures = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [filteredCandidatures, setFilteredCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCandidatureId, setCurrentCandidatureId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
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
      apiCandidature
        .getCandidaturesByCandidat(candidatId)
        .then((response) => {
          const candidatureData = response.data.getCandidat.Candidature || [];
          setCandidatures(candidatureData);
          setFilteredCandidatures(candidatureData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des candidatures:", error);
          setError(
            "Impossible de charger vos candidatures. Veuillez réessayer plus tard."
          );
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError("Session utilisateur non trouvée. Veuillez vous reconnecter.");
    }
  }, [candidatId]);

  useEffect(() => {
    let result = [...candidatures];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((candidature) =>
        candidature?.Offre?.some(
          (offre) => offre?.statut?.toLowerCase() === statusFilter
        )
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((candidature) =>
        candidature?.Offre?.some(
          (offre) =>
            offre?.titre?.toLowerCase().includes(query) ||
            offre?.description?.toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    result = result.sort((a, b) => {
      // Extract the first offer from each candidature for comparison
      const offreA = a?.Offre?.[0] || {};
      const offreB = b?.Offre?.[0] || {};

      switch (sortBy) {
        case "date_asc":
          return (
            new Date(offreA.createdAt || 0) - new Date(offreB.createdAt || 0)
          );
        case "date_desc":
          return (
            new Date(offreB.createdAt || 0) - new Date(offreA.createdAt || 0)
          );
        case "title_asc":
          return (offreA.titre || "").localeCompare(offreB.titre || "");
        case "title_desc":
          return (offreB.titre || "").localeCompare(offreA.titre || "");
        default:
          return 0;
      }
    });

    setFilteredCandidatures(result);
  }, [candidatures, statusFilter, searchQuery, sortBy]);

  const handleOpenDeleteDialog = (id) => {
    setCurrentCandidatureId(id);
    setOpenDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDialog(false);
    setCurrentCandidatureId(null);
  };

  const supprimerCandidature = () => {
    if (currentCandidatureId) {
      apiCandidature
        .deleteCandidature(currentCandidatureId)
        .then((response) => {
          setCandidatures((prev) =>
            prev.filter((c) => c._id !== currentCandidatureId)
          );
          handleCloseDeleteDialog();
          setSnackbar({
            open: true,
            message: "Candidature supprimée avec succès",
            severity: "success",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression :", error);
          setSnackbar({
            open: true,
            message: "Erreur lors de la suppression de la candidature",
            severity: "error",
          });
          handleCloseDeleteDialog();
        });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusChip = (status) => {
    let color, icon;
    switch (status?.toLowerCase()) {
      case "en attente":
        color = "warning";
        icon = <FiClock size={16} />;
        break;
      case "rejetée":
        color = "error";
        icon = <FiAlertCircle size={16} />;
        break;
      case "acceptée":
        color = "success";
        icon = <FiCheckCircle size={16} />;
        break;
      default:
        color = "default";
        icon = <FiClockCircle size={16} />;
    }

    return (
      <Chip
        icon={icon}
        label={status || "Non défini"}
        color={color}
        size="small"
        sx={{ fontWeight: 500, borderRadius: "12px" }}
      />
    );
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSortBy("date_desc");
  };

  // Function to get date difference in days
  const getDaysDifference = (dateString) => {
    const today = new Date();
    const expirationDate = new Date(dateString);
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get expiration status for styling
  const getExpirationStatus = (expirationDate) => {
    const days = getDaysDifference(expirationDate);
    if (days < 0) return { text: "Expirée", color: "text.disabled" };
    if (days < 3)
      return {
        text: `Expire dans ${days} jour${days > 1 ? "s" : ""}`,
        color: "error.main",
      };
    if (days < 7)
      return { text: `Expire dans ${days} jours`, color: "warning.main" };
    return { text: `Expire dans ${days} jours`, color: "success.main" };
  };

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Page Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            background: "linear-gradient(135deg, #6d5bba 0%, #8b5fbf 100%)",
            color: "white",
          }}
        ></Paper>

        {/* Filters and Search */}
        <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Statut"
                  startAdornment={
                    <InputAdornment position="start">
                      <FiFilter size={16} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="en attente">En attente</MenuItem>
                  <MenuItem value="acceptée">Acceptée</MenuItem>
                  <MenuItem value="rejetée">Rejetée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                >
                  <MenuItem value="date_desc">Date (plus récente)</MenuItem>
                  <MenuItem value="date_asc">Date (plus ancienne)</MenuItem>
                  <MenuItem value="title_asc">Titre (A-Z)</MenuItem>
                  <MenuItem value="title_desc">Titre (Z-A)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Rechercher une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiSearch size={16} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={resetFilters}
                disabled={
                  statusFilter === "all" &&
                  !searchQuery &&
                  sortBy === "date_desc"
                }
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Main Content */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
          >
            <Typography color="error" variant="h6" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Réessayer
            </Button>
          </Paper>
        ) : (
          <>
            {filteredCandidatures.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: 2,
                  textAlign: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiBriefcase
                    size={60}
                    style={{
                      opacity: 0.6,
                      color: "#6d5bba",
                    }}
                  />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="500">
                  Aucune candidature trouvée
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {searchQuery || statusFilter !== "all"
                    ? "Aucune candidature ne correspond à vos critères de recherche."
                    : "Vous n'avez pas encore postulé à des offres d'emploi."}
                </Typography>
                {(searchQuery || statusFilter !== "all") && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={resetFilters}
                    sx={{ mt: 1 }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
                {!searchQuery && statusFilter === "all" && (
                  <Button
                    variant="contained"
                    color="primary"
                    href="/offre"
                    sx={{ mt: 1 }}
                  >
                    Découvrir les offres
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredCandidatures.map((candidature) =>
                  candidature?.Offre?.map((offre, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          borderRadius: 2,
                          "&:hover": {
                            transform: "translateY(-5px)",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 0,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Card Header with status */}
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor:
                                candidature?.statut?.toLowerCase() ===
                                "acceptée"
                                  ? "rgba(76, 175, 80, 0.08)"
                                  : candidature?.statut?.toLowerCase() ===
                                    "rejetée"
                                  ? "rgba(244, 67, 54, 0.08)"
                                  : "rgba(255, 152, 0, 0.08)",
                              borderTopLeftRadius: 8,
                              borderTopRightRadius: 8,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {getStatusChip(candidature?.statut)}
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {candidature.Cv && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  title="Voir le CV"
                                  onClick={() =>
                                    window.open(
                                    `${process.env.REACT_APP_BACKEND_URL}/cv/${candidature.Cv}`,
                                      "_blank"
                                    )
                                  }
                                  sx={{ mr: 1 }}
                                >
                                  <FiFile size={14} />
                                </IconButton>
                              )}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Postulée le{" "}
                                {new Date(
                                  offre?.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Card Body */}
                          <Box sx={{ p: 2, flex: 1 }}>
                            <Typography
                              variant="h6"
                              component="h2"
                              gutterBottom
                            >
                              {offre?.titre || "Sans titre"}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                mb: 2,
                                height: "40px",
                              }}
                            >
                              {offre?.description?.substring(0, 100) ||
                                "Aucune description disponible"}
                              {offre?.description?.length > 100 ? "..." : ""}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <FiCalendar
                                size={16}
                                style={{ marginRight: 8, opacity: 0.7 }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: getExpirationStatus(
                                    offre?.date_expiration
                                  ).color,
                                }}
                              >
                                {
                                  getExpirationStatus(offre?.date_expiration)
                                    .text
                                }
                              </Typography>
                            </Box>
                          </Box>

                          {/* Card Actions */}
                          <Divider />
                          <Box
                            sx={{
                              p: 2,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Button
                              startIcon={<FiTrash2 />}
                              color="error"
                              onClick={() =>
                                handleOpenDeleteDialog(candidature?._id)
                              }
                              size="small"
                              variant="text"
                            >
                              Retirer
                            </Button>

                            <Button
                              component="a"
                              href={`/Offre/${offre?._id}`}
                              startIcon={<FiEye />}
                              color="primary"
                              size="small"
                              variant="contained"
                              disableElevation
                              sx={{ borderRadius: "20px" }}
                            >
                              Voir l'offre
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        PaperProps={{
          elevation: 0,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir retirer cette candidature ? Cette action
            est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button
            onClick={supprimerCandidature}
            color="error"
            variant="contained"
            disableElevation
          >
            Supprimer
          </Button>
        </DialogActions>
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
          variant="filled"
          elevation={6}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};

export default MesCandidatures;
