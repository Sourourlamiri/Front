import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../componentsVC/header';
import Footer from '../../componentsVC/footer';
import Carousel from 'react-bootstrap/Carousel';
import { 
  FaSearch, FaMapMarkerAlt, FaBriefcase, FaBuilding, 
  FaUser, FaChartBar, FaUserTie, FaCheck, FaLightbulb, 
  FaClock, FaChevronRight, FaRegUser, FaRegBuilding,
  FaCalendarAlt, FaStar, FaArrowRight
} from 'react-icons/fa';
import apiVC from "../../service/apiVC";
import { Link } from 'react-router-dom';
import './homeVC.css';
import AvatarLetter from '../../components/AvatarLetter';

const HomeVC = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    jobs: 0,
    recruiters: 0,
    placements: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedData = JSON.parse(localStorage.getItem('utilisateur'));
    const userFromStorage = storedData?.utilisateur;
    if (userFromStorage) {
      setUser(userFromStorage);
    }

    const fetchData = async () => {
      try {
        // Fetch featured jobs, categories, recruiters and statistics
        const [jobsResponse, categoriesResponse, recruitersResponse] = await Promise.all([
          apiVC.getAllOffre('/Offre'),
          apiVC.getAllcategorie(),
          apiVC.getAllrecruteur('/recruteur')
        ]);
        
        // Process jobs data
        if (Array.isArray(jobsResponse.data.list)) {
          const activeJobs = jobsResponse.data.list.filter(job => job.statut === 'ouvert');
          
          // Create a map of recruiter IDs to full recruiter objects
          const recruitersMap = {};
          if (Array.isArray(recruitersResponse.data.list)) {
            recruitersResponse.data.list.forEach(recruiter => {
              recruitersMap[recruiter._id] = recruiter;
            });
          }
          
          // Process jobs to ensure recruiter data is populated
          const processedJobs = activeJobs.map(job => {
            // If recruiter is just an ID, replace with full object
            if (job.recruteur && typeof job.recruteur === 'string') {
              job.recruteur = recruitersMap[job.recruteur] || { _id: job.recruteur };
            }
            
            // Match category by ID if needed
            if (job.Categorie && typeof job.Categorie === 'string' && Array.isArray(categoriesResponse.data.list)) {
              const matchedCategory = categoriesResponse.data.list.find(cat => cat._id === job.Categorie);
              if (matchedCategory) {
                job.Categorie = matchedCategory;
              }
            }
            
            return job;
          });
          
          // Set featured jobs (can be based on some criteria like premium status)
          setFeaturedJobs(processedJobs.slice(0, 6)); 
          
          // Set recent jobs sorted by creation date
          const sortedByDate = [...processedJobs].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Log first job's recruiter info to debug structure
          if (sortedByDate.length > 0 && sortedByDate[0].recruteur) {
            console.log('Recruiter data structure:', sortedByDate[0].recruteur);
          }
          
          setRecentJobs(sortedByDate.slice(0, 6));
          
          // Set statistics
          setStatistics({
            jobs: activeJobs.length,
            recruiters: recruitersResponse.data.total || (Array.isArray(recruitersResponse.data.list) ? recruitersResponse.data.list.length : 0),
            placements: Math.floor(activeJobs.length * 0.7) // Simple calculation for demo purposes
          });
        }
        
        // Process categories data
        if (Array.isArray(categoriesResponse.data.list)) {
          setCategories(categoriesResponse.data.list);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/VoirOffres?query=${searchQuery}&category=${selectedCategory}&location=${selectedLocation}`);
  };

  // Get unique locations from jobs
  const locations = [...new Set(featuredJobs.map(job => job.localisation).filter(Boolean))];

  // Helper function to get recruiter name
  const getRecruiterName = (recruiter) => {
    if (!recruiter) return 'Non spécifié';
    
    // Check for common property patterns in the recruiter object
    if (recruiter.Nom) return recruiter.Nom;
    if (recruiter.nom) return recruiter.nom;
    if (recruiter.name) return recruiter.name;
    if (recruiter.raisonSociale) return recruiter.raisonSociale;
    
    // If we have an ID but no name properties, it might be that the full object isn't being populated
    if (recruiter._id) return 'Entreprise';
    
    // Last fallback
    return 'Entreprise';
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculate days left until expiration
  const getDaysLeft = (expirationDate) => {
    if (!expirationDate) return 'Non spécifié';
    
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirée';
    if (diffDays === 0) return 'Expire aujourd\'hui';
    if (diffDays === 1) return 'Expire demain';
    return `${diffDays} jours restants`;
  };

  return (
    <div className={`site-wrapper ${isLoading ? 'loading' : 'loaded'}`}>
      {isLoading ? (
        <div className="loader">
          <div className="loader-circle"></div>
          <p>Chargement de RecruitEase...</p>
        </div>
      ) : (
        <>
         <Header />
          
          {/* Enhanced Hero Section with Carousel */}
          <section className="hero-section">
            <Carousel id="carouselExampleControls" interval={5000} fade controls={true} indicators={true}>
  <Carousel.Item>
                <div className="carousel-image-container">
    <img
                    className="d-block w-100"
      src="/assets/images/backgrounds/V1.jpg"
      alt="Première slide"
    />
                  <div className="carousel-overlay">
                    <div className="carousel-content">
                      <h1>Trouvez votre emploi idéal</h1>
                      <p>Des milliers d'opportunités professionnelles vous attendent</p>
                      {!user ? (
                        <Link to="/registerPage" className="carousel-button">
                          <span>Commencer maintenant</span>
                          <FaArrowRight />
                        </Link>
                      ) : (
                        <Link to="/VoirOffres" className="carousel-button">
                          <span>Explorer les offres</span>
                          <FaArrowRight />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
  </Carousel.Item>
  <Carousel.Item>
                <div className="carousel-image-container">
    <img
                    className="d-block w-100"
      src="/assets/images/backgrounds/v2.jpg"
      
      alt="Deuxième slide"
    />
                  <div className="carousel-overlay">
                    <div className="carousel-content">
                      <h1>Recrutez les meilleurs talents</h1>
                      <p>Une plateforme optimisée pour vos besoins de recrutement</p>
                      {!user ? (
                        <Link to="/login" className="carousel-button">
                          <span>Espace recruteur</span>
                          <FaArrowRight />
                        </Link>
                      ) : user.role === 'recruteur' ? (
                        <Link to="/homerecruteur" className="carousel-button">
                          <span>Mon espace recruteur</span>
                          <FaArrowRight />
                        </Link>
                      ) : (
                        <Link to="/VoirOffres" className="carousel-button">
                          <span>Explorer les offres</span>
                          <FaArrowRight />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
  </Carousel.Item>
</Carousel>
          </section>
          
          {/* Simple Inline Filter */}
          <section className="inline-filter-section">
            <div className="container">
              <form onSubmit={handleSearch} className="inline-filter-form">
                <div className="inline-filter-group">
                  <div className="filter-input">
                    <FaSearch className="filter-icon" />
                    <input
                      type="text"
                      placeholder="Rechercher par mot-clé"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-select">
                    <FaBriefcase className="filter-icon" />
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="filter-dropdown"
                    >
                      <option value="">Toutes catégories</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-select">
                    <FaMapMarkerAlt className="filter-icon" />
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="filter-dropdown"
                    >
                      <option value="">Tous lieux</option>
                      {locations.map(location => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button type="submit" className="filter-button">
                    <FaSearch /> Rechercher
                  </button>
                </div>
              </form>
            </div>
          </section>
          
          {/* Statistics Section */}
          <section className="stats-section">
            <div className="container">
              <div className="stats-container">
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaBriefcase />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.jobs}</h3>
                    <p>Offres actives</p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaBuilding />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.recruiters}</h3>
                    <p>Entreprises</p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaCheck />
                  </div>
                  <div className="stat-content">
                    <h3>{statistics.placements}</h3>
                    <p>Candidatures réussies</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Recent Jobs Section (Redesigned) */}
          <section className="recent-jobs-section">
            <div className="container">
              <div className="section-header">
                <h2>Dernières offres</h2>
                <Link to="/VoirOffres?sort=newest" className="view-all-link">
                  Voir toutes les offres récentes <FaChevronRight />
                </Link>
              </div>
              
              <div className="recent-jobs-slider">
                {recentJobs.length > 0 ? (
                  <div className="recent-jobs-grid">
                    {recentJobs.map((job) => (
                      <div key={job._id} className="recent-job-card">
                        <div className="ribbon">
                          <span>Nouveau</span>
                        </div>
                        <div className="job-card-header">
                          <div className="company-logo">
                            <AvatarLetter 
                              user={{
                                nom: getRecruiterName(job.recruteur),
                                name: getRecruiterName(job.recruteur)
                              }} 
                              customSize="50px"
                            />
                          </div>
                          <div className="job-info">
                            <Link to={`/offre/${job._id}`} className="job-title-link">
                              <h3 className="job-title">{job.titre}</h3>
                            </Link>
                            <p className="company-name">
                              {job.recruteur && typeof job.recruteur === 'object' 
                                ? getRecruiterName(job.recruteur) 
                                : 'Entreprise'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="job-meta">
                          <div className="job-location">
                            <FaMapMarkerAlt className="meta-icon" /> {job.localisation || 'Non spécifié'}
                          </div>
                          <div className="job-type">
                            <FaCalendarAlt className="meta-icon" /> 
                            <span className={
                              getDaysLeft(job.date_expiration) === 'Expirée' 
                                ? 'text-danger' 
                                : getDaysLeft(job.date_expiration) === 'Expire aujourd\'hui' || getDaysLeft(job.date_expiration) === 'Expire demain'
                                  ? 'text-warning'
                                  : 'text-success'
                            }>
                              {getDaysLeft(job.date_expiration)}
                            </span>
                          </div>
                        </div>

                        {job.Categorie && (
                          <div className="job-category-tag">
                            {job.Categorie.nom}
                          </div>
                        )}
                        
                        <div className="job-footer">
                          <Link to={`/offre/${job._id}`} className="view-job-button">
                            Voir détails
                          </Link>
                          <span className="job-date">
                            <FaClock /> {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-jobs-message">Aucune offre d'emploi récente disponible pour le moment.</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Featured Jobs Section - KEPT AS IS */}
          <section className="featured-jobs-section">
            <div className="container">
              <div className="section-header">
                <div className="section-title-group">
                  <h2>Offres d'emploi à la une</h2>
                  <div className="section-title-badge">
                    <FaStar className="star-icon" /> Recommandé
                  </div>
                </div>
                <Link to="/VoirOffres" className="view-all-link">
                  Voir toutes les offres <FaChevronRight />
                </Link>
              </div>
              
              <div className="jobs-grid">
                {featuredJobs.length > 0 ? (
                  featuredJobs.map((job) => (
                    <div key={job._id} className="job-card">
                      <div className="job-card-header">
                        <div className="company-logo">
                          <AvatarLetter 
                            user={{
                              nom: getRecruiterName(job.recruteur),
                              name: getRecruiterName(job.recruteur)
                            }} 
                            customSize="50px"
                          />
                        </div>
                        <div className="job-info">
                          <h3 className="job-title">{job.titre}</h3>
                          <p className="company-name">
                            {job.recruteur && typeof job.recruteur === 'object' 
                              ? getRecruiterName(job.recruteur) 
                              : 'Entreprise'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="job-details">
                        <span className="job-location">
                          <FaMapMarkerAlt /> {job.localisation || 'Non spécifié'}
                        </span>
                        <span className="job-category">
                          {job.Categorie?.nom || 'Non catégorisé'}
                        </span>
                        <span className="job-date">
                          <FaCalendarAlt /> 
                          <span className={
                            getDaysLeft(job.date_expiration) === 'Expirée' 
                              ? 'text-danger' 
                              : getDaysLeft(job.date_expiration) === 'Expire aujourd\'hui' || getDaysLeft(job.date_expiration) === 'Expire demain'
                                ? 'text-warning'
                                : 'text-success'
                          }>
                            {getDaysLeft(job.date_expiration)}
                          </span>
                        </span>
                      </div>
                      
                      <div className="job-description">
                        {job.description?.length > 100 
                          ? job.description.substring(0, 100) + '...' 
                          : job.description}
                      </div>
                      
                      <Link to={`/offre/${job._id}`} className="view-job-button">
                        Voir détails
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="no-jobs-message">Aucune offre d'emploi disponible pour le moment.</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Value Proposition Section - KEPT AS IS */}
          <section className="value-prop-section">
            <div className="container">
      <div className="row">
                <div className="col-md-6">
                  <div className="value-content">
                    <h2>Pourquoi choisir RecruitEase?</h2>
                    <p className="value-description">
                      Notre plateforme simplifie le processus de recrutement grâce à l'intelligence artificielle
                      pour vous aider à trouver le job parfait ou le candidat idéal.
                    </p>
                    
                    <div className="value-features">
                      <div className="value-feature">
                        <div className="feature-icon">
                          <FaLightbulb />
                        </div>
                        <div className="feature-text">
                          <h4>IA intelligente</h4>
                          <p>Notre technologie analyse les CV et les offres pour des correspondances précises</p>
                        </div>
                      </div>
                      
                      <div className="value-feature">
                        <div className="feature-icon">
                          <FaUserTie />
                        </div>
                        <div className="feature-text">
                          <h4>Profils vérifiés</h4>
                          <p>Des candidats et des employeurs vérifiés pour une expérience sécurisée</p>
                        </div>
                      </div>
                      
                      <div className="value-feature">
                        <div className="feature-icon">
                          <FaChartBar />
                        </div>
                        <div className="feature-text">
                          <h4>Statistiques détaillées</h4>
                          <p>Suivez l'évolution de vos candidatures et recrutements</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="value-cta">
                      {!user ? (
                        <Link to="/registerPage" className="register-button">
                          Créer un compte gratuitement
                        </Link>
                      ) : (
                        <Link to="/VoirOffres" className="register-button">
                          Explorer les offres
        </Link>
                      )}
      </div>
    </div>
  </div>
                
                <div className="col-md-6 d-none d-md-block">
                  <div className="value-image">
                    <img src="\assets\images\backgrounds/aa.jpg" alt="RecruitEase Platform"
                     style={{ height: '80%', width: '100%', objectFit: 'cover' }}  />
                  </div>
                </div>
              </div>
      </div>
    </section>
  
          {/* Categories Section - KEPT AS IS */}
          <section className="categories-section">
            <div className="container">
              <div className="section-header">
                <h2>Explorer par catégorie</h2>
              </div>
              
              <div className="categories-grid">
                {categories.slice(0, 8).map((category) => (
                  <Link 
                    to={`/VoirOffres?category=${category._id}`} 
                    key={category._id} 
                    className="category-card"
                  >
                    <div className="category-icon">
                      <FaBriefcase />
                    </div>
                    <h3 className="category-name">{category.nom}</h3>
                    <span className="category-count">
                      {featuredJobs.filter(job => job.Categorie?._id === category._id).length} offres
                    </span>
                  </Link>
                ))}
              </div>
  </div>
          </section>
          
          {/* Access Section - Only show if user is not logged in */}
          {!user && (
            <section className="access-section">
              <div className="container">
                <div className="access-container">
                  <div className="access-content">
                    <h2>Accédez à toutes les fonctionnalités</h2>
                    <div className="access-options">
                      <div className="access-option">
                        <div className="access-icon">
                          <FaRegUser />
                        </div>
                        <h3>Espace candidat</h3>
                        <p>Trouvez votre emploi idéal et suivez vos candidatures</p>
                        <Link to="/login" className="access-button candidate-button">
                          Se connecter
                        </Link>
                      </div>
                      
                      <div className="access-option">
                        <div className="access-icon">
                          <FaRegBuilding />
                        </div>
                        <h3>Espace recruteur</h3>
                        <p>Publiez des offres et trouvez les meilleurs talents</p>
                        <Link to="/login" className="access-button recruiter-button">
                          Se connecter
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          <Footer />
        </>
      )}
    </div>
  );
};

export default HomeVC;