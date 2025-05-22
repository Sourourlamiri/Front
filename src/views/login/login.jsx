import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../service/authService";
import SnackbarAlert from "../../components/SnackbarAlert";
import "./login.css";

const Login = () => {
  const [data, setData] = useState({ Email: "", MotDePasse: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from query params (if it exists)
  const from = location.state?.from || "/";

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    // Clear any error when user starts typing
    if (error) setError("");
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Log the current state
    console.log("Login attempt:", { email: data.Email, fromPath: from });

    try {
      const result = await authService.login(data.Email, data.MotDePasse);

      if (result.success) {
        console.log("Login successful:", {
          user: result.user,
          redirectTo: from || "/"
        });

        // Initialize auth in axios for future requests
        authService.initAuth();

        // Determine where to navigate based on user role
        const role = result.user.rôle || result.user.role;
        let redirectPath = from;

        // Override redirect for role-specific home pages if user is trying to access a different role's page
        if (role === 'administrateur' && !from.startsWith('/')) {
          redirectPath = '/';
        } else if (role === 'recruteur' && !from.includes('recruteur')) {
          redirectPath = '/homerecruteur';
        } else if (role === 'candidat' && from === '/') {
          redirectPath = '/homeVC';
        }

        console.log(`Redirecting ${role} to:`, redirectPath);

        // Show success message
        showSnackbar(`Connexion réussie. Bienvenue ${result.user.Nom || ''}!`, "success");

        // Navigate to the appropriate page after a short delay to show the success message
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } else {
        setError(result.error || "Erreur lors de la connexion");
        showSnackbar(result.error || "Erreur lors de la connexion", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Une erreur s'est produite. Veuillez réessayer.");
      showSnackbar("Une erreur s'est produite. Veuillez réessayer.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-body">

          <div className="text-center mb-1">
            <img
              src="../assets/images/logos/4.svg"
              width="20"
              alt="Logo"
              className="logo-img"
            />
          </div>
          <h5 className="card-title fw-semibold mb-1">Connexion</h5>
          <p className="subtitle" style={{ textAlign: "center" }}>
            Accédez à votre espace RecruitEase
          </p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="Email"
                className="form-control"
                placeholder="Entrez votre email"
                onChange={onChangeHandler}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="MotDePasse"
                className="form-control"
                placeholder="Entrez votre mot de passe"
                onChange={onChangeHandler}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4 d-flex align-items-center justify-content-between">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="remember">
                  Se souvenir de cet appareil
                </label>
              </div>
              <Link to="/motdepasseoublie" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <span>&#10132;</span>
              )}
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <div className="d-flex align-items-center justify-content-center mt-4">
              <p className="mb-0">Pas encore inscrit-e?</p>
              <Link to="/registerPage" className="text-primary fw-bold ms-2">
                S'inscrire gratuitemnt
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </div>
  );
};

export default Login;
