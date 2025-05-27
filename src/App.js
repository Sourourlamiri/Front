import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import authService from "./service/authService";
import AuthGuard from "./components/AuthGuard";
import Home from "./views/home/home";
import Dashboard from "./views/home/Dashboard.jsx";
import Register from "./views/register/register.jsx";
import Registercandidat from "./views/register/registercandidat.jsx";
import RegisterPage from "./views/register/registerPage.jsx";
import Login from "./views/login/login.jsx";
import ListCandidats from "./views/home/ListCandidats/ListCandidats.jsx"; // Corrected import path
import ListeRecruteurs from "./views/home/ListRecruteurs/ListRecruteurs.jsx";
import Profil from "./views/home/profil/profil.jsx";
import ChangerMotDePasse from "./views/home/changermotdepasse/changermotdepasse.jsx";
import Motpasseoublié from "./views/motdepasse/motdepasseoublie.jsx";
import Rénitialisermotpasse from "./views/motdepasse/renitialisermotdepasse.jsx";
//import interface recruteur
import ListeCategorie from "./views/homerecruteur/ListeCategorie/ListeCategorie.jsx";
import ListeEntretiens from "./views/homerecruteur/ListeEntretiens/ListeEntretiens.jsx";
import ListeOffres from "./views/homerecruteur/ListeOffres/ListeOffres.jsx";
import Homerecruteur from "./views/homerecruteur/homerecruteur.jsx";
import Profilrecruteur from "./views/homerecruteur/profilrecruteur/profilrecruteur.jsx";
import ListeCandidatsRecruteur from "./views/homerecruteur/ListecandidatsRecruteur/ListeCandidatsRecruteur.jsx";
import DashboardRecruteur from "./views/homerecruteur/dashboard/Dashboard.jsx";
//import interface visiteur candidat
//visiteur
import HomeVC from "./views/homeVC/homeVC.jsx";
import VoirOffres from "./views/homeVC/VoirOffres/VoirOffres.jsx";
import Entreprises from "./views/homeVC/entreprises/entreprises.jsx";
import PageCategorie from "./views/homeVC/categories/pageCategorie.jsx";
import Offredetails from "./views/homeVC/offredetails.jsx"; // Importation du composant Offredetails
import DetailEntreprise from "./views/homeVC/entreprises/detailEntreprise";
//Candidat
import MesCandidatures from "./views/homeVC/interfaceCandidat/mesCandidatures.jsx";
import MonCompte from "./views/homeVC/interfaceCandidat/monCompte.jsx";
import ChangerMotDePasseCandidat from "./views/homeVC/interfaceCandidat/changermotdepasse.jsx";
import InformationCandidat from "./views/homeVC/interfaceCandidat/informationCandidat.jsx";
import MesEntretiens from "./views/homeVC/interfaceCandidat/mesEntretiens.jsx";
import RecrutoBot from "./views/homeVC/RecrutoBot.jsx";

// Initialize auth service
function App() {
  // Initialize authentication on app load
  useEffect(() => {
    authService.initAuth();
  }, []);

  // Use our AuthGuard for protected routes
  const AdminRoute = ({ children }) => (
    <AuthGuard roles={["administrateur"]}>{children}</AuthGuard>
  );

  const RecruteurRoute = ({ children }) => (
    <AuthGuard roles={["recruteur"]}>{children}</AuthGuard>
  );

  const CandidatRoute = ({ children }) => (
    <AuthGuard roles={["candidat"]}>{children}</AuthGuard>
  );

  // Legacy route for backward compatibility during transition
  const PrivateRoute = ({ children }) => {
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
    const token = utilisateur?.accessToken;

    // Handle both possible structures for role (direct or nested)
    const user = utilisateur?.utilisateur || {};
    const role = user.rôle || user.role;

    console.log("Authentication info:", {
      hasUser: !!utilisateur,
      hasToken: !!token,
      role: role,
    });

    if (!utilisateur || !token) {
      return (
        <Navigate to="/login" state={{ from: window.location.pathname }} />
      );
    }

    if (role === "administrateur" && window.location.pathname !== "/") {
      return <Navigate to={"/"} replace />;
    } else if (
      role === "recruteur" &&
      window.location.pathname !== "/homerecruteur"
    ) {
      return <Navigate to={"/homerecruteur"} replace />;
    } else if (role === "candidat" && window.location.pathname !== "/homeVC") {
      return <Navigate to={"/homeVC"} replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route
          path="/"
          element={
            <AdminRoute>
              <Home />
            </AdminRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listRecruteurs" element={<ListeRecruteurs />} />
          <Route path="/listCandidats" element={<ListCandidats />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/changermotdepasse" element={<ChangerMotDePasse />} />
        </Route>

        {/* Recruiter routes */}
        <Route
          path="/homerecruteur"
          element={
            <RecruteurRoute>
              <Homerecruteur />
            </RecruteurRoute>
          }
        >
          <Route path="/homerecruteur" element={<DashboardRecruteur />} />
          <Route
            path="/homerecruteur/dashboard"
            element={<DashboardRecruteur />}
          />
          <Route
            path="/homerecruteur/listeCategorie"
            element={<ListeCategorie />}
          />
          <Route
            path="/homerecruteur/listeEntretiens"
            element={<ListeEntretiens />}
          />
          <Route path="/homerecruteur/listeOffres" element={<ListeOffres />} />
          <Route
            path="/homerecruteur/changermotdepasse"
            element={<ChangerMotDePasse />}
          />
          <Route
            path="/homerecruteur/profilrecruteur"
            element={<Profilrecruteur />}
            
          />
          <Route
            path="/homerecruteur/listeCandidatsRecruteur/:id"
            element={<ListeCandidatsRecruteur />}
          />
        </Route>

        {/* Public visitor routes */}
        <Route path="/homeVC" element={<HomeVC />} />
        <Route path="/VoirOffres" element={<VoirOffres />} />
        <Route path="/entreprises" element={<Entreprises />} />
        <Route path="/emplois/:categorie" element={<PageCategorie />} />
        <Route path="/offre/:id" element={<Offredetails />} />
        <Route path="/recruteur/:id" element={<DetailEntreprise />} />
        <Route path="/recrutoBot" element={<RecrutoBot />} />

        {/* Candidate authenticated routes */}
        <Route
          path="/mesCandidatures"
          element={
            <CandidatRoute>
              <MesCandidatures />
            </CandidatRoute>
          }
        />
        <Route
          path="/monCompte"
          element={
            <CandidatRoute>
              <MonCompte />
            </CandidatRoute>
          }
        />
        <Route
          path="/changermotdepasseCandidat"
          element={
            <CandidatRoute>
              <ChangerMotDePasseCandidat />
            </CandidatRoute>
          }
        />
        <Route
          path="/candidat/:id"
          element={
            <CandidatRoute>
              <InformationCandidat />
            </CandidatRoute>
          }
        />
        <Route
          path="/mesEntretiens"
          element={
            <CandidatRoute>
              <MesEntretiens />
            </CandidatRoute>
          }
        />

        {/* Authentication routes */}
        <Route path="/registerrecruteur" element={<Register />} />
        <Route path="/registercandidat" element={<Registercandidat />} />
        <Route path="/registerPage" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/motdepasseoublie" element={<Motpasseoublié />} />
        <Route
          path="renitialisermotdepasse/:token"
          element={<Rénitialisermotpasse />}
        />
      </Routes>
    </Router>
  );
}

export default App;
