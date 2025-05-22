import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiRecruteurinterface from "../../../service/apiRecruteurinterface";
import "./changermotdepasse.css";

const ChangerMotDePasse = () => {
  const [MotDePasse, setMotDePasse] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
// logo eyes pour voir le mot de passe
// État pour gérer l'affichage du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Récupération de l'utilisateur depuis le localStorage
  const user = localStorage.getItem("utilisateur");
  const parseUser = user ? JSON.parse(user) : null;
  const userId = parseUser?.utilisateur?._id;

  if (!userId) {
    console.error("Erreur: ID utilisateur introuvable !");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Erreur: Impossible de récupérer l'identifiant utilisateur.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRecruteurinterface.updateMotDePasse(userId, MotDePasse, newPassword);
      setMessage("Mot de passe changé avec succès !");
      console.log("Réponse du serveur :", response.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      if (error.response) {
        setMessage(`Erreur: ${error.response.data.message || "Une erreur est survenue."}`);
      } else {
        setMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changer-mdp-container">
      <div className="card changer-mdp-card">
        <div className="card-body">
          <h5 className="card-title text-center mb-4">Changer mot de passe</h5>
          {message && <div className="alert alert-info text-center">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Ancien mot de passe</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Entrez votre ancien mot de passe"
                  value={MotDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nouveau mot de passe</label>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmer mot de passe</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangerMotDePasse;