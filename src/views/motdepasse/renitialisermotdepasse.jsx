import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import auth from '../../service/auth';
import SnackbarAlert from '../../components/SnackbarAlert';
import './renitialisermotdepasse.css';

const Rénitialisermotpasse = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

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

  const resetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        showSnackbar("Les mots de passe ne correspondent pas.", "error");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        showSnackbar("Le mot de passe doit contenir au moins 6 caractères.", "warning");
        setIsLoading(false);
        return;
      }

      const response = await auth.reset(token, password);
      console.log('Votre mot de passe a été réinitialisé avec succès', response.data);

      showSnackbar('Votre mot de passe a été modifié avec succès', 'success');

      // Redirect after a delay to show the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      showSnackbar('Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.', 'error');
      console.error('Erreur lors de la réinitialisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <img src="../assets/images/logos/4.svg" width={120} alt="Logo" className="reset-logo" />
        <h4 className="reset-title">Réinitialiser mot de passe</h4>
        <form onSubmit={resetPassword}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              name="password"
              className="form-control"
              id="newPassword"
              placeholder="Entrez votre nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength="6"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">Confirmer mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Réinitialisation...
              </span>
            ) : (
              "Réinitialiser"
            )}
          </button>
        </form>
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

export default Rénitialisermotpasse;