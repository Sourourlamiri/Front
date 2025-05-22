import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../service/authService';

/**
 * AuthGuard component to protect routes that require authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to render if authenticated
 * @param {string[]} [props.roles] - Optional array of roles that can access this route
 * @returns {React.ReactNode}
 */
const AuthGuard = ({ children, roles }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // First check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Then check if user has required role (if specified)
  if (roles && roles.length > 0) {
    // Handle different possible structures for role field
    const userRole = currentUser?.rôle?.toLowerCase() || currentUser?.role?.toLowerCase();

    if (!userRole || !roles.includes(userRole)) {
      // User doesn't have the required role - redirect to appropriate home page
      if (userRole === 'administrateur') {
        return <Navigate to="/" replace />;
      } else if (userRole === 'recruteur') {
        return <Navigate to="/homerecruteur" replace />;
      } else if (userRole === 'candidat') {
        return <Navigate to="/homeVC" replace />;
      } else {
        // Unknown role - redirect to home
        return <Navigate to="/" replace />;
      }
    }
  }

  // User is authenticated and has the required role
  return children;
};

export default AuthGuard; 