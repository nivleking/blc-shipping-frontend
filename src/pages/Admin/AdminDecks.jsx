import { useEffect, useState } from "react";
import { api } from "../../axios/axios";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { AiFillDelete, AiFillFolderOpen } from "react-icons/ai";
import "./AdminHome.css";

const AdminDecks = () => {
  const [decks, setDecks] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDecks();
  }, []);

  async function fetchDecks() {
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
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await api.post("/decks", formData);
      setDecks([...decks, response.data]);
      setFormData({ name: "" });
    } catch (error) {
      setErrors(error.response.data.errors);
      console.error("Error creating deck:", error);
    }
  }

  async function handleDeleteDeck(deckId) {
    try {
      await api.delete(`/decks/${deckId}`);
      setDecks(decks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      setErrors(error.response.data.errors);
      console.error("Error deleting deck:", error);
    }
  }

  function calculateDeckStats(cards) {
    if (!cards) {
      return { totalPorts: 0 };
    }
    const totalPorts = new Set(cards.map((card) => card.origin)).size;

    return {
      totalPorts,
    };
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = decks.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(decks.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div className="w-full">
            <h3 className="text-1xl font-bold text-gray-900">Create New Deck</h3>
          </div>
          <div className="flex flex-col">
            <label className="block text-gray-700 font-semibold">Deck Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Deck Name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <button type="submit" className="p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
            Create Deck
          </button>
        </form>
      </div>

      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-1xl font-bold text-gray-800 mb-4">All Decks</h3>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            breakLinkClassName={"page-link"}
          />
        </div>

        {decks.length === 0 ? (
          <p className="text-center text-gray-600">There are no decks! Let's create one!</p>
        ) : (
          <div className="space-y-4">
            {currentPageData.map((deck, index) => {
              const { totalPorts } = calculateDeckStats(deck.cards);
              return (
                <div key={deck.id} className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="text-black px-2 py-1 rounded-lg w-12 text-center">{offset + index + 1}</div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-lg font-bold">{deck.name}</p>
                    <p className="text-gray-400 text-sm">Total Ports: {totalPorts}</p>
                  </div>
                  <div className="flex space-x-4">
                    <Link to={`/admin-create-sales-call-cards/${deck.id}`} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 flex items-center">
                      <AiFillFolderOpen className="mr-1" /> View
                    </Link>
                    <button onClick={() => handleDeleteDeck(deck.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center">
                      <AiFillDelete className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDecks;
