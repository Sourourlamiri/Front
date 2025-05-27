import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Importation des outils de navigation
import auth from '../../service/auth'
import SnackbarAlert from '../../components/SnackbarAlert'
import './motdepasseoublie.css';

const Motpasseoublié = () => {
  // État pour stocker l'email saisi par l'utilisateur
  const [data, setEmail] = useState({ Email: "" })
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const navigate = useNavigate() // Hook pour la navigation

  const onchangeHandler = (e) => {
    setEmail({ ...data, [e.target.name]: e.target.value })
  }

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

  // Fonction pour gérer la soumission du formulaire de réinitialisation
  const resetPassword = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true);

    try {
      const response = await auth.forget(data);
      showSnackbar('Un email de réinitialisation vous a été envoyé', 'success');
      console.log("Demande de réinitialisation envoyée pour:", response.data);

      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      showSnackbar('Erreur lors de la demande de réinitialisation. Vérifiez votre email.', 'error');
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-body">
          <div className="text-center mb-3">
            <img src="../assets/images/logos/4.svg" width="50%" alt="Logo" />
          </div>
          <h5 className="card-title">Mot de passe oublié</h5>
          <p className="subtitle text-center">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>

          <form onSubmit={resetPassword}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="Email"
                className="form-control"
                placeholder="Entrez votre adresse email"
                onChange={onchangeHandler}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Envoi en cours...
                </span>
              ) : (
                "Envoyer email"
              )}
            </button>

            <div className="text-center mt-3">
              <Link className="text-primary fw-bold" to="/login">
                Retour à la connexion
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

export default Motpasseoublié;