import React, { useState } from "react";
import auth from "../../service/auth";
import { useNavigate } from "react-router-dom";
import SnackbarAlert from "../../components/SnackbarAlert";

// Composant pour le formulaire d'inscription du candidat
const RegisterCandidat = () => {
  // État contenant les données du formulaire
  const [data, setData] = useState({ role: "candidat" });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState({});

  // État pour l'affichage des messages Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Indique si la soumission du formulaire est en cours
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Liste des gouvernorats triés par ordre alphabétique
  const tunisianGovernorates = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès",
    "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili",
    "Le Kef", "Mahdia", "Manouba", "Médenine", "Monastir",
    "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
    "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ].sort();

  // Gestion de l'image sélectionnée
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.match('image.*')) {
      setErrors({ ...errors, image: "Veuillez sélectionner une image valide" });
    } else {
      setData({ ...data, image: file });
      setErrors({ ...errors, image: null });
    }
    
  };

  // Gestion des champs du formulaire
  const OnChaneHandler = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    // Réinitialise l'erreur si l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Validation des champs du formulaire
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,}$/;
    const cinRegex = /^[0-9]{8}$/; // CIN doit contenir exactement 8 chiffres

    if (!data.Nom?.trim()) newErrors.Nom = "Le nom est obligatoire";
    if (!data.Prenom?.trim()) newErrors.Prenom = "Le prénom est obligatoire";
    if (!data.CIN?.trim()) {
      newErrors.CIN = "Le CIN est obligatoire";
    } else if (!cinRegex.test(data.CIN)) {
      newErrors.CIN = "Le CIN doit contenir exactement 8 chiffres";
    }
    if (!data.Email) {
      newErrors.Email = "L'email est obligatoire";
    } else if (!emailRegex.test(data.Email)) {
      newErrors.Email = "Format d'email invalide";
    }
    if (!data.Adresse) newErrors.Adresse = "Le gouvernorat est obligatoire";
    if (!data.Telephone) {
      newErrors.Telephone = "Le téléphone est obligatoire";
    } else if (!phoneRegex.test(data.Telephone)) {
      newErrors.Telephone = "Le téléphone doit contenir au moins 8 chiffres";
    }
    if (!data.MotDePasse) {
      newErrors.MotDePasse = "Le mot de passe est obligatoire";
    } else if (data.MotDePasse.length < 5) {
      newErrors.MotDePasse = "Le mot de passe doit contenir au moins 5 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fermer la Snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Afficher une alerte Snackbar
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const { Nom, Telephone, Email, MotDePasse, Adresse, Prenom, CIN } = data;

    try {
      const formData = new FormData();
      formData.append("Nom", Nom);
      formData.append("Telephone", Telephone);
      formData.append("Email", Email);
      formData.append("CIN", CIN);
      formData.append("MotDePasse", MotDePasse);
      formData.append("Adresse", Adresse);
      formData.append("Prenom", Prenom);
      formData.append("role", "candidat");

      if (data.image) formData.append("image", data.image);

      await auth.createCandidat(formData);

      showSnackbar("Candidat créé avec succès. Redirection vers la page de connexion...", "success");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      showSnackbar("Erreur lors de la création du compte", "error");
      console.log("Erreur lors de la création", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Composant pour afficher une étiquette obligatoire avec astérisque rouge
  const RequiredLabel = ({ children }) => (
    <>
      {children} <span className="text-danger">*</span>
    </>
  );

  // Rendu JSX
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="card shadow-sm border-0 overflow-hidden">
              <div className="row g-0">
                {/* Partie gauche (texte de bienvenue) */}
                <div className="col-md-5 d-none d-md-flex" style={{ backgroundColor: "#552b88" }}>
                  <div className="d-flex flex-column justify-content-center p-4 text-white text-center">
                    <h3 className="fw-bold mb-3">Bienvenue !</h3>
                    <p className="mb-0">Créez votre compte candidat en quelques clics</p>
                  </div>
                </div>

                {/* Partie droite - formulaire */}
                <div className="col-md-7 bg-white p-4">
                  <h4 className="fw-bold text-center mb-4" style={{ color: "#552b88" }}>
                    Inscription Candidat
                  </h4>

                  <form onSubmit={handleSubmit}>
                    {/* Champ Nom */}
                    <div className="mb-3">
                      <label><RequiredLabel>Nom</RequiredLabel></label>
                      <input type="text" name="Nom" onChange={OnChaneHandler} className={`form-control ${errors.Nom ? "is-invalid" : ""}`} />
                      {errors.Nom && <div className="invalid-feedback">{errors.Nom}</div>}
                    </div>

                    {/* Champ Prénom */}
                    <div className="mb-3">
                      <label><RequiredLabel>Prénom</RequiredLabel></label>
                      <input type="text" name="Prenom" onChange={OnChaneHandler} className={`form-control ${errors.Prenom ? "is-invalid" : ""}`} />
                      {errors.Prenom && <div className="invalid-feedback">{errors.Prenom}</div>}
                    </div>

                    {/* Champ Email */}
                    <div className="mb-3">
                      <label><RequiredLabel>Email</RequiredLabel></label>
                      <input type="email" name="Email" onChange={OnChaneHandler} className={`form-control ${errors.Email ? "is-invalid" : ""}`} />
                      {errors.Email && <div className="invalid-feedback">{errors.Email}</div>}
                    </div>

                    {/* Champ CIN */}
                    <div className="mb-3">
                      <label><RequiredLabel>CIN</RequiredLabel></label>
                      <input type="text" name="CIN" onChange={OnChaneHandler} className={`form-control ${errors.CIN ? "is-invalid" : ""}`} />
                      {errors.CIN && <div className="invalid-feedback">{errors.CIN}</div>}
                    </div>

                    {/* Champ Gouvernorat */}
                    <div className="mb-3">
                      <label><RequiredLabel>Gouvernorat</RequiredLabel></label>
                      <select name="Adresse" onChange={OnChaneHandler} className={`form-select ${errors.Adresse ? "is-invalid" : ""}`}>
                        <option value="">Sélectionnez un gouvernorat</option>
                        {tunisianGovernorates.map((gov, i) => (
                          <option key={i} value={gov}>{gov}</option>
                        ))}
                      </select>
                      {errors.Adresse && <div className="invalid-feedback">{errors.Adresse}</div>}
                    </div>

                    {/* Champ Téléphone */}
                    <div className="mb-3">
                      <label><RequiredLabel>Téléphone</RequiredLabel></label>
                      <input type="number" name="Telephone" onChange={OnChaneHandler} className={`form-control ${errors.Telephone ? "is-invalid" : ""}`} />
                      {errors.Telephone && <div className="invalid-feedback">{errors.Telephone}</div>}
                    </div>

                    {/* Champ Mot de passe */}
                    <div className="mb-3">
                      <label><RequiredLabel>Mot de passe</RequiredLabel></label>
                      <input type="password" name="MotDePasse" onChange={OnChaneHandler} className={`form-control ${errors.MotDePasse ? "is-invalid" : ""}`} />
                      {errors.MotDePasse && <div className="invalid-feedback">{errors.MotDePasse}</div>}
                    </div>

                    {/* Champ Image */}
                    <div className="mb-3">
                      <label>Photo de profil</label>
                      <input type="file" name="image" accept="image/*" onChange={handleImageChange} className={`form-control ${errors.image ? "is-invalid" : ""}`} />
                      {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                    </div>

                    <div className="mb-3 text-muted small">
                      <span className="text-danger">*</span> Champs obligatoires
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                      <button type="submit" className="btn btn-primary w-100 py-2" disabled={isLoading} style={{ backgroundColor: "#552b88", border: "none" }}>
                        {isLoading ? "Inscription en cours..." : "S'inscrire"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar pour les messages de succès ou d'erreur */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </div>
  );
};

export default RegisterCandidat;
