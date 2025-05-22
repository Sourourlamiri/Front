import React, { useEffect, useState } from 'react';
import administrateur from '../../service/administrateur';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

const Layout = () => {
  // recruteur
  const [recreture, setRecreture] = useState({
    labels: [],
    datasets: [],
  });

  // Candidat
  const [Candidat, setCandidat] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "rgba(255,99,132,0.6)",  // Rose
          "rgba(186,85,211,0.6)",  // Mauve
        ],
        borderColor: [
          "rgba(255,99,132,0.6)",  // Rose
          "rgba(186,85,211,0.6)",  // Mauve
        ],
        borderWidth: 1,
      },
    ],
  });

  // Nombre de candidatures par offre
  const [offres, setOffres] = useState([]);

  const fetchStatistics = async () => {
    try {
      // Récupérer le nombre de recruteurs
      const responseRecruteur = await administrateur.countRecreture();
      const dataRecruteur = responseRecruteur.data;
      console.log('Recruteur Data:', dataRecruteur); 

      // Récupérer le nombre de candidats
      const responseCandidat = await administrateur.countCandidat();
      const dataCandidat = responseCandidat.data;
      console.log('Candidat Data:', dataCandidat);

      setRecreture({
        labels: ["Recruteurs", "Candidats"],
        datasets: [
          {
            data: [dataRecruteur.total, dataCandidat.total],
            backgroundColor: [
              "rgba(255,99,132,0.6)",  // Rose
              "rgba(186,85,211,0.6)",  // Mauve
            ],
            borderColor: [
              "rgba(255,99,132,0.6)",  // Rose
              "rgba(186,85,211,0.6)",  // Mauve
            ],
            borderWidth: 1,
          },
        ],
      });

      // Récupérer le nombre de candidatures par offre
      const responseOffres = await administrateur.nbCandidaturesOffre();
      const dataOffres = responseOffres.data;
      console.log('Offres Data:', dataOffres);
      // Mettre à jour l'état avec les données des offres
      setOffres(dataOffres);

    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
      legend: {
        position: "top",
      },
    },
    aspectRatio: 0.8,
    cutoutPercentage: 90,
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f4f4f9',
    minHeight: '100vh',
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4B0082',  // Violet
    marginBottom: '30px',
  };

  const chartContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  };

  const chartTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6A0DAD',  // Violet foncé
    marginBottom: '20px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
        <h2 style={titleStyle}>Statistiques des Recruteurs et Candidats</h2>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={chartContainerStyle}>
            <h6 style={chartTitleStyle}>Répartition des Recruteurs & Candidats</h6>
            <Pie data={recreture} options={options} />
          </div>
        </div>
      </div>

      {/* Affichage des statistiques des candidatures par offre */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <h3>Nombre de Candidatures par Poste</h3>
        {offres.length > 0 ? (
          <ul>
            {offres.map((offre, index) => (
              <li key={index}>
                <strong>{offre.titre}</strong>: {offre.nbCandidatures} candidatures
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune offre disponible.</p>
        )}
      </div>
    </div>
  );
};

ChartJS.register(ArcElement, Tooltip, Legend);

export default Layout;
