import React, { useState, useEffect } from 'react';
import Header from '../../../componentsVC/header';  // Importation du composant Header
import Footer from '../../../componentsVC/footer';  // Importation du composant Footer
import apiVC from '../../../service/apiVC';  // Importation du service API pour récupérer les données
import { Link } from 'react-router-dom';  // Importation de Link pour la navigation
import AvatarLetter from '../../../components/AvatarLetter';  // Importation du composant AvatarLetter
import { FaSearch, FaBuilding, FaFilter, FaBriefcase, FaMapMarkerAlt, FaUsers, FaChevronRight, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Entreprises = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sector, setSector] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const [statistics, setStatistics] = useState({
    totalCompanies: 0,
    totalJobs: 0
  });
  const [companyRatings, setCompanyRatings] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies data
        const response = await apiVC.getAllrecruteur();
        console.log("Données reçues :", response.data);

        if (Array.isArray(response.data.list)) {
          const recruiters = response.data.list;

          // Extract unique sectors for filtering
          const uniqueSectors = [...new Set(recruiters
            .map(company => company.secteur)
            .filter(Boolean))];

          setSectors(uniqueSectors);
          setCompanies(recruiters);
          setFilteredCompanies(recruiters);

          // Get statistics
          const jobsCount = recruiters.reduce((total, company) => {
            return total + (Array.isArray(company.Offre) ? company.Offre.length : 0);
          }, 0);

          setStatistics({
            totalCompanies: recruiters.length,
            totalJobs: jobsCount
          });
          // Fetch average ratings for all companies
          const ratings = {};
          await Promise.all(recruiters.map(async (company) => {
            try {
              const avisRes = await apiVC.getAvisByRecruteur(company._id);
              const avisList = Array.isArray(avisRes.data.avis) ? avisRes.data.avis : avisRes.data;
              if (avisList && avisList.length > 0) {
                const total = avisList.reduce((sum, review) => sum + review.note, 0);
                ratings[company._id] = (total / avisList.length).toFixed(1);
              } else {
                ratings[company._id] = null;
              }
            } catch (e) {
              ratings[company._id] = null;
            }
          }));
          setCompanyRatings(ratings);
        } else {
          console.error("Les données ne sont pas un tableau", response.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des entreprises :', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when search term or sector changes
  useEffect(() => {
    let results = [...companies];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(company =>
        company.Nom?.toLowerCase().includes(term) ||
        company.description?.toLowerCase().includes(term) ||
        company.secteur?.toLowerCase().includes(term)
      );
    }

    // Filter by sector
    if (sector) {
      results = results.filter(company => company.secteur === sector);
    }

    // Sort results
    switch (sortOrder) {
      case 'alphabetical':
        results.sort((a, b) => {
          const nameA = a.Nom || '';
          const nameB = b.Nom || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'jobsCount':
        results.sort((a, b) => {
          const jobsA = Array.isArray(a.Offre) ? a.Offre.length : 0;
          const jobsB = Array.isArray(b.Offre) ? b.Offre.length : 0;
          return jobsB - jobsA;
        });
        break;
      default:
        break;
    }

    setFilteredCompanies(results);
  }, [searchTerm, sector, sortOrder, companies]);

  const resetFilters = () => {
    setSearchTerm('');
    setSector('');
    setSortOrder('alphabetical');
  };

  const getJobsCount = (company) => {
    return Array.isArray(company.Offre) ? company.Offre.length : 0;
  };

  // Star rating rendering helper
  const renderStarRating = (rating) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? (
              <FaStar style={{ color: '#FFD700' }} />
            ) : i < rating ? (
              <FaStarHalfAlt style={{ color: '#FFD700' }} />
            ) : (
              <FaRegStar style={{ color: '#FFD700' }} />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-light min-vh-100">
      <Header />  {/* Affichage du composant Header */}
      
      <div className="container pt-5 mt-3">
        <div className="row py-5">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 mb-3">Entreprises partenaires</h1>  {/* Titre de la page */}
            <p className="lead text-muted">
              Découvrez les entreprises qui recrutent sur RecruitEase et leurs opportunités professionnelles
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="row mb-5">
          <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
            <div className="stat-card bg-white p-4 rounded-lg shadow-sm h-100">
              <div className="d-flex align-items-center">
                <div className="stat-icon">
                  <FaBuilding />
                </div>
                <div className="stat-content ms-3">
                  <h3 className="mb-0">{statistics.totalCompanies}</h3>
                  <p className="text-muted mb-0">Entreprises partenaires</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
            <div className="stat-card bg-white p-4 rounded-lg shadow-sm h-100">
              <div className="d-flex align-items-center">
                <div className="stat-icon">
                  <FaBriefcase />
                </div>
                <div className="stat-content ms-3">
                  <h3 className="mb-0">{statistics.totalJobs}</h3>
                  <p className="text-muted mb-0">Offres d'emploi actives</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
            <div className="stat-card bg-white p-4 rounded-lg shadow-sm h-100">
              <div className="d-flex align-items-center">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content ms-3">
                  <h3 className="mb-0">24/7</h3>
                  <p className="text-muted mb-0">Support et assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card shadow-sm mb-4 border-0 rounded-lg">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Rechercher une entreprise, un secteur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4 d-flex">
                <button
                  className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="row g-3 mt-3">
                <div className="col-md-6">
                  <label className="form-label">Secteur d'activité</label>
                  <select
                    className="form-select"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  >
                    <option value="">Tous les secteurs</option>
                    {sectors.map((sectorOption, index) => (
                      <option key={index} value={sectorOption}>
                        {sectorOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Trier par</label>
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="alphabetical">Ordre alphabétique</option>
                    <option value="jobsCount">Nombre d'offres</option>
                  </select>
                </div>
                <div className="col-12 text-end">
                  <button
                    className="btn btn-sm btn-link text-decoration-none"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <p className="mb-0">
            {filteredCompanies.length}
            {filteredCompanies.length > 1 ? ' entreprises trouvées' : ' entreprise trouvée'}
          </p>
        </div>

        {/* Companies List */}
            {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement en cours...</span>
            </div>
            <p className="mt-3 text-muted">Chargement des entreprises...</p>
          </div>
        ) : (
              <div className="row">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <div key={company._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="company-card">
                    <div className="company-card-header">
                      <div className="company-logo">
                        <AvatarLetter
                          user={company}
                          customSize="80px"
                          style={{
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            border: '2px solid white',
                            fontSize: '1.8rem'
                          }}
                        />
                      </div>
                      <div className="company-info">
                        <h3 className="company-name">{company.Nom}</h3>
                        {company.secteur && (
                          <span className="company-sector">{company.secteur}</span>
                        )}
                        {/* Star rating below company name */}
                        <div className="company-rating mt-1">
                          {companyRatings[company._id] ? (
                            <>
                              {renderStarRating(companyRatings[company._id])}
                              <span style={{ marginLeft: 6, color: '#888', fontSize: '0.95em' }}>{companyRatings[company._id]}</span>
                            </>
                          ) : (
                            <span style={{ color: '#ccc', fontSize: '0.95em' }}>{renderStarRating(0)}<span style={{ marginLeft: 6 }}>Aucun avis</span></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="company-meta">
                      {company.Adresse && (
                        <div className="company-location">
                          <FaMapMarkerAlt className="meta-icon" /> {company.Adresse}
                        </div>
                      )}
                      <div className="company-jobs">
                        <FaBriefcase className="meta-icon" /> {getJobsCount(company)} offres d'emploi
                      </div>
                    </div>

                    <div className="company-description">
                      {company.description ?
                        (company.description.length > 120 ?
                          `${company.description.substring(0, 120)}...` :
                          company.description) :
                        "Entreprise partenaire de RecruitEase. Consultez la page détaillée pour plus d'informations."}
                    </div>

                    <div className="company-footer">
                      <Link to={`/recruteur/${company._id}`} className="view-company-button">
                        Voir détails <FaChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <div className="empty-state">
                  <FaBuilding size={50} className="text-muted mb-3" />
                  <h3>Aucune entreprise trouvée</h3>
                  <p className="text-muted">Aucune entreprise ne correspond à vos critères de recherche.</p>
                  <button
                    className="btn btn-outline-primary mt-3"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

      <style jsx>{`
        .stat-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #8c52ff;
          background-color: rgba(140, 82, 255, 0.1);
          border-radius: 12px;
        }
        
        .company-card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .company-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border-color: #8c52ff;
        }
        
        .company-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.2rem;
        }
        
        .company-logo {
          margin-right: 1rem;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .company-info {
          flex-grow: 1;
        }
        
        .company-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: #333;
        }
        
        .company-sector {
          display: inline-block;
          background-color: rgba(140, 82, 255, 0.1);
          color: #8c52ff;
          font-size: 0.75rem;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .company-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #666;
        }
        
        .meta-icon {
          margin-right: 0.4rem;
          color: #8c52ff;
        }
        
        .company-description {
          font-size: 0.95rem;
          color: #444;
          margin-bottom: 1.5rem;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 60px;
        }
        
        .company-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 1.2rem;
        }
        
        .view-company-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.2rem;
          background-color: transparent;
          color: #8c52ff;
          border: 1px solid #8c52ff;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        
        .view-company-button:hover {
          background-color: #8c52ff;
          color: white;
        }
        
        .empty-state {
          padding: 3rem 1rem;
        }
      `}</style>

      <Footer />  {/* Affichage du composant Footer */}
    </div>
  );
};

export default Entreprises;  // Export du composant Entreprises
