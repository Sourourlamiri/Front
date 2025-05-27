import axiosContext from './axiosContext';

// Token et utilisateur keys pour localStorage
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const LEGACY_USER_KEY = 'utilisateur'; // anncienne clé pour compatibilité ascendante

// Fonctions pour gérer les tokens et l'utilisateur dans localStorage
const setTokens = (accessToken, user) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // Format legacy pour compatibilité ascendante
  // Si l'ancien format existe, on le met à jour
  const legacyFormat = {
    accessToken,
    utilisateur: user
  };
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(legacyFormat));
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY); // Also clear legacy format
};

//pour migrer de l'ancien format vers le nouveau
const migrateFromLegacyFormat = () => {
  try {
    // verifier si l'ancien format existe
    // et si le nouveau format n'existe pas
    const legacyData = localStorage.getItem(LEGACY_USER_KEY);
    const newFormatToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    if (legacyData && !newFormatToken) {
      const parsedData = JSON.parse(legacyData);
      if (parsedData.accessToken && parsedData.utilisateur) {
        const userData = parsedData.utilisateur;
        
        // Ensure role field exists (could be 'role' or 'rôle')
        if (!userData.rôle && userData.role) {
          userData.rôle = userData.role;
        }
        
        // modifier le format pour le nouveau système
        localStorage.setItem(ACCESS_TOKEN_KEY, parsedData.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        console.log('Migrated from legacy authentication format');
      }
    }
  } catch (error) {
    console.error('Error during auth format migration:', error);
    // On error, it's safer to clear everything to prevent inconsistent state
    clearTokens();
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  migrateFromLegacyFormat(); // Check for legacy format
  
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const user = JSON.parse(localStorage.getItem(USER_KEY));
  return !!token && !!user && !!user._id;
};

// recupérer l'utilisateur actuel
const getCurrentUser = () => {
  migrateFromLegacyFormat(); // Check for legacy format
  
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch (error) {
    clearTokens();
    return null;
  }
};

// Get access token
const getAccessToken = () => {
  migrateFromLegacyFormat(); // Check for legacy format
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Login user
const login = async (email, password) => {
  try {
    const response = await axiosContext.post('/auth/signin', {
      Email: email,
      MotDePasse: password
    });
    
    const { accessToken, utilisateur } = response.data;
    
    // Ensure role field exists with consistent naming (use 'rôle' as standard)
    if (!utilisateur.rôle && utilisateur.role) {
      utilisateur.rôle = utilisateur.role;
    }
    
    setTokens(accessToken, utilisateur);
    
    // Configure axios to use the token for future requests
    axiosContext.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    return { success: true, user: utilisateur };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Erreur lors de la connexion'
    };
  }
};

// Logout user
const logout = () => {
  // Clear all localStorage
  localStorage.clear();
  
  // Remove auth header from axios
  delete axiosContext.defaults.headers.common['Authorization'];
  
  // Return success with homeVC route for redirection
  return { success: true, redirectTo: '/homeVC' };
};

// Initialize authentication
const initAuth = () => {  // ki t3awed ta3mil login ynadi initAuth bach y3awd y7ot les headers w ya3rfik enty chkoun .
  migrateFromLegacyFormat(); // Migrate from old format if needed
  
  const token = getAccessToken();
  if (token) {
    axiosContext.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getAccessToken,
  initAuth
}; 