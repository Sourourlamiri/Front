import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../service/authService';

/**
 * AuthGuard component proteger une route en vérifiant si l'utilisateur est authentifié et a le rôle requis.
 * Si l'utilisateur n'est pas authentifié, il est redirigé vers la page de connexion.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Les composants enfants à rendre si l'utilisateur est authentifié et a le rôle requis
 * @param {string[]} [props.roles] - Liste des rôles requis pour accéder à la route. Si non spécifié, n'importe quel utilisateur authentifié peut accéder.
 * @returns {React.ReactNode}
 */
const AuthGuard = ({ children, roles }) => { // Destructuration des props pour obtenir les enfants et les rôles requis
  // Utilisation de useLocation pour obtenir l'URL actuelle
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    // L'utilisateur n'est pas authentifié - rediriger vers la page de connexion
    // En passant l'URL actuelle dans l'état pour rediriger après la connexion
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Vérifier si des rôles sont requis
  // et si l'utilisateur a le rôle requis
  if (roles && roles.length > 0) {
    // Récupérer le rôle de l'utilisateur actuel
    // Utiliser toLowerCase pour comparer les rôles de manière insensible à la casse
    const userRole = currentUser?.rôle?.toLowerCase() || currentUser?.role?.toLowerCase();

    if (!userRole || !roles.includes(userRole)) {
      // L'utilisateur n'a pas le rôle requis - rediriger vers la page d'accueil
      // En fonction du rôle de l'utilisateur, rediriger vers la page appropriée
      if (userRole === 'administrateur') {
        return <Navigate to="/" replace />;
      } else if (userRole === 'recruteur') {
        return <Navigate to="/homerecruteur" replace />;
      } else if (userRole === 'candidat') {
        return <Navigate to="/homeVC" replace />;
      } else {
        //  Si le rôle n'est pas reconnu, rediriger vers la page d'accueil
        return <Navigate to="/" replace />;
      }
    }
  }

  // Si l'utilisateur est authentifié et a le rôle requis (ou aucun rôle n'est requis),
  return children;
};

export default AuthGuard; 