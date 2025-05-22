import axiosContext from './axiosContext';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const LEGACY_USER_KEY = 'utilisateur'; // Old storage key

// Helper functions for token management
const setTokens = (accessToken, user) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // For backward compatibility during migration, also store in old format
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

// Migrate from old format to new format if needed
const migrateFromLegacyFormat = () => {
  try {
    // Check if we need to migrate from old format
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
        
        // Migrate to new format
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

// Get current user data
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

// Initialize auth - should be called when app starts
const initAuth = () => {
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