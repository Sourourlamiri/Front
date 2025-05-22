import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaSignInAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
  FaBriefcase,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./header.css";
import apiVC from "../service/apiVC";
import authService from "../service/authService";
import AvatarLetter from "../components/AvatarLetter";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Gestion du scroll pour appliquer un style
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Récupération de l'utilisateur depuis le service auth
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.rôle === "candidat") {
        setUser(currentUser);
      }
    };

    checkAuth();

    // Setup a listener for storage events to sync auth state across tabs
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "accessToken") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Récupération des catégories depuis l'API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiVC.getAllcategorie();
        if (Array.isArray(response.data.list)) {
          setCategories(response.data.list);
        }
      } catch (error) {
        console.error("Erreur en récupérant les catégories :", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fermer le menu profil quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-section")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fonctions de toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) setIsCategoryMenuOpen(false);
  };

  const toggleCategoryMenu = () => setIsCategoryMenuOpen(!isCategoryMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  // ✅ Déconnexion
  const handleLogout = () => {
    const logoutResult = authService.logout();
    setUser(null);
    setIsProfileMenuOpen(false);
    navigate(logoutResult.redirectTo);
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <div className="logo-container">
          <Link to="/homeVC" className="logo-link">
            <h1 className="logo">
              Recruit<span>Ease</span>
            </h1>
          </Link>
        </div>

        <div className="mobile-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`main-nav ${isMobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li>
              <Link to="/homeVC" className={`nav-link ${isActive("/homeVC")}`}>
                Accueil
              </Link>
            </li>
            <li>
              <Link
                to="/entreprises"
                className={`nav-link ${isActive("/entreprises")}`}
              >
                Entreprises
              </Link>
            </li>
            <li>
              <Link
                to="/VoirOffres"
                className={`nav-link ${isActive("/VoirOffres")}`}
              >
                Offres d'emploi
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  to="/mescandidatures"
                  className={`nav-link ${isActive("/mescandidatures")}`}
                >
                  Mes candidatures
                </Link>
              </li>
            )}

            {user && (
              <li>
                <Link
                  to="/mesEntretiens"
                  className={`nav-link ${isActive("/mesEntretiens")}`}
                >
                  Mes entretiens
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/recrutoBot"
                className={`nav-link ${isActive("/recrutoBot")}`}
              >
                RecrutoBot
              </Link>
            </li>
          </ul>
        </nav>

        <div className={`auth-buttons ${isMobileMenuOpen ? "active" : ""}`}>
          {!user ? (
            <>
              <Link to="/login" className="login-btn">
                <FaUser /> Connexion
              </Link>
              <Link to="/registerPage" className="signup-btn">
                <FaSignInAlt /> Inscription
              </Link>
            </>
          ) : (
            <div className="dropdown profile-section">
              <div className="profile-trigger" onClick={toggleProfileMenu}>
                <AvatarLetter user={user} size="small" />
                <span className="profile-name">{user.Nom}</span>
              </div>

              <div
                className={`profile-dropdown ${
                  isProfileMenuOpen ? "show" : ""
                }`}
              >
                <div className="profile-header">
                  <AvatarLetter user={user} size="large" />
                  <div className="profile-info">
                    <p className="profile-name-large">
                      {user.Nom} {user.Prenom || ""}
                    </p>
                    <p className="profile-email">{user.Email || "Candidat"}</p>
                  </div>
                </div>

                <div className="profile-menu-items">
                  <Link to="/monCompte" className="profile-menu-item">
                    <FaUserCircle /> Mon Compte
                  </Link>
                  <Link
                    to={`/candidat/${user._id}`}
                    className="profile-menu-item"
                  >
                    <FaFileAlt /> Mon Profil CV
                  </Link>
                  <Link to="/mescandidatures" className="profile-menu-item">
                    <FaBriefcase /> Mes Candidatures
                  </Link>
                  <Link to="/mesEntretiens" className="profile-menu-item">
                    <FaCalendarAlt /> Mes Entretiens
                  </Link>
                  <Link
                    to="/changermotdepasseCandidat"
                    className="profile-menu-item"
                  >
                    <FaCog /> Mot de passe
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="profile-menu-item logout-item"
                  >
                    <FaSignOutAlt /> Déconnexion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
