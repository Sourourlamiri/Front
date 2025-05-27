import React, { useState } from 'react';
import auth from '../../service/auth';
import { useNavigate } from 'react-router-dom';
import SnackbarAlert from '../../components/SnackbarAlert';

const Register = () => {
  const [data, setData] = useState({ role: "recruteur" });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const tunisianGovernorates = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili",
    "Le Kef", "Mahdia", "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
    "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ].sort();

  // Composant pour afficher les labels avec étoile rouge
  const RequiredLabel = ({ children }) => (
    <>
      {children} <span className="text-danger">*</span>
    </>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({...data, [name]: value });
    if (errors[name]) setErrors({...errors, [name]: null});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.match('image.*')) {
      setErrors({...errors, image: "Veuillez sélectionner une image valide"});
    } else {
      setData({ ...data, image: file });
      setErrors({...errors, image: null});
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,}$/;

    if (!data.NomEntreprise?.trim()) newErrors.NomEntreprise = "Nom de l'entreprise requis";
    if (!data.Email?.trim()) {
      newErrors.Email = "Email requis";
    } else if (!emailRegex.test(data.Email)) {
      newErrors.Email = "Format d'email invalide";
    }
    if (!data.Adresse?.trim()) newErrors.Adresse = "Adresse requise";
    if (!data.Telephone?.trim()) {
      newErrors.Telephone = "Téléphone requis";
    } else if (!phoneRegex.test(data.Telephone)) {
      newErrors.Telephone = "Doit contenir au moins 8 chiffres";
    }
    if (!data.MotDePasse) {
      newErrors.MotDePasse = "Mot de passe requis";
    } else if (data.MotDePasse.length < 5) {
      newErrors.MotDePasse = "5 caractères minimum requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("NomEntreprise", data.NomEntreprise);
      formData.append("Email", data.Email);
      formData.append("Adresse", data.Adresse);
      formData.append("Telephone", data.Telephone);
      formData.append("MotDePasse", data.MotDePasse);
      formData.append("role", "recruteur");
      if (data.image) formData.append("image", data.image);

      await auth.createrecruteur(formData);
      setSnackbar({ open: true, message: "Recruteur créé avec succès", severity: "success" });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la création du compte", severity: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    <p className="mb-0">Créez votre compte recruteur en quelques clics</p>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="col-md-7 bg-white p-4">
                  <h4 className="fw-bold text-center mb-4" style={{ color: '#552b88' }}>Inscription Recruteur</h4>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label><RequiredLabel>Nom de l'entreprise</RequiredLabel></label>
                      <input 
                        type="text" 
                        name="NomEntreprise" 
                        onChange={handleChange} 
                        className={`form-control ${errors.NomEntreprise ? 'is-invalid' : ''}`} 
                      />
                      {errors.NomEntreprise && <div className="invalid-feedback">{errors.NomEntreprise}</div>}
                    </div>

                    <div className="mb-3">
                      <label><RequiredLabel>Email</RequiredLabel></label>
                      <input 
                        type="email" 
                        name="Email" 
                        onChange={handleChange} 
                        className={`form-control ${errors.Email ? 'is-invalid' : ''}`} 
                      />
                      {errors.Email && <div className="invalid-feedback">{errors.Email}</div>}
                    </div>

                    <div className="mb-3">
                      <label><RequiredLabel>Gouvernorat</RequiredLabel></label>
                      <select 
                        name="Adresse" 
                        onChange={handleChange} 
                        className={`form-select ${errors.Adresse ? 'is-invalid' : ''}`}
                      >
                        <option value="">Sélectionnez un gouvernorat</option>
                        {tunisianGovernorates.map((gov, idx) => (
                          <option key={idx} value={gov}>{gov}</option>
                        ))}
                      </select>
                      {errors.Adresse && <div className="invalid-feedback">{errors.Adresse}</div>}
                    </div>

                    <div className="mb-3">
                      <label><RequiredLabel>Téléphone</RequiredLabel></label>
                      <input 
                        type="text" 
                        name="Telephone" 
                        onChange={handleChange} 
                        className={`form-control ${errors.Telephone ? 'is-invalid' : ''}`} 
                      />
                      {errors.Telephone && <div className="invalid-feedback">{errors.Telephone}</div>}
                    </div>

                    <div className="mb-3">
                      <label><RequiredLabel>Mot de passe</RequiredLabel></label>
                      <input 
                        type="password" 
                        name="MotDePasse" 
                        onChange={handleChange} 
                        className={`form-control ${errors.MotDePasse ? 'is-invalid' : ''}`} 
                      />
                      {errors.MotDePasse && <div className="invalid-feedback">{errors.MotDePasse}</div>}
                    </div>

                    <div className="mb-3">
                      <label>Photo de profil</label>
                      <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className={`form-control ${errors.image ? 'is-invalid' : ''}`} 
                      />
                      {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                    </div>

                    <div className="mb-3 text-muted small">
                      <span className="text-danger">*</span> Champs obligatoires
                    </div>

                    <div className="text-center">
                      <button 
                        type="submit" 
                        className="btn btn-primary px-4" 
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#552b88', border: 'none' }}
                      >
                        {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
                      </button>
                    </div>
                  </form>
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
        </div>
      </div>
    </div>
  );
};

export default Register;