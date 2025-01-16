import { useEffect, useState } from "react";
import api from "../../axios/axios";
import { Link } from "react-router-dom";

const AdminDecks = () => {
  const [decks, setDecks] = useState([]);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await api.get("/decks");
      const decksData = response.data;

      const decksWithCards = await Promise.all(
        decksData.map(async (deck) => {
          const cardsResponse = await api.get(`/decks/${deck.id}/cards`);
          return { ...deck, cards: cardsResponse.data.cards };
        })
      );

      setDecks(decksWithCards);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/decks", formData);
      setDecks([...decks, response.data]);
      setFormData({ name: "" });
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    try {
      await api.delete(`/decks/${deckId}`);
      setDecks(decks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const calculateDeckStats = (cards) => {
    if (!cards) {
      return { totalPorts: 0 };
    }
    const totalPorts = new Set(cards.map((card) => card.origin)).size;

    return {
      totalPorts,
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Decks</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block text-gray-700">Deck Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Create Deck
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {decks.map((deck) => {
          const { totalPorts } = calculateDeckStats(deck.cards);
          return (
            <div key={deck.id} className="relative bg-white rounded shadow overflow-hidden">
              <img src={`https://picsum.photos/seed/containers/1200/400`} alt="Deck" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold">{deck.name}</h3>
                <p className="text-sm mb-2 text-gray-500">Total Ports: {totalPorts}</p>
                <div className="flex flex-row justify-items-start space-x-2">
                  <Link to={`/admin-create-sales-call-cards/${deck.id}`} className="p-2 bg-blue-500 text-white rounded mb-2">
                    View
                  </Link>
                  <button onClick={() => handleDeleteDeck(deck.id)} className="p-2 bg-red-500 text-white rounded mb-2">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDecks;
