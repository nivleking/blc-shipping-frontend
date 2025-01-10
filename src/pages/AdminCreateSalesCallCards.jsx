import React, { useState, useEffect } from "react";
import api from "../axios/axios";

const AdminCreateSalesCallCards = () => {
  const [formData, setFormData] = useState({
    type: "",
    priority: "non-committed",
    origin: "",
    destination: "",
    quantity: "",
    revenue: "",
  });
  const [salesCallCards, setSalesCallCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

  useEffect(() => {
    fetchSalesCallCards();
  }, []);

  const fetchSalesCallCards = async () => {
    try {
      const response = await api.get("/sales-call-card");
      setSalesCallCards(response.data);
    } catch (error) {
      console.error("Error fetching sales call cards:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/sales-call-card", formData);
      setSalesCallCards([...salesCallCards, response.data]);
      setFormData({
        type: "",
        priority: "non-committed",
        origin: "",
        destination: "",
        quantity: "",
        revenue: "",
      });
    } catch (error) {
      console.error("Error creating sales call card:", error);
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await api.get("/generate-sales-call-cards");
      setSalesCallCards(response.data);
    } catch (error) {
      console.error("Error generating sales call cards:", error);
    }
  };

  // Format revenue as IDR
  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  // Pagination logic
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = salesCallCards.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(salesCallCards.length / cardsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 pr-4">
          <h2 className="mb-4 text-3xl font-bold text-center text-gray-800">Admin Create Sales Call Cards</h2>
          <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <input type="text" name="origin" placeholder="Origin" value={formData.origin} onChange={handleChange} className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            <input type="number" name="revenue" placeholder="Revenue" value={formData.revenue} onChange={handleChange} className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            <div className="mb-4">
              <label className="block text-gray-700">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="non-committed">Non-Committed</option>
                <option value="committed">Committed</option>
              </select>
            </div>
            <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
              Create Sales Call Card
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={handleGenerate} className="p-3 text-white bg-green-500 rounded-lg hover:bg-green-600">
              Generate Sales Call Cards
            </button>
          </div>
        </div>

        <div className="w-full lg:w-2/3 pl-4">
          <h3 className="mb-4 text-2xl font-bold text-center text-gray-800">Sales Call Cards</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentCards.map((card, index) => (
              <div key={card.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="text-center font-bold text-lg mb-2">
                  {card.origin} - {card.destination}
                </div>
                <div className="text-sm">
                  <p>Type: {index % 5 === 0 ? "Reefer" : "Dry"}</p>
                  <p>Priority: {card.priority}</p>
                  <p>Origin: {card.origin}</p>
                  <p>Destination: {card.destination}</p>
                  <p>Quantity: {card.quantity}</p>
                  <p>Revenue: {formatIDR(card.revenue)}</p>
                  <p>Total: {formatIDR(card.quantity * card.revenue)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6">
            {[...Array(totalPages).keys()].map((page) => (
              <button key={page + 1} onClick={() => paginate(page + 1)} className={`mx-1 px-4 py-2 rounded ${currentPage === page + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                {page + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateSalesCallCards;
