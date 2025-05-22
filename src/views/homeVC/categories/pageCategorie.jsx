import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../../componentsVC/header';
import Footer from '../../../componentsVC/footer';

const PageCategorie = () => {
  const { categorie } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOffresByCategorie = async () => {
      try {
     const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/categorie/${categorie}`);
        setCategory(response.data.getCategorie);
      } catch (error) {
        console.error('Erreur de chargement:', error);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffresByCategorie();

    return () => controller.abort();
  }, [categorie]);

  return (
    <>
      <Header />

      <div className="page-categorie container py-5">
        <h2>Offres dans la catégorie : {category?.nom}</h2>

        <div className="offres-container row">
          {loading ? (
            <div className="text-center">Chargement en cours...</div>
          ) : error ? (
            <div className="text-danger text-center">{error}</div>
          ) : !category?.Offre?.length ? (
            <p>Aucune offre disponible dans cette catégorie pour le moment</p>
          ) : (
            category.Offre.map((offre) => (
              <div key={offre._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h3>Titre: <span>{offre.titre}</span> </h3>
                    <p> Description: <span>{offre.description}</span></p>
                    <p className="offre-date">
                      Publié le: {new Date(offre.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PageCategorie;
