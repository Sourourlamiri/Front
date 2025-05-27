import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Row, Col, Container, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiRecruteurinterface from '../../../service/apiRecruteurinterface';
import apiCandidat from '../../../service/apiCandidat';
import { useParams } from 'react-router-dom';
import apiVC from '../../../service/apiVC';

const ListeCandidatsRecruteur = () => {
  const { id } = useParams();
  const [candidats, setCandidats] = useState([]);
  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIAResult, setShowIAResult] = useState(false);

  useEffect(() => {
    const fetchOffre = async () => {
      try {
        const response = await apiVC.getOffreById(id);
        console.log('Détails de l\'offre:', response.data.getOffre);
        setOffre(response.data.getOffre);
        console.log(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'offre', error);
      }
    };

    fetchOffre();
  }, [id]);

  const fetchCandidats = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/match_score");
      const data = await response.json();

      const idCondidats = data.data.map((c) => ({
        cv_id: c.cv_id,
        score: c.score,
      }));

      const candidatures = await Promise.all(
        idCondidats.map(async ({ cv_id, score }) => {
          const res = await apiRecruteurinterface.getByICandidateur(cv_id);
          const candidature = res.data;

          const candidatArray = candidature?.getCandidature?.Candidat;
          if (!Array.isArray(candidatArray) || candidatArray.length === 0) {
            return { ...candidature, candidatDetails: null, score };
          }

          const candidatId = candidatArray[0];
          try {
            const resCandidat = await apiCandidat.getByIdCandidat(candidatId);
            return {
              ...candidature,
              candidatDetails: resCandidat.data.getCandidat,
              score: score,
              cv_id: cv_id
            };
          } catch {
            return { ...candidature, candidatDetails: null, score, cv_id };
          }
        })
      );
      console.log('Candidatures récupérées:', candidatures);
      // Remove duplicates by cv_id
      const candidaturesUniques = candidatures.filter(
        (item, index, self) =>
          index === self.findIndex((c) =>  c.candidatDetails!=null && c.candidatDetails?.Email === item.candidatDetails?.Email)
      );
      console.log('Candidatures récupérées:', candidaturesUniques);

      setCandidats(candidaturesUniques);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'acceptée':
        return <Badge bg="success" className="rounded-pill px-3 py-2">Acceptée</Badge>;
      case 'rejetée':
        return <Badge bg="danger" className="rounded-pill px-3 py-2">Rejetée</Badge>;
      default:
        return <Badge bg="warning" className="rounded-pill px-3 py-2">En attente</Badge>;
    }
  };

  const handleAccepter = (candidatureId) => {
    console.log(`Candidature acceptée : ${candidatureId}`);
    apiRecruteurinterface.updateCandidatureStatus(candidatureId, 'acceptée')
      .then((response) => {
        console.log('Statut mis à jour avec succès:', response.data);
        // Refresh the list or update UI
        const updatedOffre = { ...offre };
        if (updatedOffre.Candidature) {
          updatedOffre.Candidature = updatedOffre.Candidature.map(cand => {
            if (cand._id === candidatureId) {
              return { ...cand, statut: 'acceptée' };
            }
            return cand;
          });
          setOffre(updatedOffre);
        }

        // Also update AI candidates list if showing
        if (showIAResult) {
          setCandidats(prevCandidats =>
            prevCandidats.map(cand => {
              if (cand.getCandidature && cand.getCandidature._id === candidatureId) {
                return {
                  ...cand,
                  getCandidature: {
                    ...cand.getCandidature,
                    statut: 'acceptée'
                  }
                };
              }
              return cand;
            })
          );
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      });
  };

  const handleRefuser = (candidatureId) => {
    console.log(`Candidature refusée : ${candidatureId}`);
    apiRecruteurinterface.updateCandidatureStatus(candidatureId, 'rejetée')
      .then((response) => {
        console.log('Statut mis à jour avec succès:', response.data);
        // Refresh the list or update UI
        const updatedOffre = { ...offre };
        if (updatedOffre.Candidature) {
          updatedOffre.Candidature = updatedOffre.Candidature.map(cand => {
            if (cand._id === candidatureId) {
              return { ...cand, statut: 'rejetée' };
            }
            return cand;
          });
          setOffre(updatedOffre);
        }

        // Also update AI candidates list if showing
        if (showIAResult) {
          setCandidats(prevCandidats =>
            prevCandidats.map(cand => {
              if (cand.getCandidature && cand.getCandidature._id === candidatureId) {
                return {
                  ...cand,
                  getCandidature: {
                    ...cand.getCandidature,
                    statut: 'rejetée'
                  }
                };
              }
              return cand;
            })
          );
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      });
  };

  const handleRunIA = () => {
    setShowIAResult(true);
    fetchCandidats();
  };

  const renderActionButtons = (candidature, id) => {
    const status = candidature?.statut;

    if (status === 'en attente') {
      return (
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            className="rounded-pill d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px' }}
            onClick={() => handleAccepter(id)}
            aria-label="Accepter"
          >
            <i className="ti ti-check"></i>
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="rounded-pill d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px' }}
            onClick={() => handleRefuser(id)}
            aria-label="Refuser"
          >
            <i className="ti ti-x"></i>
          </Button>
        </div>
      );
    } else if (status === 'acceptée') {
      return (
        <Button
          variant="outline-danger"
          size="sm"
          className="rounded-pill"
          onClick={() => handleRefuser(id)}
        >
          <i className="ti ti-x me-1"></i>
          Refuser
        </Button>
      );
    } else if (status === 'rejetée') {
      return (
        <Button
          variant="outline-success"
          size="sm"
          className="rounded-pill"
          onClick={() => handleAccepter(id)}
        >
          <i className="ti ti-check me-1"></i>
          Accepter
        </Button>
      );
    }
    return null;
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white p-4 border-0">
          <h3 className="mb-3 fw-bold">Liste des Candidats pour l'Offre</h3>
          {offre && (
            <div className="text-muted">
              <span className="fw-semibold">{offre.Intitule}</span>
              {offre.Categorie && offre.Categorie[0]?.Nom && (
                <Badge bg="info" className="ms-2 rounded-pill">{offre.Categorie[0].Nom}</Badge>
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          <div className="d-flex justify-content-end p-3 bg-light border-bottom">
            {!showIAResult ? (
              <Button
                variant="primary"
                className="rounded-pill d-flex align-items-center"
                onClick={handleRunIA}
              >
                <i className="ti ti-robot me-2"></i>
                Filtrer les CV avec l'IA
              </Button>
            ) : (
              <Button
                variant="outline-secondary"
                className="rounded-pill"
                onClick={() => setShowIAResult(false)}
              >
                <i className="ti ti-arrow-left me-2"></i>
                Retour à la liste classique
              </Button>
            )}
          </div>

          {!showIAResult && (
            <>
              {offre?.Candidature?.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Prénom</th>
                        <th className="px-4 py-3">CIN</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">CV</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offre.Candidature.filter(cand => cand?.Candidat?.[0]!=null).map((cand, index) => {
                        const candidat = cand?.Candidat?.[0];
                        return (
                          <tr key={index} className="border-bottom">
                            <td className="px-4 py-3 text-muted">{index + 1}</td>
                            <td className="px-4 py-3 fw-medium">{candidat?.Nom}</td>
                            <td className="px-4 py-3 fw-medium">{candidat?.Prenom}</td>
                            <td className="px-4 py-3 text-muted">{candidat?.CIN}</td>
                            <td className="px-4 py-3">
                              <span className="text-primary">{candidat?.Email}</span>
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={`${process.env.REACT_APP_BACKEND_URL}/file/${cand?.Cv}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary rounded-pill"
                                aria-label="Voir le CV"
                              >
                                <i className="ti ti-file-text me-1"></i>
                                Voir CV
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(cand?.statut)}
                            </td>
                            <td className="px-4 py-3 text-end">
                              {renderActionButtons(cand, cand._id)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="p-5 text-center">
                  <div className="py-5">
                    <i className="ti ti-file-off text-muted mb-3" style={{ fontSize: '48px' }}></i>
                    <h5>Aucune candidature</h5>
                    <p className="text-muted">Aucun candidat n'a encore postulé pour cette offre</p>
                  </div>
                </div>
              )}
            </>
          )}

          {showIAResult && (
            <>
              {loading ? (
                <div className="p-5 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-3">Analyse des CV en cours...</p>
                </div>
              ) : candidats.length > 0 ? (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Prénom</th>
                        <th className="px-4 py-3">CIN</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">CV</th>
                        <th className="px-4 py-3">Match IA</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidats.map((candidat, index) => (
                        <tr key={index} className="border-bottom">
                          <td className="px-4 py-3 text-muted">{index + 1}</td>
                          <td className="px-4 py-3 fw-medium">{candidat.candidatDetails?.Nom}</td>
                          <td className="px-4 py-3 fw-medium">{candidat.candidatDetails?.Prenom}</td>
                          <td className="px-4 py-3 text-muted">{candidat.candidatDetails?.CIN}</td>
                          <td className="px-4 py-3">
                            <span className="text-primary">{candidat.candidatDetails?.Email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`${process.env.REACT_APP_BACKEND_URL}/file/${candidat.getCandidature.Cv}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary rounded-pill"
                              aria-label="Voir le CV"
                            >
                              <i className="ti ti-file-text me-1"></i>
                              Voir CV
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="progress flex-grow-1"
                                style={{ height: '8px', width: '80px' }}
                              >
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${candidat.score}%` }}
                                ></div>
                              </div>
                              <span className="ms-2 fw-medium">{(candidat.score).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(candidat.getCandidature?.statut)}
                          </td>
                          <td className="px-4 py-3 text-end">
                            {renderActionButtons(candidat.getCandidature, candidat.getCandidature._id)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="p-5 text-center">
                  <div className="py-5">
                    <i className="ti ti-file-off text-muted mb-3" style={{ fontSize: '48px' }}></i>
                    <h5>Aucun résultat</h5>
                    <p className="text-muted">Aucun candidat correspondant n'a été trouvé par l'IA</p>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListeCandidatsRecruteur;
