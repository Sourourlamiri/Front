import axios from "axios";

const axiosContext = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// ajout d'un intercepteur de requête pour ajouter le token d'accès
// Add request interceptor to include access token in headers
axiosContext.interceptors.request.use(
    (config) => {
        // recupérer le token d'accès depuis le stockage local
        // Retrieve access token from local storage
        const token = localStorage.getItem('accessToken');
        
        // si le token existe, l'ajouter aux en-têtes de la requête
        // If token exists, add it to the request headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ajout d'un intercepteur de réponse pour gérer les erreurs
axiosContext.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle errors globally
        if (error.response && error.response.status === 401) {
            console.log("Auth error: Unauthorized request (401)", error.config?.url);
            
            // si l'erreur est 401, supprimer le token d'accès et rediriger vers la page de connexion
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('utilisateur');
            
            //rediriger vers la page de connexion
            if (window.location.pathname !== '/login') {
                const currentPath = window.location.pathname;
                console.log("Redirecting to login from:", currentPath);
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
        } else if (error.response) {
            // login error: The request was made and the server responded with a status code
            console.error(`API Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("API Error: No response received", error.request);
        } else {
            // Something happened in setting up the request
            console.error("API Error:", error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosContext;
