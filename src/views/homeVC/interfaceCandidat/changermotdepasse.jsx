import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../../componentsVC/header';
import Footer from '../../../componentsVC/footer';
import apiCandidat from '../../../service/apiCandidat';

const ChangerMotDePasseCandidat = () => {
  // États pour gérer les champs du formulaire
  const [MotDePasse, setMotDePasse] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour afficher/masquer les mots de passe (icônes œil)
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Récupération de l'utilisateur depuis le localStorage
  const user = localStorage.getItem("utilisateur");
  const parseUser = user ? JSON.parse(user) : null;
  const userId = parseUser?.utilisateur?._id;

  // Vérification de la présence de l'ID utilisateur
  if (!userId) {
    console.error("Erreur: ID utilisateur introuvable !");
  }

  // Fonction appelée lors de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setMessage(""); // Réinitialise le message

    // Vérification de l'ID utilisateur
    if (!userId) {
      setMessage("Erreur: Impossible de récupérer l'identifiant utilisateur.");
      return;
    }

    // Vérification de la correspondance des nouveaux mots de passe
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true); // Affiche le chargement

    try {
      // Appel API pour modifier le mot de passe
      const response = await apiCandidat.updateMotDePasse(userId, MotDePasse, newPassword);
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
      setLoading(false); // Arrête le chargement
    }
  };

  return (
    <>
      {/* Header (haut de page) */}
      <Header />

      {/* Contenu principal de la page */}
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="card changer-mdp-card">
          <div className="card-body">
            <h5 className="card-title text-center mb-4">Changer mot de passe</h5>

            {/* Message de succès ou d'erreur */}
            {message && <div className="alert alert-info text-center">{message}</div>}

            {/* Formulaire de changement de mot de passe */}
            <form onSubmit={handleSubmit}>
              {/* Ancien mot de passe */}
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

              {/* Nouveau mot de passe */}
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

              {/* Confirmation du mot de passe */}
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

              {/* Bouton de soumission */}
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Modification..." : "Changer le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer (bas de page) */}
      <Footer />
    </>
  );
};

export default ChangerMotDePasseCandidat;
