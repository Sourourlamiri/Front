import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Modal, Button } from 'react-bootstrap'
import './header.css';

// deconnexion admin 
const Header = () => {
  // État pour gérer l'affichage de la fenêtre de confirmation de déconnexion
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState();

  const navigate = useNavigate();
  // Récupération de l'utilisateur depuis le localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('utilisateur');
      const storedData = JSON.parse(raw);
      const userFromStorage = storedData?.utilisateur;

      console.log('userFromStorage STORAGE:', userFromStorage);

      if (userFromStorage?.role === 'administrateur') {
        setUser(userFromStorage);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error);
    }
  }, []);

  const logOut = () => {
    localStorage.clear();
    navigate('/homeVC');
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(true); // Ouvrir la fenêtre de confirmation de déconnexion
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false); // Fermer la fenêtre de confirmation de déconnexion
  };

  return (
    <div>
      <header className="app-header">
        <nav className="navbar navbar-expand-lg navbar-light">


          <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
            <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
              <li className="nav-item dropdown">
                <a className="nav-link nav-icon-hover" href="javascript:void(0)" id="drop2" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={user?.image ? `http://localhost:5002/file/${user?.image}` : "../assets/images/logos/5.svg"} alt="Profil" width={35} height={35} className="rounded-circle" />
                </a>
                <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop2">
                  <div className="message-body">
                    <Link to="/profil" className="d-flex align-items-center gap-2 dropdown-item">
                      <i className="ti ti-user fs-6" />
                      <p className="mb-0 fs-6 fw-normal">Mon compte</p>
                    </Link>

                    <Link to="/changermotdepasse" className="d-flex align-items-center gap-2 dropdown-item">
                      <i className="ti ti-lock fs-6" />
                      <p className="mb-0 fs-6 fw-normal">Changer mot de passe </p>
                    </Link>

                    <button onClick={handleLogoutConfirm} className="btn btn-deconnexion mx-3 mt-2 d-block fs-6"> Déconnexion </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Modal de confirmation de déconnexion */}
      <Modal show={showLogoutModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="modal-purple-header">
          <Modal.Title className="text-purple">Déconnexion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="outline-secondary" onClick={handleCloseModal} className="purple-border">
            Annuler
          </Button>
          <Button variant="outline-danger" onClick={() => {
            logOut();  // Exécuter la déconnexion
            handleCloseModal(); // Fermer la fenêtre après déconnexion
          }} className="purple-delete">
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Header;