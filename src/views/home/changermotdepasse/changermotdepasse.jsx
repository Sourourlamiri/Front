import React, { useState } from "react";
import "./changermotdepasse.css";
import administrateur from "../../../service/administrateur";
import SnackbarAlert from "../../../components/SnackbarAlert";

const ChangerMotDePasse = () => {
  const [MotDePasse, setMotDePasse] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Local Storage
  const user = localStorage.getItem("utilisateur");
  const parseUser = user ? JSON.parse(user) : null;
  const userId = parseUser?.utilisateur?._id;

  if (!userId) {
    console.error("Erreur: ID utilisateur introuvable !");
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!userId) {
      setSnackbar({
        open: true,
        message:
          "❌ Erreur: Impossible de récupérer l'identifiant utilisateur.",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "❌ Les mots de passe ne correspondent pas !",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await administrateur.updateMotDePasse(
        userId,
        MotDePasse,
        newPassword
      );

      setSnackbar({
        open: true,
        message: "✅ Mot de passe changé avec succès !",
        severity: "success",
      });
      console.log("Réponse du serveur :", response.data);

      // Reset fields after successful password change
      setMotDePasse("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);

      if (error.response) {
        setSnackbar({
          open: true,
          message: `⚠️ Erreur: ${
            error.response.data.message || "Une erreur est survenue."
          }`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "⚠️ Une erreur est survenue. Veuillez réessayer.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changer-mdp-container">
      <div className="card changer-mdp-card">
        <div className="card-body">
          <h5 className="card-title text-center mb-4">
            Changer le mot de passe
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Ancien mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="Entrez votre ancien mot de passe"
                value={MotDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="Entrez votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirmez votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Modification..." : "Enregistrer "}
            </button>
          </form>
        </div>
      </div>

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default ChangerMotDePasse;
