import React from 'react';
import { useNavigate } from 'react-router-dom';
import './registerPage.css'; // Import your CSS file for styling

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="register-page-container">
      <div className="register-card">
        <h2>Créez votre compte</h2>
        <p className="login-link">
          Vous avez déjà un compte? <span onClick={() => navigate('/login')}>Se connecter</span>
        </p>
        
        <div className="role-buttons">
          <button 
            className="role-button candidate"
            onClick={() => navigate('/registercandidat')}
          >
            Je suis un Candidat
          </button>
          
          <button 
            className="role-button employer"
            onClick={() => navigate('/registerrecruteur')}
          >
            Je suis un Recruteur
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;