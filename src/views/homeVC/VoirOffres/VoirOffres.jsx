import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../componentsVC/header';
import Footer from '../../../componentsVC/footer';
import apiVC from '../../../service/apiVC';
import AvatarLetter from '../../../components/AvatarLetter';
import { FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaSearch, FaFilter, FaClock } from 'react-icons/fa';

const VoirOffres = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch job offers and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [offersResponse, categoriesResponse] = await Promise.all([
          apiVC.getAllOffre('/Offre'),
          apiVC.getAllcategorie()
        ]);
        
        if (Array.isArray(offersResponse.data.list)) {
          const offersWithRecruiter = offersResponse.data.list.filter(offer => offer.statut === 'ouvert');
          
          // Map categories to offers for easier access
          const processedOffers = offersWithRecruiter.map(offer => {
            // Match category by ID
            if (offer.Categorie && typeof offer.Categorie === 'string' && Array.isArray(categoriesResponse.data.list)) {
              const matchedCategory = categoriesResponse.data.list.find(cat => cat._id === offer.Categorie);
              if (matchedCategory) {
                offer.Categorie = matchedCategory;
              }
            }
            
            // Ensure recruiter has proper format for AvatarLetter
            if (offer.recruteur && !offer.recruteur.nom && offer.recruteur.Nom) {
              offer.recruteur.nom = offer.recruteur.Nom;
            }
            
            return offer;
          });
          
          setOffers(processedOffers);
          setFilteredOffers(processedOffers);
        }
        
        if (Array.isArray(categoriesResponse.data.list)) {
          setCategories(categoriesResponse.data.list);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Extract unique locations for filtering
  const locations = [...new Set(offers.map(offer => offer.localisation).filter(Boolean))];

  // Apply filters when any filter option changes
  useEffect(() => {
    let results = [...offers];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(offer => 
        offer.titre?.toLowerCase().includes(term) || 
        offer.description?.toLowerCase().includes(term) ||
        offer.recruteur?.Nom?.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      results = results.filter(offer => offer.Categorie?._id === selectedCategory);
    }
    
    // Filter by location
    if (selectedLocation) {
      results = results.filter(offer => offer.localisation === selectedLocation);
    }
    
    // Sort results
    results = sortOffers(results, sortOrder);
    
    setFilteredOffers(results);
  }, [searchTerm, selectedCategory, selectedLocation, sortOrder, offers]);

  // Sort offers based on selected order
  const sortOffers = (offersList, order) => {
    switch(order) {
      case 'newest':
        return [...offersList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...offersList].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'alphabetical':
        return [...offersList].sort((a, b) => a.titre.localeCompare(b.titre));
      default:
        return offersList;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculate days left until expiration
  const getDaysLeft = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirée';
    if (diffDays === 0) return 'Expire aujourd\'hui';
    if (diffDays === 1) return 'Expire demain';
    return `${diffDays} jours restants`;
  };

  // Get recruiter name for display
  const getRecruiterName = (recruiter) => {
    if (!recruiter) return 'Non spécifié';
    return recruiter.Nom || recruiter.nom || recruiter.name || 'Entreprise';
  };

  // Get category name for display
  const getCategoryName = (category) => {
    if (!category) return 'Non catégorisé';
    return typeof category === 'object' ? category.nom : 'Non catégorisé';
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSortOrder('newest');
  };
  
  return (
    <div className="bg-light min-vh-100">
      <Header />

      <div className="container pt-5 mt-3">
        <div className="row py-5">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 mb-3">Offres d'emploi</h1>
            <p className="lead text-muted">
              Découvrez les meilleures opportunités professionnelles et trouvez l'emploi qui correspond à vos compétences
            </p>
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
                    placeholder="Rechercher une offre, un mot-clé, une entreprise..."
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
                <div className="col-md-4">
                  <label className="form-label">Catégorie</label>
                  <select 
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.nom}
                      </option>
                    ))}
                  </select>
                    </div>
                <div className="col-md-4">
                  <label className="form-label">Lieu</label>
                  <select 
                    className="form-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Tous les lieux</option>
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Trier par</label>
                  <select 
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Plus récentes</option>
                    <option value="oldest">Plus anciennes</option>
                    <option value="alphabetical">Ordre alphabétique</option>
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

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement en cours...</span>
            </div>
            <p className="mt-3 text-muted">Chargement des offres d'emploi...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0">
                {filteredOffers.length} 
                {filteredOffers.length > 1 ? ' offres trouvées' : ' offre trouvée'}
              </p>
            </div>

            {/* Job Listings */}
            {filteredOffers.length > 0 ? (
              <div className="row">
                {filteredOffers.map((offer) => (
                  <div key={offer._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="recent-job-card">
                      <div className="job-card-header">
                        <div className="company-logo">
                          <AvatarLetter 
                            user={{
                              nom: getRecruiterName(offer.recruteur),
                              name: getRecruiterName(offer.recruteur)
                            }} 
                            customSize="50px"
                          />
                        </div>
                        <div className="job-info">
                          <Link to={`/offre/${offer._id}`} className="job-title-link">
                            <h3 className="job-title">{offer.titre}</h3>
                          </Link>
                          <p className="company-name">
                            {offer.recruteur && typeof offer.recruteur === 'object' 
                              ? getRecruiterName(offer.recruteur) 
                              : 'Entreprise'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="job-meta">
                        <div className="job-location">
                          <FaMapMarkerAlt className="meta-icon" /> {offer.localisation || 'Non spécifié'}
                        </div>
                        <div className="job-type">
                          <FaCalendarAlt className="meta-icon" /> 
                          <span className={
                            getDaysLeft(offer.date_expiration) === 'Expirée' 
                              ? 'text-danger' 
                              : getDaysLeft(offer.date_expiration) === 'Expire aujourd\'hui' || getDaysLeft(offer.date_expiration) === 'Expire demain'
                                ? 'text-warning'
                                : 'text-success'
                          }>
                            {getDaysLeft(offer.date_expiration)}
                          </span>
                        </div>
                      </div>

                      {offer.Categorie && (
                        <div className="job-category-tag">
                          {getCategoryName(offer.Categorie)}
                        </div>
                      )}
                      
                      <div className="job-description">
                        {offer.description?.length > 100 
                          ? offer.description.substring(0, 100) + '...' 
                          : offer.description}
                      </div>
                      
                      <div className="job-footer">
                        <Link to={`/offre/${offer._id}`} className="view-job-button">
                          Voir détails
                        </Link>
                        <span className="job-date">
                          <FaClock /> {formatDate(offer.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 my-5">
                <div className="display-1 text-muted mb-4">
                  <FaBuilding />
                </div>
                <h3>Aucune offre ne correspond à votre recherche</h3>
                <p className="text-muted">Essayez de modifier vos critères de recherche ou réinitialisez les filtres</p>
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .text-truncate-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 60px;
        }
        
        .job-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        
        /* Recent Jobs Section Styles */
        .recent-job-card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          height: 100%;
        }
        
        .recent-job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border-color: #8c52ff;
        }
        
        .job-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.2rem;
        }
        
        .company-logo {
          margin-right: 1rem;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .job-info {
          flex-grow: 1;
        }
        
        .job-title-link {
          text-decoration: none;
          color: inherit;
          transition: color 0.2s ease;
        }
        
        .job-title-link:hover .job-title {
          color: #8c52ff;
        }
        
        .job-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: #333;
        }
        
        .company-name {
          color: #666;
          font-size: 0.9rem;
        }
        
        .job-meta {
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
        
        .job-category-tag {
          display: inline-block;
          background-color: rgba(140, 82, 255, 0.1);
          color: #8c52ff;
          font-size: 0.75rem;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          margin-bottom: 1rem;
          font-weight: 500;
        }
        
        .job-description {
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
        
        .job-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.2rem;
        }
        
        .view-job-button {
          display: inline-block;
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
        
        .view-job-button:hover {
          background-color: #8c52ff;
          color: white;
        }
        
        .job-date {
          font-size: 0.8rem;
          color: #888;
          display: flex;
          align-items: center;
        }
        
        .job-date svg {
          margin-right: 0.3rem;
          font-size: 0.7rem;
        }
        
        .text-danger {
          color: #dc3545 !important;
        }
        
        .text-warning {
          color: #ffc107 !important;
        }
        
        .text-success {
          color: #28a745 !important;
        }
        
        .job-type span, .job-date span {
          font-size: 0.9em;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default VoirOffres;
