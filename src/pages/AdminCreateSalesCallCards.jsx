import { useState, useEffect } from "react";
import api from "../axios/axios";
import { useNavigate, useParams } from "react-router-dom";

const AdminCreateSalesCallCards = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [generateFormData, setGenerateFormData] = useState({
    maxTotalRevenueEachPort: 250_000_000,
    maxTotalContainerQuantityEachPort: 15,
    maxSalesCardEachPort: 8,
    ports: 4,
    quantityStandardDeviation: 1,
    revenueStandardDeviation: 500_000,
  });
  const [generateErrors, setGenerateErrors] = useState({});
  const [deck, setDeck] = useState({});
  const [salesCallCards, setSalesCallCards] = useState([]);
  const [containers, setContainers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  const [portStats, setPortStats] = useState({});

  useEffect(() => {
    fetchDeck();
    fetchContainers();
  }, []);

  const fetchDeck = async () => {
    try {
      const res = await api.get(`/decks/${deckId}`);
      setDeck(res.data);
      setSalesCallCards(res.data.cards);
      calculateDeckStats(res.data.cards);
    } catch (error) {
      console.error("Error fetching deck:", error);
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await api.get("/containers");
      console.log(response.data);
      setContainers(response.data);
    } catch (error) {
      console.error("Error fetching containers:", error);
    }
  };

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    if (name === "generateConfig") {
      const config = JSON.parse(value);
      setGenerateFormData({ ...generateFormData, ...config });
    } else {
      setGenerateFormData({ ...generateFormData, [name]: value });
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/generate-cards/${deckId}`, generateFormData);
      console.log(response.data);
      setSalesCallCards(response.data.cards);
      fetchContainers();
      calculateDeckStats(response.data.cards);

      setGenerateFormData({
        maxTotalRevenueEachPort: 250_000_000,
        maxTotalContainerQuantityEachPort: 15,
        maxSalesCardEachPort: 8,
        ports: 4,
        quantityStandardDeviation: 1,
        revenueStandardDeviation: 500_000,
      });
    } catch (error) {
      setGenerateErrors(error.response.data.errors);
      setSalesCallCards([]);
      console.error("Error generating sales call cards:", error);
    }
  };

  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  const calculateDeckStats = (cards) => {
    const stats = cards.reduce((acc, card) => {
      if (!acc[card.origin]) {
        acc[card.origin] = {
          totalRevenue: 0,
          totalQuantity: 0,
          totalSalesCall: 0,
        };
      }
      acc[card.origin].totalRevenue += card.revenue;
      acc[card.origin].totalQuantity += card.quantity;
      acc[card.origin].totalSalesCall += 1;
      return acc;
    }, {});

    setPortStats(stats);
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = salesCallCards.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(salesCallCards.length / cardsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4">
      <button onClick={() => navigate(-1)} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Back
      </button>
      <h3 className="mb-4 text-2xl font-bold text-gray-800">
        {deck.name} - ID: {deck.id}
      </h3>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 pr-4">
          {/* Stats Card */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h4 className="text-xl font-bold mb-2">Deck Stats</h4>
            {Object.keys(portStats).map((port) => (
              <div key={port} className="mb-4">
                <h5 className="text-lg font-bold">{port}</h5>
                <p>Total Revenue: {formatIDR(portStats[port].totalRevenue)}</p>
                <p>Total Quantity: {portStats[port].totalQuantity}</p>
                <p>Total Sales Calls: {portStats[port].totalSalesCall}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 pl-4">
          <form onSubmit={handleGenerateSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700">Total Ports</label>
              <div className="flex flex-wrap">
                {["4", "5", "6", "7", "8"].map((port) => (
                  <label key={port} className="mr-4">
                    <input type="radio" name="ports" value={port} onChange={handleGenerateChange} className="mr-2" />
                    {port}
                  </label>
                ))}
              </div>
              {generateErrors && generateErrors.ports && <p className="text-red-500">{generateErrors.ports}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Choose Generate Config</label>
              <select name="generateConfig" onChange={handleGenerateChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value='{"maxTotalRevenueEachPort": 250000000, "maxTotalContainerQuantityEachPort": 15, "maxSalesCardEachPort": 8}'>Config 1</option>
                <option value='{"maxTotalRevenueEachPort": 350000000, "maxTotalContainerQuantityEachPort": 25, "maxSalesCardEachPort": 10}'>Config 2</option>
                <option value='{"maxTotalRevenueEachPort": 1000000000, "maxTotalContainerQuantityEachPort": 50, "maxSalesCardEachPort": 10}'>Config 3</option>
                <option value='{"maxTotalRevenueEachPort": 550000000, "maxTotalContainerQuantityEachPort": 30, "maxSalesCardEachPort": 10}'>Config 4</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Selected Max Config Values (Per Port)</label>
              <div className="p-3 border border-gray-300 rounded-lg">
                <table>
                  <tbody>
                    <tr>
                      <td className="font-medium py-2">Max Total Revenue:</td>
                      <td className="py-2">{formatIDR(generateFormData.maxTotalRevenueEachPort)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2">Max Total Quantity:</td>
                      <td className="py-2">{generateFormData.maxTotalContainerQuantityEachPort}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2">Max Sales Call:</td>
                      <td className="py-2">{generateFormData.maxSalesCardEachPort}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Quantity Standard Deviation</label>
              <div className="flex flex-wrap">
                {[1.0, 2.0, 3.0].map((value) => (
                  <label key={value} className="mr-4">
                    <input type="radio" name="quantityStandardDeviation" value={value} onChange={handleGenerateChange} className="mr-2" />
                    {value}
                  </label>
                ))}
              </div>
              {generateErrors && generateErrors.quantityStandardDeviation && <p className="text-red-500">{generateErrors.quantityStandardDeviation}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Revenue Standard Deviation</label>
              <div className="flex flex-col">
                {[500000, 1000000, 1500000].map((value) => (
                  <label key={value} className="mr-4">
                    <input type="radio" name="revenueStandardDeviation" value={value} onChange={handleGenerateChange} className="mr-2" />
                    {formatIDR(value)}
                  </label>
                ))}
              </div>
              {generateErrors && generateErrors.revenueStandardDeviation && <p className="text-red-500">{generateErrors.revenueStandardDeviation}</p>}
            </div>
            <button type="submit" className="w-full p-3 text-white bg-green-500 rounded-lg hover:bg-green-600">
              Generate Cards
            </button>
          </form>
        </div>
      </div>

      <div className="w-full mt-8">
        <h3 className="mb-4 text-2xl font-bold text-center text-gray-800">Deck's Cards</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentCards.map((card, index) => (
            <div key={card.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <tbody>
                  <tr className="font-bold">
                    <td>{card.origin}</td>
                    <td>Booking {card.id}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <hr />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Type:</td>
                    <td className="py-2">{index % 5 === 0 ? "REEFER" : "DRY"}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Priority:</td>
                    <td className="py-2">{card.priority}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Origin:</td>
                    <td className="py-2">{card.origin}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Destination:</td>
                    <td className="py-2">{card.destination}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Quantity:</td>
                    <td className="py-2">{card.quantity}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Revenue/Container:</td>
                    <td className="py-2">{formatIDR(card.revenue / card.quantity)}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-2">Total Revenue:</td>
                    <td className="py-2">{formatIDR(card.revenue)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="font-medium py-2 text-center">
                      Containers
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" className="py-2">
                      <div className="grid grid-cols-3 gap-2">
                        {containers
                          .filter((container) => container.card_id === card.id)
                          .map((container) => (
                            <div
                              key={container.id}
                              className={`p-2 border border-dashed border-gray-300 rounded text-center bg-${container.color}-500`}
                              style={{ backgroundImage: "linear-gradient(90deg, transparent 70%, rgba(255, 255, 255, 0.5) 50%)", backgroundSize: "10px 10px" }}
                            >
                              {container.id}
                            </div>
                          ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
  );
};

export default AdminCreateSalesCallCards;
