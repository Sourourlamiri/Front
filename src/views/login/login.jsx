import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../service/authService";
import SnackbarAlert from "../../components/SnackbarAlert";

const Login = () => {
  const [data, setData] = useState({ Email: "", MotDePasse: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.Email.trim()) {
      newErrors.Email = "L'email est requis";
    } else if (!emailRegex.test(data.Email)) {
      newErrors.Email = "Format d'email invalide";
    }

    if (!data.MotDePasse) {
      newErrors.MotDePasse = "Le mot de passe est requis";
    } else if (data.MotDePasse.length < 5) {
      newErrors.MotDePasse = "Le mot de passe doit contenir au moins 5 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const result = await authService.login(data.Email, data.MotDePasse);

      if (result.success) {
        authService.initAuth();
        const role = result.user.rôle || result.user.role;
        let redirectPath = from;

        if (role === 'administrateur' && !from.startsWith('/')) {
          redirectPath = '/';
        } else if (role === 'recruteur' && !from.includes('recruteur')) {
          redirectPath = '/homerecruteur';
        } else if (role === 'candidat' && from === '/') {
          redirectPath = '/homeVC';
        }

        showSnackbar(`Connexion réussie. Bienvenue ${result.user.Nom || ''}!`, "success");
        setTimeout(() => navigate(redirectPath), 1000);
      } else {
        showSnackbar(result.error || "Erreur lors de la connexion", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("Une erreur s'est produite. Veuillez réessayer.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const RequiredLabel = ({ children }) => (
    <>
      {children} <span className="text-danger">*</span>
    </>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="card shadow-sm border-0 overflow-hidden">
              <div className="row g-0">
                {/* Left side - Welcome message */}
                <div className="col-md-5 d-none d-md-flex" style={{ backgroundColor: '#552b88' }}>
                  <div className="d-flex flex-column justify-content-center p-4 text-white text-center">
                    <h3 className="fw-bold mb-3">Bienvenue !</h3>
                    <p className="mb-0">Connectez-vous à votre espace RecruitEase</p>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="col-md-7 bg-white p-4">
                  <h4 className="fw-bold text-center mb-4" style={{ color: '#552b88' }}>Connexion</h4>
                  
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label><RequiredLabel>Email</RequiredLabel></label>
                      <input
                        type="email"
                        name="Email"
                        className={`form-control ${errors.Email ? 'is-invalid' : ''}`}
                        placeholder="Entrez votre email"
                        value={data.Email}
                        onChange={onChangeHandler}
                        disabled={isLoading}
                      />
                      {errors.Email && <div className="invalid-feedback">{errors.Email}</div>}
                    </div>

                    <div className="mb-3">
                      <label><RequiredLabel>Mot de passe</RequiredLabel></label>
                      <input
                        type="password"
                        name="MotDePasse"
                        className={`form-control ${errors.MotDePasse ? 'is-invalid' : ''}`}
                        placeholder="Entrez votre mot de passe"
                        value={data.MotDePasse}
                        onChange={onChangeHandler}
                        disabled={isLoading}
                      />
                      {errors.MotDePasse && <div className="invalid-feedback">{errors.MotDePasse}</div>}
                    </div>

                    <div className="mb-3 d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          defaultChecked
                        />
                        <label className="form-check-label" htmlFor="remember">
                          Se souvenir de moi
                        </label>
                      </div>
                      <Link to="/motdepasseoublie" className="text-primary">
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    <div className="mb-3 text-muted small">
                      <span className="text-danger">*</span> Champs obligatoires
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary py-2"
                        disabled={isLoading}
                        style={{ backgroundColor: '#552b88', border: 'none' }}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Connexion en cours...
                          </>
                        ) : 'Se connecter'}
                      </button>
                    </div>

                    <div className="text-center mt-3">
                      <p className="mb-0">Pas encore inscrit ? <Link to="/registerPage" className="text-primary fw-bold">S'inscrire</Link></p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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