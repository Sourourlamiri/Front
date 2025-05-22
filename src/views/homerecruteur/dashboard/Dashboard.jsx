import React, { useState, useEffect } from "react";
import apiRecruteurinterface from "../../../service/apiRecruteurinterface";

// Material UI imports
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  useTheme,
  Button,
  Tooltip as MuiTooltip,
} from "@mui/material";

// Material UI Icons
import {
  WorkOutlined as JobIcon,
  DescriptionOutlined as ApplicationIcon,
  EventNoteOutlined as InterviewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Recharts for data visualization
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Dashboard color palette - matches admin dashboard
const COLOR_PALETTE = {
  // Neutral base colors
  background: "#f8f9fa",
  paper: "#ffffff",
  divider: "#e0e0e0",

  // Brand colors
  primary: "#3f51b5", // Primary brand color (indigo)
  primaryLight: "#757de8",
  primaryDark: "#002984",

  // Accent colors for visualizations
  accent1: "#00b0ff", // Bright blue
  accent2: "#7e57c2", // Purple
  accent3: "#ffb300", // Amber

  // Status colors
  success: "#4caf50", // Green for positive/accepted
  successLight: "#81c784",
  error: "#f44336", // Red for negative/rejected
  errorLight: "#e57373",
  warning: "#ff9800", // Orange for warning/pending
  warningLight: "#ffb74d",

  // Text colors
  textPrimary: "#212121",
  textSecondary: "#757575",
  textLight: "#ffffff",
};

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    jobsWithApplications: [],
    interviewsByDate: [],
    mostRequestedJobs: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
      const recruteurId = utilisateur?.utilisateur?._id;

      if (!recruteurId) {
        console.error("ID recruteur non trouvé");
        setLoading(false);
        return;
      }

      const response = await apiRecruteurinterface.getRecruteur(recruteurId);
      const recruteurData = response.data.getRecruteur;

      // Extract data for statistics
      const offres = recruteurData.Offre || [];
      const entretiens = recruteurData.entretien || [];

      // Process data for charts
      const jobsWithApplications = offres
        .map((offre) => ({
          name: offre.titre,
          candidatures: offre.Candidature?.length || 0,
        }))
        .filter((job) => job.candidatures > 0);

      // Group interviews by date
      const interviewsByDate = processInterviewsByDate(entretiens);

      // Find most requested jobs
      const mostRequestedJobs = [...jobsWithApplications]
        .sort((a, b) => b.candidatures - a.candidatures)
        .slice(0, 5);

      setStats({
        totalJobs: offres.length,
        totalApplications: offres.reduce(
          (total, offre) => total + (offre.Candidature?.length || 0),
          0
        ),
        totalInterviews: entretiens.length,
        jobsWithApplications,
        interviewsByDate,
        mostRequestedJobs,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données du tableau de bord:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Process interview data by date
  const processInterviewsByDate = (entretiens) => {
    // Create a map of dates to count
    const dateMap = new Map();

    entretiens.forEach((entretien) => {
      if (!entretien.date) return;

      const date = new Date(entretien.date).toISOString().split("T")[0];
      if (dateMap.has(date)) {
        dateMap.set(date, dateMap.get(date) + 1);
      } else {
        dateMap.set(date, 1);
      }
    });

    // Convert to array, sort by date, then format for display
    const sortedDates = Array.from(dateMap.keys()).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const result = sortedDates.map((date) => {
      const count = dateMap.get(date);
      const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
      return {
        date: date, // keep original date for reference
        name: formattedDate,
        entretiens: count,
      };
    });

    return result;
  };

  // Function to get bar color based on value
  const getBarColor = (value, max) => {
    if (!max) return COLOR_PALETTE.primary;
    const ratio = value / max;

    if (ratio < 0.33) return COLOR_PALETTE.primary;
    if (ratio < 0.66) return COLOR_PALETTE.accent2;
    return COLOR_PALETTE.accent3;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: COLOR_PALETTE.background,
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h4" color="textPrimary" fontWeight="medium">
            Tableau de Bord Recruteur
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            color="primary"
            onClick={fetchDashboardData}
            size="small"
          >
            Actualiser
          </Button>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={1}
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: `${COLOR_PALETTE.primaryLight}20`,
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                    }}
                  >
                    <JobIcon sx={{ color: COLOR_PALETTE.primary }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Postes Publiés
                    </Typography>
                    <Typography
                      variant="h4"
                      color="textPrimary"
                      fontWeight="bold"
                    >
                      {stats.totalJobs}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={1}
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: `${COLOR_PALETTE.successLight}20`,
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                    }}
                  >
                    <ApplicationIcon sx={{ color: COLOR_PALETTE.success }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Candidatures Reçues
                    </Typography>
                    <Typography
                      variant="h4"
                      color="textPrimary"
                      fontWeight="bold"
                    >
                      {stats.totalApplications}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={1}
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      backgroundColor: `${COLOR_PALETTE.warningLight}20`,
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                    }}
                  >
                    <InterviewIcon sx={{ color: COLOR_PALETTE.warning }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Entretiens Programmés
                    </Typography>
                    <Typography
                      variant="h4"
                      color="textPrimary"
                      fontWeight="bold"
                    >
                      {stats.totalInterviews}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts - Flex Layout */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          {/* Applications by Job Position */}
          <Box sx={{ flex: "1 1 500px", minWidth: 0 }}>
            <Card
              elevation={1}
              sx={{
                height: "100%",
                transition: "all 0.2s ease-in-out",
                "&:hover": { boxShadow: 4 },
              }}
            >
              <CardHeader
                title="Candidatures par Poste"
                titleTypographyProps={{ variant: "h6" }}
                sx={{
                  borderBottom: `1px solid ${COLOR_PALETTE.divider}`,
                  pb: 1,
                }}
              />
              <CardContent sx={{ p: 2 }}>
                {stats.jobsWithApplications.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={stats.jobsWithApplications}
                      margin={{ top: 5, right: 30, left: 5, bottom: 60 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={COLOR_PALETTE.divider}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                        tick={{
                          fill: COLOR_PALETTE.textSecondary,
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax + 1"]}
                        tick={{
                          fill: COLOR_PALETTE.textSecondary,
                          fontSize: 12,
                        }}
                        width={30}
                      />
                      <RechartsTooltip
                        formatter={(value) => [
                          `${value} candidature(s)`,
                          "Reçues",
                        ]}
                        labelFormatter={(name) => `Poste: ${name}`}
                        contentStyle={{
                          backgroundColor: COLOR_PALETTE.paper,
                          border: `1px solid ${COLOR_PALETTE.divider}`,
                          borderRadius: "4px",
                        }}
                      />
                      <RechartsLegend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="candidatures"
                        fill={COLOR_PALETTE.primary}
                        name="Candidatures"
                        animationDuration={1500}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 320,
                      color: COLOR_PALETTE.textSecondary,
                    }}
                  >
                    <Typography variant="body2">
                      Aucune candidature disponible
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Scheduled Interviews */}
          <Box sx={{ flex: "1 1 500px", minWidth: 0 }}>
            <Card
              elevation={1}
              sx={{
                height: "100%",
                transition: "all 0.2s ease-in-out",
                "&:hover": { boxShadow: 4 },
              }}
            >
              <CardHeader
                title="Entretiens Programmés"
                titleTypographyProps={{ variant: "h6" }}
                sx={{
                  borderBottom: `1px solid ${COLOR_PALETTE.divider}`,
                  pb: 1,
                }}
              />
              <CardContent sx={{ p: 2 }}>
                {stats.interviewsByDate.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={stats.interviewsByDate}
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={COLOR_PALETTE.divider}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: COLOR_PALETTE.textSecondary,
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax + 1"]}
                        tick={{
                          fill: COLOR_PALETTE.textSecondary,
                          fontSize: 12,
                        }}
                        width={30}
                      />
                      <RechartsTooltip
                        formatter={(value) => [
                          `${value} entretien(s)`,
                          "Programmés",
                        ]}
                        labelFormatter={(name) => `Date: ${name}`}
                        contentStyle={{
                          backgroundColor: COLOR_PALETTE.paper,
                          border: `1px solid ${COLOR_PALETTE.divider}`,
                          borderRadius: "4px",
                        }}
                      />
                      <RechartsLegend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="entretiens"
                        stroke={COLOR_PALETTE.accent1}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Entretiens"
                        isAnimationActive={true}
                        dot={{
                          stroke: COLOR_PALETTE.accent1,
                          strokeWidth: 2,
                          fill: COLOR_PALETTE.paper,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 320,
                      color: COLOR_PALETTE.textSecondary,
                    }}
                  >
                    <Typography variant="body2">
                      Aucun entretien programmé
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Most Requested Jobs - Full Width */}
        <Box sx={{ mb: 4 }}>
          <Card
            elevation={1}
            sx={{
              transition: "all 0.2s ease-in-out",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardHeader
              title="Offres les Plus Demandée"
              titleTypographyProps={{ variant: "h6" }}
              sx={{
                borderBottom: `1px solid ${COLOR_PALETTE.divider}`,
                pb: 1,
              }}
            />
            <CardContent sx={{ p: 2 }}>
              {stats.mostRequestedJobs.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={stats.mostRequestedJobs}
                    margin={{ top: 5, right: 30, left: 5, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLOR_PALETTE.divider}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{
                        fill: COLOR_PALETTE.textSecondary,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, "dataMax + 1"]}
                      tick={{
                        fill: COLOR_PALETTE.textSecondary,
                        fontSize: 12,
                      }}
                      width={30}
                    />
                    <RechartsTooltip
                      formatter={(value) => [
                        `${value} candidature(s)`,
                        "Reçues",
                      ]}
                      labelFormatter={(name) => `Offre: ${name}`}
                      contentStyle={{
                        backgroundColor: COLOR_PALETTE.paper,
                        border: `1px solid ${COLOR_PALETTE.divider}`,
                        borderRadius: "4px",
                      }}
                    />
                    <RechartsLegend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="candidatures"
                      name="Candidatures"
                      animationDuration={1500}
                      radius={[4, 4, 0, 0]}
                    >
                      {stats.mostRequestedJobs.map((entry, index) => {
                        const maxValue = Math.max(
                          ...stats.mostRequestedJobs.map(
                            (job) => job.candidatures
                          )
                        );
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.candidatures, maxValue)}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 320,
                    color: COLOR_PALETTE.textSecondary,
                  }}
                >
                  <Typography variant="body2">
                    Aucune donnée disponible
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
