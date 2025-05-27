// components/footer.jsx
import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './footer.css';

/**
 * Composant Footer - Pied de page de l'application
 * 
 * Ce composant affiche le pied de page simplifié qui contient:
 * - Informations sur RecruitEase
 * - Liens de navigation
 * - Liens légaux 
 * - Liens vers les réseaux sociaux
 * - Copyright
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const [hoveredIcon, setHoveredIcon] = useState(null);
  
  useEffect(() => {
    // Modifier dynamiquement le lien Contact pour ouvrir le mail
    const contactLink = document.querySelector('.footer-links a[href="#contact"]');
    if (contactLink) {
      contactLink.setAttribute('href', 'https://web.whatsapp.com/');
    }
  }, []);
  
  const styles = {
    footer: {
      backgroundColor: '#f8f9fa',
      fontFamily: 'Montserrat, sans-serif',
      padding: '2.5rem 0 1.5rem',
      marginTop: '2rem',
      position: 'relative',
      overflow: 'hidden'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      flexWrap: 'wrap'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#333',
      letterSpacing: '-0.5px',
      marginBottom: '1.5rem'
    },
    accent: {
      color: '#8c52ff',
      marginRight: '2px'
    },
    links: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '1.5rem'
    },
    link: {
      color: '#555',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: 500
    },
    social: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    socialIcon: (isHovered) => ({
      color: isHovered ? '#fff' : '#777',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: isHovered ? '#8c52ff' : '#fff',
      boxShadow: isHovered 
        ? '0 5px 15px rgba(140, 82, 255, 0.2)' 
        : '0 2px 10px rgba(0, 0, 0, 0.05)',
      transform: isHovered ? 'translateY(-3px)' : 'none',
      transition: 'all 0.3s ease'
    }),
    bottom: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 2rem 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      flexWrap: 'wrap'
    },
    copyright: {
      color: '#888',
      fontSize: '0.8rem',
      marginBottom: '0.5rem'
    },
    madeWith: {
      color: '#888',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      marginBottom: '0.5rem'
    },
    heart: {
      color: '#ff6b6b',
      fontSize: '0.7rem'
    }
  };

  const socialIcons = [
    {
      key: 'facebook',
      icon: <FaFacebookF />,
      label: 'Facebook',
      url: 'https://www.facebook.com/'
    },
    {
      key: 'twitter',
      icon: <FaTwitter />,
      label: 'Twitter',
      url: 'https://twitter.com/'
    },
    {
      key: 'instagram',
      icon: <FaInstagram />,
      label: 'Instagram',
      url: 'https://www.instagram.com/'
    },
    {
      key: 'linkedin',
      icon: <FaLinkedinIn />,
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/'
    }
  ];
  
  return (
    <footer className="footer" style={styles.footer}>
      <div className="footer-content" style={styles.footerContent}>
        <div className="footer-brand">
          <div className="logo" style={styles.logo}>
            <span className="accent" style={styles.accent}>Recruit</span>Ease
          </div>
        </div>
        
        <div className="footer-links" style={styles.links}>
          <Link to="/homeVC" style={styles.link}>Accueil</Link>
          <Link to="/VoirOffres" style={styles.link}>Offres</Link>
          <Link to="/entreprises" style={styles.link}>Entreprises</Link>
          <a href="#contact" style={styles.link}>Contact</a>
        </div>
        
        <div className="footer-social" style={styles.social}>
          {socialIcons.map(item => (
            <a 
              key={item.key}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              style={styles.socialIcon(hoveredIcon === item.key)}
              onMouseEnter={() => setHoveredIcon(item.key)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
      
      <div className="footer-bottom" style={styles.bottom}>
        <div className="copyright" style={styles.copyright}>
          © {currentYear} RecruitEase
        </div>
        <div className="made-with" style={styles.madeWith}>
          Fait avec <FaHeart className="heart-icon" style={styles.heart} /> pour simplifier le recrutement
        </div>
      </div>
    </footer>
  );
};

export default Footer;