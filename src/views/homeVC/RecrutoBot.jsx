import React, { useState, useEffect, useRef } from "react";
import Header from "../../componentsVC/header";  
import Footer from "../../componentsVC/footer";  

const RecrutoBot = () => {
  // Déclaration de l'état des messages, initialisation avec un message de bienvenue du bot
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Bonjour 👋 Comment puis-je vous aider aujourd'hui ? 🏨😊" },
  ]);
  // Déclaration de l'état de l'input utilisateur (ce que l'utilisateur tape)
  const [userInput, setUserInput] = useState("");
  // Référence pour faire défiler la fenêtre jusqu'au dernier message
  const chatEndRef = useRef(null);

  // Fonction pour faire défiler jusqu'en bas des messages
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Utilisation de useEffect pour faire défiler vers le bas chaque fois que le message change
  useEffect(scrollToBottom, [messages]);

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!userInput.trim()) return;  // Si l'input est vide, ne rien faire

    // Ajouter le message de l'utilisateur à l'état des messages
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);

    try {
      // Envoi de la requête à l'API pour obtenir la réponse du bot
      const res = await fetch("http://127.0.0.1:5001/ask_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_input: userInput }),  // Envoi de l'input utilisateur
      });

      // Récupérer la réponse de l'API et l'ajouter aux messages
      const data = await res.json();
      const botText = data.data?.response || "❌ Erreur dans la réponse.";

      // Ajouter la réponse du bot à l'état des messages
      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      setUserInput("");  // Réinitialiser l'input utilisateur
    } catch (error) {
      // Si une erreur survient lors de l'appel API, afficher un message d'erreur
      console.error("Erreur de l'API:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Erreur de connexion avec l'API." }]);
    }
  };

  // Fonction pour gérer la pression de la touche "Enter"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();  // Si "Enter" est pressé, envoyer le message
  };

  return (
    <div style={{ marginTop: "0" }}>
      {/* Ajout de la barre de navigation (Header) */}
      <Header />
      <div className="container" style={{ marginTop: "150px" }}>  {/* Conteneur principal pour les messages du chat */}
        <div className="border rounded shadow-sm">
          {/* Section des messages de chat */}
          <div style={{ height: "400px", overflowY: "auto" }} className="p-3 border-bottom">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`d-flex mb-3 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                {/* Affichage des messages de l'utilisateur ou du bot */}
                <div
                  className={`p-3 rounded ${msg.sender === "user" ? "bg-warning text-dark" : "bg-light border"}`}
                  style={{ maxWidth: "90%" }}
                >
                  {msg.text}  {/* Le texte du message */}
                </div>
              </div>
            ))}
            {/* Référence pour faire défiler jusqu'au bas des messages */}
            <div ref={chatEndRef} />
          </div>

          {/* Zone de saisie pour l'utilisateur */}
          <div className="p-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Posez votre question..."
                value={userInput}  // L'input utilisateur est lié à l'état
                onChange={(e) => setUserInput(e.target.value)}  // Mise à jour de l'input
                onKeyPress={handleKeyPress}  // Gérer la pression de la touche "Enter"
              />
              {/* Bouton d'envoi */}
              <button
                className="btn btn-primary w-auto"
                type="button"
                onClick={sendMessage}  // Appeler la fonction d'envoi de message
                style={{ padding: "0.375rem 0.75rem", fontSize: "0.9rem" }}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ajout du pied de page (Footer) */}
      <Footer />
    </div>
  );
};

export default RecrutoBot;
