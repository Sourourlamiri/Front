import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Define styles as an object
const styles = {
  sidebarContainer: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    left: '0',
    top: '0',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: '1000',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  sidebarHeader: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  logoImg: {
    maxWidth: '80%',
    objectFit: 'contain',
  },
  sidebarDivider: {
    padding: '1rem 1rem 0.5rem',
    opacity: '0.7',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#909090',
    letterSpacing: '1px',
    marginTop: '1rem',
  },
  sidebarTitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sidebarNav: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem 0',
  },
  sidebarMenu: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    width: '100%',
  },
  sidebarItem: {
    margin: '0.2rem 0',
    position: 'relative',
    width: '100%',
  },
  active: {
    backgroundColor: '#f0f2fa',
  },
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.8rem 1rem',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '5px',
    margin: '0 0.5rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    justifyContent: 'flex-start',
  },
  sidebarIcon: {
    minWidth: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: '#5D87FF',
    marginRight: '0.75rem',
  },
  sidebarText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'opacity 0.3s ease',
  },
  activeIndicator: {
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '60%',
    backgroundColor: '#5D87FF',
    borderRadius: '4px 0 0 4px',
  },
};

const SideBar = () => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');

  useEffect(() => {
    // Set active menu based on current path
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') setActiveMenu('dashboard');
    else if (path.includes('listRecruteurs')) setActiveMenu('recruteurs');
    else if (path.includes('listCandidats')) setActiveMenu('candidats');
  }, [location]);

  return (
    <div style={styles.sidebarContainer}>
      <div style={styles.sidebarHeader}>
          <img 
            src="../assets/images/logos/4.svg" 
          width={160}
            alt="Logo" 
          style={styles.logoImg}
          />
        </div>

      <div style={styles.sidebarDivider}>
        <span style={styles.sidebarTitle}>
          MENU PRINCIPAL
        </span>
      </div>

      <nav style={styles.sidebarNav}>
        <ul style={styles.sidebarMenu}>
          <li style={{
            ...styles.sidebarItem,
            ...(activeMenu === 'dashboard' ? styles.active : {})
          }}>
            <Link
              style={styles.sidebarLink}
              to="/"
            >
              <div style={styles.sidebarIcon}>
                <i className="ti ti-dashboard"></i>
              </div>
              <span style={styles.sidebarText}>
                Tableau de bord
    </span>
              {activeMenu === 'dashboard' && <span style={styles.activeIndicator}></span>}
  </Link>
          </li>

          <li style={{
            ...styles.sidebarItem,
            ...(activeMenu === 'recruteurs' ? styles.active : {})
          }}>
            <Link
              style={styles.sidebarLink}
              to="/listRecruteurs"
            >
              <div style={styles.sidebarIcon}>
                <i className="ti ti-user-circle"></i>
              </div>
              <span style={styles.sidebarText}>
                Recruteurs
    </span>
              {activeMenu === 'recruteurs' && <span style={styles.activeIndicator}></span>}
  </Link>
</li>

          <li style={{
            ...styles.sidebarItem,
            ...(activeMenu === 'candidats' ? styles.active : {})
          }}>
            <Link
              style={styles.sidebarLink}
              to="/listCandidats"
            >
              <div style={styles.sidebarIcon}>
                <i className="ti ti-users"></i>
              </div>
              <span style={styles.sidebarText}>
                Candidats
              </span>
              {activeMenu === 'candidats' && <span style={styles.activeIndicator}></span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
