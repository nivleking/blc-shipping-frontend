import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineCopy } from "react-icons/ai";
import { BsBoxSeam, BsGear, BsLightning } from "react-icons/bs";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import InformationCard from "../../components/simulations/InformationCard";
import "react-toastify/dist/ReactToastify.css";
import api from "../../axios/axios";
import GenerateCardsNavbar from "../../components/simulations/GenerateCardsNavbar";
import StatsPanel from "../../components/simulations/StatsPanel";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const AdminCreateCards = () => {
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

  async function fetchDeck() {
    try {
      const res = await api.get(`/decks/${deckId}`);
      setDeck(res.data);
      setSalesCallCards(res.data.cards);
      calculateDeckStats(res.data.cards);
    } catch (error) {
      console.error("Error fetching deck:", error);
    }
  }

  async function fetchContainers() {
    try {
      const response = await api.get("/containers");
      console.log("Containers:", response.data);
      setContainers(response.data);
    } catch (error) {
      console.error("Error fetching containers:", error);
    }
  }

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    if (name === "generateConfig") {
      const config = JSON.parse(value);
      setGenerateFormData({ ...generateFormData, ...config });
    } else {
      setGenerateFormData({ ...generateFormData, [name]: value });
    }
  };

  const handlePresetSelect = (config) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        ...config,
      }));
      toast.success("Preset configuration applied");
    } catch (error) {
      toast.error("Failed to apply preset configuration");
    }
  };

  const handlePortSelect = (portCount) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        ports: portCount,
      }));
      toast.info(`Port count set to ${portCount}`);
    } catch (error) {
      toast.error("Failed to set port count");
    }
  };

  const handleRevenueSelect = (revenue) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        maxTotalRevenueEachPort: revenue,
      }));
      toast.info(`Revenue per port set to ${formatIDR(revenue)}`);
    } catch (error) {
      toast.error("Failed to set revenue");
    }
  };

  const handleQuantitySelect = (quantity) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        maxTotalContainerQuantityEachPort: quantity,
      }));
      toast.info(`Container quantity per port set to ${quantity}`);
    } catch (error) {
      toast.error("Failed to set container quantity");
    }
  };

  async function handleGenerateSubmit(e) {
    e.preventDefault();
    try {
      const response = await api.post(`/generate-cards/${deckId}`, generateFormData);
      setSalesCallCards(response.data.cards);
      fetchContainers();
      calculateDeckStats(response.data.cards);

      toast.success("Cards generated successfully!");

      // Reset form to default values
      setGenerateFormData({
        maxTotalRevenueEachPort: 250_000_000,
        maxTotalContainerQuantityEachPort: 15,
        maxSalesCardEachPort: 8,
        ports: 4,
        quantityStandardDeviation: 1,
        revenueStandardDeviation: 500_000,
      });
    } catch (error) {
      setGenerateErrors(error.response?.data?.errors || {});
      setSalesCallCards([]);
      toast.error(error.response?.data?.message || "Failed to generate cards");
    }
  }

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

  const handleMarketIntelligenceUpload = (data) => {
    try {
      if (!data.ports || !Array.isArray(data.ports)) {
        throw new Error("Invalid market intelligence format");
      }

      setGenerateFormData((prevData) => ({
        ...prevData,
        ports: data.ports.length,
        maxTotalRevenueEachPort: data.maxRevenue || prevData.maxTotalRevenueEachPort,
        // Add other mappings as needed
      }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = salesCallCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(salesCallCards.length / cardsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const CardsPreview = ({ currentCards, containers, formatIDR }) => {
    const filteredCards = getFilteredCards(currentCards);
    return (
      <div className="col-span-4 bg-white shadow-lg rounded-md overflow-hidden">
        {/* Header with Filters */}
        <div className="p-4 border-b sticky top-0 bg-white z-10 ">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Generated Cards</h2>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 text-sm rounded-full transition-colors
              ${filterType === "all" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("committed")}
              className={`px-3 py-1 text-sm rounded-full transition-colors
              ${filterType === "committed" ? "bg-green-500 text-white" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
            >
              Committed
            </button>
            <button
              onClick={() => setFilterType("non-committed")}
              className={`px-3 py-1 text-sm rounded-full transition-colors
              ${filterType === "non-committed" ? "bg-yellow-500 text-white" : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"}`}
            >
              Non-Committed
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-4 grid grid-cols-2 grid-rows-3 gap-3 overflow-y-auto h-[calc(100vh-15rem)]">
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow
                        ${card.priority === "Committed" ? "border-l-4 border-green-500" : "border-l-4 border-yellow-500"}`}
            >
              {/* Card Content */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg">
                    {card.origin} → {card.destination}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm
                             ${card.priority === "Committed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {card.priority}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type</span>
                    <p className="font-medium">{card.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity</span>
                    <p className="font-medium">{card.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue/Container</span>
                    <p className="font-medium">{formatIDR(card.revenue / card.quantity)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Revenue</span>
                    <p className="font-medium">{formatIDR(card.revenue)}</p>
                  </div>
                </div>

                {/* Container Preview */}
                <div className="mt-4">
                  <h4 className="text-sm text-gray-500 mb-2">Containers</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {containers
                      .filter((c) => c.card_id === card.id)
                      .map((container) => (
                        <div key={container.id} className={`h-6 rounded-sm bg-${container.color}-500`} title={`Container ${container.id}`}>
                          <p className="text-center text-sm">{container.id}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t sticky bottom-0 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, salesCallCards.length)} of {salesCallCards.length} cards
            </span>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => paginate(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [filterType, setFilterType] = useState("all");

  const getFilteredCards = (cards) => {
    switch (filterType) {
      case "committed":
        return cards.filter((card) => card.priority === "Committed");
      case "non-committed":
        return cards.filter((card) => card.priority === "Non-Committed");
      default:
        return cards;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <GenerateCardsNavbar title="Generate Sales Call Cards" onBack={() => navigate(-1)} onGenerate={handleGenerateSubmit} />

      {/* Main Content */}
      <div className="pt-4">
        <InformationCard className="mb-4 mx-4" />
        <div className="grid grid-cols-12 gap-6 h-screen">
          <div className="col-span-3 space-y-6">
            <StatsPanel portStats={portStats} formatIDR={formatIDR} />
          </div>
          {/* Configuration Area */}
          <div className="col-span-5 space-y-6">
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <TabGroup>
                  <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                      }
                    >
                      Quick Presets
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                      }
                    >
                      Advanced Settings
                    </Tab>
                  </TabList>

                  <TabPanels className="mt-6">
                    <TabPanel>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Preset Cards */}
                        {[
                          {
                            title: "Standard",
                            desc: "15 containers per port - 8 sales cards per port - 250M revenue",
                            icon: <BsBoxSeam className="text-blue-500" size={24} />,
                            config: {
                              maxTotalRevenueEachPort: 250000000,
                              maxTotalContainerQuantityEachPort: 15,
                              maxSalesCardEachPort: 8,
                            },
                          },
                          {
                            title: "Medium Revenue",
                            desc: "35 containers per port - 10 sales cards per port - 350M revenue",
                            icon: <BsGear className="text-blue-500" size={24} />,
                            config: {
                              maxTotalRevenueEachPort: 350000000,
                              maxTotalContainerQuantityEachPort: 25,
                              maxSalesCardEachPort: 10,
                            },
                          },
                          {
                            title: "High Volume",
                            desc: "50 containers per port - 10 sales cards per port - 1B revenue",
                            icon: <BsLightning className="text-blue-500" size={24} />,
                            config: {
                              maxTotalRevenueEachPort: 1000000000,
                              maxTotalContainerQuantityEachPort: 50,
                              maxSalesCardEachPort: 10,
                            },
                          },
                        ].map((preset) => (
                          <button
                            key={preset.title}
                            onClick={() => handlePresetSelect(preset.config)}
                            className="p-6 rounded-xl border-2 border-gray-200 
                               hover:border-blue-500 transition-colors 
                               bg-white shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              {preset.icon}
                              <h3 className="font-semibold text-gray-800">{preset.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{preset.desc}</p>
                          </button>
                        ))}
                      </div>
                    </TabPanel>

                    <TabPanel>
                      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        {/* Advanced Settings Form */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label htmlFor="generateConfig" className="text-sm font-medium text-gray-700">
                              Custom Configuration
                            </label>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(generateFormData, null, 2));
                                toast.success("Configuration copied to clipboard!");
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <AiOutlineCopy /> Copy
                            </button>
                          </div>
                          <div className="relative">
                            <textarea
                              name="generateConfig"
                              id="generateConfig"
                              value={JSON.stringify(generateFormData, null, 2)}
                              onChange={handleGenerateChange}
                              className="w-full h-48 p-4 font-mono text-sm border-2 rounded-lg 
                focus:outline-none focus:border-blue-500 
                bg-gray-50 resize-none overflow-auto"
                              spellCheck="false"
                            />
                            <div className="absolute top-2 right-2 text-xs text-gray-400">{Object.keys(generateFormData).length} fields</div>
                          </div>
                          <div className="text-xs text-gray-500">Edit the JSON directly or use the form controls above</div>
                        </div>
                        <hr />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">Total Ports</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {[4, 5, 6].map((port) => (
                              <button
                                key={port}
                                onClick={() => handlePortSelect(port)}
                                className={`p-4 rounded-lg border-2 transition-colors
                                    ${generateFormData.ports === port ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                              >
                                {port} Ports
                              </button>
                            ))}
                          </div>
                        </div>
                        <hr />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">Sales Call Revenue Configuration</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {[250_000_000, 500_000_000, 750_000_000].map((revenue) => (
                              <button
                                key={revenue}
                                onClick={() => handleRevenueSelect(revenue)}
                                className={`p-4 rounded-lg border-2 transition-colors
                                    ${generateFormData.maxTotalRevenueEachPort === revenue ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                              >
                                {formatIDR(revenue)}
                              </button>
                            ))}
                            <div className="relative">
                              <input
                                type="number"
                                name="maxTotalRevenueEachPort"
                                value={generateFormData.maxTotalRevenueEachPort}
                                onChange={handleGenerateChange}
                                placeholder="Edit revenue manually"
                                className="w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <span className="absolute bottom-2 right-2 text-xs text-gray-500">Edit revenue manually</span>
                            </div>
                          </div>
                        </div>
                        <hr />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">Sales Call Quantity Configuration</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {[15, 20, 25].map((quantity) => (
                              <button
                                key={quantity}
                                onClick={() => handleQuantitySelect(quantity)}
                                className={`p-4 rounded-lg border-2 transition-colors
                                    ${generateFormData.maxTotalContainerQuantityEachPort === quantity ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                              >
                                {quantity} Containers
                              </button>
                            ))}
                            <div className="relative">
                              <input
                                type="number"
                                name="maxTotalContainerQuantityEachPort"
                                value={generateFormData.maxTotalContainerQuantityEachPort}
                                onChange={handleGenerateChange}
                                placeholder="Edit container quantity manually"
                                min="1"
                                max="100"
                                className="w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                              />
                              <span className="absolute bottom-2 right-2 text-xs text-gray-500">Edit container quantity manually</span>
                            </div>
                          </div>
                        </div>
                        <hr />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Standard Deviation</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="quantityStandardDeviation" className="text-sm text-gray-600">
                                Quantity
                              </label>
                              <input
                                type="number"
                                name="quantityStandardDeviation"
                                id="quantityStandardDeviation"
                                value={generateFormData.quantityStandardDeviation}
                                onChange={handleGenerateChange}
                                className="w-full p-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="revenueStandardDeviation" className="text-sm text-gray-600">
                                Revenue
                              </label>
                              <input
                                type="number"
                                name="revenueStandardDeviation"
                                id="revenueStandardDeviation"
                                value={generateFormData.revenueStandardDeviation}
                                onChange={handleGenerateChange}
                                className="w-full p-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </div>
            </div>
          </div>
          {/* Cards Preview */}
          <CardsPreview currentCards={currentCards} containers={containers} formatIDR={formatIDR} />
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCards;
