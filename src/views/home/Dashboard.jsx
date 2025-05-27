import React, { useState, useEffect, memo } from 'react';
import {
  getTotalJobOffers,
  getTotalApplications,
  getApplicationsPerJobOffer,
  getCandidatesGeographicalDistribution,
  getApplicationsByRecruiterStatus,
  getApplicationsByAddress,
  getAvailablePositionsPerRecruiter
} from '../../service/stats';
import administrateur from '../../service/administrateur';
import SnackbarAlert from '../../components/SnackbarAlert';

// Material UI imports
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  CardHeader,
  Divider,
  LinearProgress,
  CircularProgress,
  useTheme,
  List,
  ListItem,
  ListItemText,
  Tooltip as MuiTooltip,
  Button
} from '@mui/material';

// Material UI icons
import {
  WorkOutlined as JobIcon,
  DescriptionOutlined as ApplicationIcon,
  PieChartOutlined as ChartIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AssessmentOutlined as StatusIcon,
  MapOutlined as MapIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Recharts for data visualization
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  AreaChart,
  Area,
  Treemap,
  ComposedChart,
  Rectangle
} from 'recharts';

// Dashboard color palette
const COLOR_PALETTE = {
  // Neutral base colors
  background: '#f8f9fa',
  paper: '#ffffff',
  divider: '#e0e0e0',

  // Brand colors
  primary: '#3f51b5',    // Primary brand color (indigo)
  primaryLight: '#757de8',
  primaryDark: '#002984',

  // Accent colors for visualizations
  accent1: '#00b0ff',    // Bright blue
  accent2: '#7e57c2',    // Purple
  accent3: '#ffb300',    // Amber

  // Status colors
  success: '#4caf50',    // Green for positive/accepted
  successLight: '#81c784',
  error: '#f44336',      // Red for negative/rejected
  errorLight: '#e57373',
  warning: '#ff9800',    // Orange for warning/pending
  warningLight: '#ffb74d',

  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#ffffff'
};

// ajouter interpolation de couleur pour les barres
const interpolateColor = (color1, color2, factor) => {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
};

// fonction pour convertir une couleur hexadécimale en RGB
const hexToRgb = (hex) => {
  //  supprimer le caractère '#' si présent
  hex = hex.replace('#', '');

  // vérifier la longueur de la chaîne hexadécimale
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
};

const Dashboard = () => {
  const theme = useTheme();

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    totalJobOffers: 0,
    totalApplications: 0,
    applicationsPerJob: [],
    loading: true,
    error: null
  });

  // Pie chart data pour  recruteurs et candidats
  const [recruitersAndCandidatesData, setRecruitersAndCandidatesData] = useState({
    data: [],
    loading: true,
    error: null
  });

  // Geographical data (for Treemap)
  const [geographicalData, setGeographicalData] = useState({
    data: [],
    loading: true,
    error: null
  });

  // Application status data (for bar chart)
  const [applicationStatusData, setApplicationStatusData] = useState({
    data: [],
    loading: true,
    error: null
  });

  // Available positions per recruiter
  const [availablePositionsData, setAvailablePositionsData] = useState({
    data: [],
    loading: true,
    error: null
  });

 

  const [snackbar, setSnackbar] = useState({ // Snackbar state
    open: false,
    message: "",
    severity: "error"
  });

  useEffect(() => {
   // Function to fetch all dashboard data
    const fetchAllDashboardData = async () => {
      try {
        const [
          offersResponse,
          applicationsResponse,
          applicationsPerJobResponse,
          geographicalDistributionResponse,
          applicationStatusResponse,
          availablePositionsResponse
        ] = await Promise.all([
          getTotalJobOffers(),
          getTotalApplications(),
          getApplicationsPerJobOffer(),
          getCandidatesGeographicalDistribution(),
          getApplicationsByRecruiterStatus(),
          getAvailablePositionsPerRecruiter()
        ]);

        console.log('Geographical Distribution API Response:', geographicalDistributionResponse);

        // Total job offers
        const totalJobOffers = offersResponse.data?.total || 0;
        // Total applications
        const totalApplications = applicationsResponse.data?.total || 0;
        // Applications per job
        let applicationsPerJob = [];
        if (applicationsPerJobResponse.data && Array.isArray(applicationsPerJobResponse.data.data)) {
          applicationsPerJob = applicationsPerJobResponse.data.data;
        } else if (applicationsPerJobResponse.data && Array.isArray(applicationsPerJobResponse.data)) {
          applicationsPerJob = applicationsPerJobResponse.data;
        }

        setDashboardData({
          totalJobOffers,
          totalApplications,
          applicationsPerJob,
          loading: false,
          error: null
        });

        // Recruteurs and Candidats Pie Chart Data
        const [recruteurResponse, candidatResponse] = await Promise.all([
          administrateur.countRecreture(),
          administrateur.countCandidat()
        ]);
        const recruteurTotal = recruteurResponse.data?.total || 0;
        const candidatTotal = candidatResponse.data?.total || 0;
        setRecruitersAndCandidatesData({
          data: [
            { name: 'Recruteurs', value: recruteurTotal, color: COLOR_PALETTE.primary },
            { name: 'Candidats', value: candidatTotal, color: COLOR_PALETTE.accent2 }
          ],
          loading: false, error: null
        });

        // Process geographical data from API for Treemap
        let rawGeoDataArray = [];
        if (geographicalDistributionResponse.data) {
          const apiData = geographicalDistributionResponse.data.repartition || geographicalDistributionResponse.data;
          if (typeof apiData === 'object' && !Array.isArray(apiData)) {
            rawGeoDataArray = Object.entries(apiData).map(([region, count]) => ({
              adresse: region,
              count: count
            }));
          } else if (Array.isArray(apiData)) {
            rawGeoDataArray = apiData.map(item => ({
              adresse: item.region || item.adresse || 'Inconnu',
              count: item.nombre || item.count || 0
            }));
          }
        }
        console.log('Processed Raw Geo Data Array (for Treemap):', rawGeoDataArray);

        // Data for Treemap
        const treemapTotal = rawGeoDataArray.reduce((sum, item) => sum + (item.count || 0), 0);
        const transformedTreemapData = rawGeoDataArray.map(location => ({
          name: location.adresse || 'Inconnu',
          value: location.count || 0,
          percentage: treemapTotal > 0 ? ((location.count || 0) / treemapTotal * 100).toFixed(1) : 0
        }));
        setGeographicalData({ data: transformedTreemapData, loading: false, error: null });


        // Application Status Data
        let statusData = [];
        if (applicationStatusResponse.data && Array.isArray(applicationStatusResponse.data.results)) {
          statusData = applicationStatusResponse.data.results;
        } else if (applicationStatusResponse.data && Array.isArray(applicationStatusResponse.data)) {
          statusData = applicationStatusResponse.data;
        }
        const transformedStatusData = statusData.map(item => ({
          name: item.recruteur?.Nom || 'Inconnu',
          acceptées: item.acceptees || 0,
          rejetées: item.rejetees || 0,
          enAttente: item.enAttente || 0,
          total: (item.acceptees || 0) + (item.rejetees || 0) + (item.enAttente || 0)
        })).sort((a, b) => b.total - a.total).slice(0, 6);
        setApplicationStatusData({ data: transformedStatusData, loading: false, error: null });

        // Available Positions Data
        let positionsData = [];
        if (availablePositionsResponse.data && Array.isArray(availablePositionsResponse.data)) {
          positionsData = availablePositionsResponse.data
            .filter(item => item.nbOffres > 0)
            .sort((a, b) => b.nbOffres - a.nbOffres)
            .slice(0, 10);
        }
        setAvailablePositionsData({ data: positionsData, loading: false, error: null });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const errorMsg = 'Erreur lors du chargement des données';
        setDashboardData(prev => ({ ...prev, loading: false, error: errorMsg }));
        setRecruitersAndCandidatesData({ data: [], loading: false, error: errorMsg });
        setGeographicalData({ data: [], loading: false, error: errorMsg });
        setApplicationStatusData({ data: [], loading: false, error: errorMsg });
        setAvailablePositionsData({ data: [], loading: false, error: errorMsg });
        // setTunisiaMapData({ data: {}, loading: false, error: errorMsg });
      }
    };

    // Remove fetchGeoJson call
    // fetchGeoJson();
    fetchAllDashboardData();
  }, []);

  

  // Format application data for bar chart
  const getFormattedBarData = () => {
    if (!dashboardData.applicationsPerJob || !Array.isArray(dashboardData.applicationsPerJob)) {
      return [];
    }
    return [...dashboardData.applicationsPerJob]
      .sort((a, b) => (b.nbCandidatures || 0) - (a.nbCandidatures || 0))
      .slice(0, 10)
      .map(job => ({
        name: job.titre || 'Poste sans titre',
        candidatures: job.nbCandidatures || 0
      }));
  };

  const formattedBarData = getFormattedBarData();

  // Calculate min and max values for the gradient
  const minCandidatures = Math.min(...formattedBarData.map(item => item.candidatures));
  const maxCandidatures = Math.max(...formattedBarData.map(item => item.candidatures));

  // Generate an array of colors for each bar based on its value
  const getBarColor = (value) => {
    // If all values are the same, return a default color
    if (minCandidatures === maxCandidatures) {
      return COLOR_PALETTE.accent1;
    }

    // Calculate the percentage of value between min and max
    const percentage = (value - minCandidatures) / (maxCandidatures - minCandidatures);

    // Start color (lighter, for minimum values)
    const startColor = hexToRgb(COLOR_PALETTE.accent1);

    // End color (darker, for maximum values)
    const endColor = hexToRgb(COLOR_PALETTE.primary);

    // Interpolate between the colors
    return interpolateColor(startColor, endColor, percentage);
  };

  // Update loading and error checks to remove Tunisia map references
  const isLoading = dashboardData.loading ||
    recruitersAndCandidatesData.loading ||
    geographicalData.loading ||
    applicationStatusData.loading ||
    availablePositionsData.loading;

  const mainError = dashboardData.error ||
    recruitersAndCandidatesData.error ||
    geographicalData.error ||
    applicationStatusData.error ||
    availablePositionsData.error;

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message: message || 'Une erreur est survenue',
      severity: 'error'
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress style={{ color: COLOR_PALETTE.primary }} />
      </Box>
    );
  }

  if (mainError) {
    showError(typeof mainError === 'string' ? mainError : 'Une erreur est survenue');
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <Typography variant="h6" color="error" align="center" gutterBottom>
          Une erreur est survenue
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          Impossible de charger les données du tableau de bord.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          <RefreshIcon sx={{ mr: 1 }} />
          Rafraîchir la page
        </Button>
      </Box>
    );
  }

  // Custom treemap content renderer
  const CustomTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index, name, value, percentage } = props;

    // Calculate color based on value
    const getColorForValue = (val) => {
      // Get min and max from the data
      const values = geographicalData.data.map(item => item.value || 0);
      const min = Math.min(...values);
      const max = Math.max(...values);

      // If all values are the same, return a default color
      if (min === max || !val) {
        return COLOR_PALETTE.accent2;
      }

      // Calculate percentage (0-1) of this value between min and max
      const factor = (val - min) / (max - min);

      // Interpolate between light accent and dark accent
      const startColor = hexToRgb(COLOR_PALETTE.primaryLight);
      const endColor = hexToRgb(COLOR_PALETTE.primaryDark);

      // Mix the colors based on factor
      const r = Math.round(startColor[0] + factor * (endColor[0] - startColor[0]));
      const g = Math.round(startColor[1] + factor * (endColor[1] - startColor[1]));
      const b = Math.round(startColor[2] + factor * (endColor[2] - startColor[2]));

      return `rgba(${r}, ${g}, ${b}, ${0.7 + factor * 0.3})`;
    };

    return (
      <g>
        <Rectangle
          x={x} y={y} width={width} height={height}
          style={{
            fill: depth < 2
              ? getColorForValue(value)
              : 'transparent',
            stroke: '#fff', strokeWidth: 2 / (depth + 1e-10), strokeOpacity: 1 / (depth + 1e-10),
          }} />
        {width > 70 && height > 30 && (
          <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
            {name}
          </text>
        )}
        {width > 70 && height > 50 && (
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={10}>
            {value} ({percentage}%)
          </text>
        )}
      </g>
    );
  };

  
  // Common card styles
  const cardStyles = {
    p: 3,
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLOR_PALETTE.paper,
    color: COLOR_PALETTE.textPrimary,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: 4,
        mb: 6,
        px: { xs: 2, sm: 4 },
        backgroundColor: COLOR_PALETTE.background,
        minHeight: '100vh',
        pt: 2
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight="bold"
        color={COLOR_PALETTE.primary}
        sx={{ mb: 4, textAlign: 'center', borderBottom: `2px solid ${COLOR_PALETTE.primary}`, pb: 2 }}
      >
        Tableau de bord RecruitEase
      </Typography>

      {/* First Row - KPI Cards with percentage widths and centered */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5, width: '100%' }}>
        <Grid container spacing={4} sx={{ width: '100%' }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Card elevation={3} sx={{
              width: '100%',
              background: `linear-gradient(135deg, ${COLOR_PALETTE.primaryLight} 0%, ${COLOR_PALETTE.primary} 100%)`,
              ...cardStyles,
              color: COLOR_PALETTE.textLight
            }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <JobIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" component="div" color="white" gutterBottom fontWeight="medium">
                      Nombre total de postes
                    </Typography>
                    <Typography variant="h3" component="div" color="white" fontWeight="bold">
                      {dashboardData.totalJobOffers}
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Offres d'emploi actives
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>





          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Card elevation={3} sx={{
              width: '100%',
              background: `linear-gradient(135deg, ${COLOR_PALETTE.accent1} 0%, ${COLOR_PALETTE.accent2} 100%)`,
              ...cardStyles,
              color: COLOR_PALETTE.textLight
            }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ApplicationIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" component="div" color="white" gutterBottom fontWeight="medium">
                      Nombre total de candidatures
                    </Typography>
                    <Typography variant="h3" component="div" color="white" fontWeight="bold">
                      {dashboardData.totalApplications}
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Candidatures soumises
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>




      {/* Second Row - Répartition des Utilisateurs and Répartition géographique des candidats */}
      <Grid container spacing={4} sx={{ mb: 5, width: '100%', display: 'flex', flexWrap: 'nowrap' }}>
        {/* Pie Chart - Répartition des Utilisateurs */}
        <Grid item xs={6} sx={{ width: '50%', flexShrink: 0 }}>
          <Paper elevation={3} sx={cardStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ChartIcon sx={{ mr: 1, color: COLOR_PALETTE.primary }} />
              <Typography variant="h6" component="h2" fontWeight="medium" color={COLOR_PALETTE.textPrimary}>
                Répartition des Utilisateurs
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, borderColor: COLOR_PALETTE.divider }} />
            <Box sx={{ height: 350, mt: 4 }}>
              {recruitersAndCandidatesData.data.length === 0 ? (
                <Typography variant="body2" color={COLOR_PALETTE.textSecondary} align="center">
                  Aucune donnée disponible
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recruitersAndCandidatesData.data}
                      cx="50%" cy="50%" innerRadius={80} outerRadius={120}
                      paddingAngle={5} dataKey="value" labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {recruitersAndCandidatesData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value} utilisateurs`, name]} />
                    <RechartsLegend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>









        {/* Treemap - Répartition géographique des candidats */}
        <Grid item xs={6} sx={{ width: '50%', flexShrink: 0 }}>
          <Paper elevation={3} sx={cardStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: COLOR_PALETTE.primary }} />
              <Typography variant="h6" component="h2" fontWeight="medium" color={COLOR_PALETTE.textPrimary}>
                Répartition géographique des candidats
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, borderColor: COLOR_PALETTE.divider }} />
            {geographicalData.data.length === 0 ? (
              <Typography variant="body2" color={COLOR_PALETTE.textSecondary} align="center">
                Aucune donnée géographique disponible
              </Typography>
            ) : (
              <Box sx={{ height: 350, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={geographicalData.data}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomTreemapContent />}
                  >
                    <RechartsTooltip
                      formatter={(value, name, props) => [
                        `${value} candidats (${props.payload.percentage}%)`,
                        props.payload.name
                      ]}
                      labelFormatter={() => ''} />
                  </Treemap>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>




      {/* Third Row - Postes disponibles par recruteur and Offres les plus demandées */}
      <Grid container spacing={4} sx={{ mb: 5, width: '100%', display: 'flex', flexWrap: 'nowrap' }}>
        {/* Available Positions Per Recruiter */}
        <Grid item xs={6} sx={{ width: '50%', flexShrink: 0 }}>
          <Paper elevation={3} sx={cardStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <JobIcon sx={{ mr: 1, color: COLOR_PALETTE.primary }} />
              <Typography variant="h6" component="h2" fontWeight="medium" color={COLOR_PALETTE.textPrimary}>
                Postes disponibles par recruteur (Top 10)
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, borderColor: COLOR_PALETTE.divider }} />
            {availablePositionsData.data.length === 0 ? (
              <Typography variant="body2" color={COLOR_PALETTE.textSecondary} align="center">
                Aucune donnée disponible
              </Typography>
            ) : (
              <Box sx={{ height: 350, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={availablePositionsData.data} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLOR_PALETTE.divider} />
                    <XAxis type="number" stroke={COLOR_PALETTE.textSecondary} />
                    <YAxis
                      dataKey="nom"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      stroke={COLOR_PALETTE.textSecondary}
                    />
                    <RechartsTooltip formatter={(value) => [`${value} postes`, 'Postes disponibles']}
                      labelFormatter={(label) => `Recruteur: ${label}`} />
                    <Bar dataKey="nbOffres" name="Postes disponibles" radius={[0, 4, 4, 0]}>
                      {availablePositionsData.data.map((entry, index) => {
                        const minVal = Math.min(...availablePositionsData.data.map(item => item.nbOffres));
                        const maxVal = Math.max(...availablePositionsData.data.map(item => item.nbOffres));
                        return <Cell key={`cell-${index}`} fill={getBarColor(entry.nbOffres)} />;
                      })}
                      <LabelList dataKey="nbOffres" position="right" fill={COLOR_PALETTE.textPrimary} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>



        {/* Bar Chart - Nombre de candidatures par poste */}
        <Grid item xs={6} sx={{ width: '50%', flexShrink: 0 }}>
          <Paper elevation={3} sx={cardStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: COLOR_PALETTE.primary }} />
              <Typography variant="h6" component="h2" fontWeight="medium" color={COLOR_PALETTE.textPrimary}>
                Nombre de candidatures par poste
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, borderColor: COLOR_PALETTE.divider }} />
            {formattedBarData.length === 0 ? (
              <Typography variant="body2" color={COLOR_PALETTE.textSecondary} align="center">
                Aucune donnée disponible
              </Typography>
            ) : (
              <Box sx={{ height: 350, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={formattedBarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLOR_PALETTE.divider} />
                    <XAxis type="number" stroke={COLOR_PALETTE.textSecondary} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fill: COLOR_PALETTE.textSecondary }}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      stroke={COLOR_PALETTE.textSecondary}
                    />
                    <RechartsTooltip formatter={(value, name, props) => [`${value} candidatures`, props.payload.name]}
                      labelFormatter={() => ''} />
                    <Bar dataKey="candidatures" radius={[0, 4, 4, 0]}>
                      {formattedBarData.map((entry, index) => {
                        const minVal = Math.min(...formattedBarData.map(item => item.candidatures));
                        const maxVal = Math.max(...formattedBarData.map(item => item.candidatures));
                        return <Cell key={`cell-${index}`} fill={getBarColor(entry.candidatures)} />;
                      })}
                      <LabelList dataKey="candidatures" position="right" fill={COLOR_PALETTE.textPrimary} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>




      {/* Fourth Row - Display application status data as Répartition géographique des candidats */}
      <Grid container spacing={4} sx={{ mb: 5, width: '100%' }}>
        <Grid item xs={12} sx={{ width: '100%' }}>
          <Paper elevation={3} sx={cardStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MapIcon sx={{ mr: 1, color: COLOR_PALETTE.primary }} />
              <Typography variant="h6" component="h2" fontWeight="medium" color={COLOR_PALETTE.textPrimary}>
            Nombre de candidatures acceptées, rejetées et en attente par recruteur
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, borderColor: COLOR_PALETTE.divider }} />
            {applicationStatusData.data.length === 0 ? (
              <Typography variant="body2" color={COLOR_PALETTE.textSecondary} align="center">
                Aucune donnée disponible
              </Typography>
            ) : (
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationStatusData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLOR_PALETTE.divider} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value} stroke={COLOR_PALETTE.textSecondary} />
                    <YAxis label={{ value: 'Candidats', angle: -90, position: 'insideLeft', offset: -5, fill: COLOR_PALETTE.textSecondary }} stroke={COLOR_PALETTE.textSecondary} />
                    <RechartsTooltip formatter={(value, name) => {
                      const status = { acceptées: 'Acceptés', rejetées: 'Rejetés', enAttente: 'En attente' };
                      return [`${value} candidats`, status[name] || name];
                    }} />
                    <RechartsLegend />
                    <Bar dataKey="acceptées" stackId="a" name="Acceptés" radius={[4, 4, 0, 0]} fill={COLOR_PALETTE.success} />
                    <Bar dataKey="rejetées" stackId="a" name="Rejetés" fill={COLOR_PALETTE.error} />
                    <Bar dataKey="enAttente" stackId="a" name="En attente" radius={[0, 0, 4, 4]} fill={COLOR_PALETTE.warning} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Container>
  );
};

export default Dashboard; 