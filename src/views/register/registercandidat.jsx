import React, { useState } from 'react'
import auth from '../../service/auth'
import { useNavigate } from 'react-router-dom'
import SnackbarAlert from '../../components/SnackbarAlert'

const Registercandidat = () => {
  const [data, setData] = useState({ role: "candidat" })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [isLoading, setIsLoading] = useState(false);

  // Liste des gouvernorats tunisiens
  const tunisianGovernorates = [
    "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès",
    "Ariana", "Gafsa", "Monastir", "Ben Arous", "Kasserine",
    "Médenine", "Nabeul", "Tataouine", "Béja", "Jendouba",
    "Le Kef", "Mahdia", "Siliana", "Zaghouan", "Kebili",
    "Sidi Bouzid", "Tozeur", "Manouba"
  ].sort();

  const OnChaneHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
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

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { Nom, Telephone, Email, MotDePasse, Adresse,Prenom } = data;
    try {
      const formData = new FormData();
      formData.append("Nom", Nom);
      formData.append("Telephone", Telephone);
      formData.append("Email", Email);
      formData.append("MotDePasse", MotDePasse);
      formData.append("Adresse", Adresse);
      formData.append("Prenom", Prenom);
      formData.append("role", "candidat");

      let response = await auth.createCandidat(formData);

      // Show success message with snackbar
      showSnackbar('Candidat créé avec succès. Redirection vers la page de connexion...', 'success');

      // Navigate after a delay to show the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      console.log('Candidat est créé', response.data);
    } catch (error) {
      showSnackbar('Erreur lors de la création du compte', 'error');
      console.log('Erreur lors de la création', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full" data-sidebar-position="fixed" data-header-position="fixed">
        <div className="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
          <div className="d-flex align-items-center justify-content-center w-100">
            <div className="row justify-content-center w-100">
              <div className="col-md-8 col-lg-6 col-xxl-3">
                <div className="card mb-0">
                  <div className="card-body">
                    <a href="./index.html" className="text-nowrap logo-img text-center d-block py-3 w-100">
                      <img src="../assets/images/logos/4.svg" width={120} alt="logo" />
                    </a>
                    <p className="text-center">S'inscrire comme Candidat</p>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="exampleInputtext1" className="form-label">Nom</label>
                        <input type="text" name='Nom' onChange={OnChaneHandler} className="form-control" id="exampleInputtext1" aria-describedby="textHelp" required />
                      </div>

                       <div className="mb-3">
                        <label htmlFor="exampleInputtext1" className="form-label">Prénom</label>
                        <input type="text" name='Prenom' onChange={OnChaneHandler} className="form-control" id="exampleInputtext1" aria-describedby="textHelp" required />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="exampleInputPassword1" className="form-label">Email</label>
                        <input type="email" name='Email' onChange={OnChaneHandler} className="form-control" id="exampleInputPassword1" required />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="gouvernorat" className="form-label">Gouvernorat</label>
                        <select name="Adresse" onChange={OnChaneHandler} className="form-select" id="gouvernorat" required>
                          <option value="">Sélectionnez un gouvernorat</option>
                          {tunisianGovernorates.map((governorate, index) => (
                            <option key={index} value={governorate}>{governorate}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="exampleInputPassword1" className="form-label">Téléphone</label>
                        <input type="number" name='Telephone' onChange={OnChaneHandler} className="form-control" id="exampleInputPassword1" required />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="exampleInputPassword1" className="form-label">MotDePasse</label>
                        <input type="password" name='MotDePasse' onChange={OnChaneHandler} className="form-control" id="exampleInputPassword1" required />
                      </div>

                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          type='submit'
                          className="text-primary fw-bold ms-2"
                          disabled={isLoading}
                        >
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
      </div>

      {/* Snackbar for notifications */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </div>
  )
}

export default Registercandidat 
