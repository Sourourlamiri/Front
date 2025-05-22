import axios from "axios";

const axiosContext = axios.create({
    baseURL: "http://localhost:5002",
    headers: {
        "Content-Type": "application/json"
    }
});

// Add request interceptor to add token to requests
axiosContext.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');
        
        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
axiosContext.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            console.log("Auth error: Unauthorized request (401)", error.config?.url);
            
            // Clear tokens as they are invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('utilisateur');
            
            // Redirect to login with return URL
            if (window.location.pathname !== '/login') {
                const currentPath = window.location.pathname;
                console.log("Redirecting to login from:", currentPath);
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
        } else if (error.response) {
            // Log other server errors
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
