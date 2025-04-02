import { useEffect, useState } from "react";
import { api } from "../../../axios/axios";
import { FaShip } from "react-icons/fa";
import LoadingOverlay from "../../LoadingOverlay";
import useToast from "../../../toast/useToast";

const validateId = (id) => {
  return id && !isNaN(parseInt(id)) && parseInt(id) >= 1;
};

const ManualGeneratePanel = ({ formatIDR, deckId, refreshData }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPorts, setSelectedPorts] = useState(5);
  const [manualCardForm, setManualCardForm] = useState({
    id: "",
    origin: "",
    destination: "",
    priority: "Committed",
    quantity: 1,
    revenuePerContainer: 0,
    type: "dry",
  });
  const [activeMarketIntelligence, setActiveMarketIntelligence] = useState(null);
  const [isLoadingMI, setIsLoadingMI] = useState(false);
  const [miPorts, setMiPorts] = useState([]);
  const [usingMarketIntelligence, setUsingMarketIntelligence] = useState(false);
  const [useMarketIntelligenceToggle, setUseMarketIntelligenceToggle] = useState(false);

  const availablePorts = {
    2: ["SBY", "MKS"],
    3: ["SBY", "MKS", "MDN"],
    4: ["SBY", "MKS", "MDN", "JYP"],
    5: ["SBY", "MKS", "MDN", "JYP", "BPN"],
    6: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS"],
    7: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR"],
    8: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"],
    9: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ"],
    10: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"],
  };

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = ["Creating your sales call card..."];

  const calculateTotalRevenue = () => {
    return manualCardForm.quantity * manualCardForm.revenuePerContainer;
  };

  const handleManualCardChange = (e) => {
    const { name, value } = e.target;
    setManualCardForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getAvailableDestinations = () => {
    if (usingMarketIntelligence && miPorts.length > 0) {
      return miPorts.filter((port) => port !== manualCardForm.origin);
    } else {
      return availablePorts[selectedPorts].filter((port) => port !== manualCardForm.origin);
    }
  };

  const handleManualCardSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsLoading(true);
    setLoadingMessageIndex(0);

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    try {
      if (!validateId(manualCardForm.id)) {
        showError("Invalid ID. Must be a number above 1");
        return;
      }

      const cardResponse = await api.post("/cards", {
        id: manualCardForm.id,
        priority: manualCardForm.priority,
        origin: manualCardForm.origin,
        destination: manualCardForm.destination,
        quantity: parseInt(manualCardForm.quantity),
        revenue: calculateTotalRevenue(),
        type: manualCardForm.type,
      });

      // Then attach the card to the deck
      await api.post(`/decks/${deckId}/add-card`, {
        card_id: cardResponse.data.id,
      });

      // Refresh the card and containers
      await refreshData();

      showSuccess("Sales call card created and added to deck!");

      // Reset form
      setManualCardForm({
        id: "",
        origin: "",
        destination: "",
        priority: "Committed",
        quantity: 1,
        revenuePerContainer: 0,
        type: "dry",
      });
    } catch (error) {
      console.error("Error creating card:", error);
      showError(error.response?.data?.message || "Failed to create card");
    } finally {
      clearInterval(messageInterval);
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const fetchMarketIntelligence = async () => {
    if (!useMarketIntelligenceToggle) return;

    setIsLoadingMI(true);
    try {
      const response = await api.get(`/market-intelligence/deck/${deckId}`);
      const data = response.data;

      if (data && data.price_data) {
        setActiveMarketIntelligence(data);

        const portSet = new Set();
        Object.keys(data.price_data).forEach((key) => {
          const [origin, destination] = key.split("-");
          portSet.add(origin);
          portSet.add(destination);
        });

        const ports = Array.from(portSet).sort();
        setMiPorts(ports);

        setUsingMarketIntelligence(true);
        setSelectedPorts(ports.length);
      }
    } catch (error) {
      console.error("Error fetching market intelligence:", error);
      setActiveMarketIntelligence(null);
      setMiPorts([]);
      setUsingMarketIntelligence(false);
      setUseMarketIntelligenceToggle(false);
      showError("No active market intelligence found");
    } finally {
      setIsLoadingMI(false);
    }
  };

  const handleMarketIntelligenceToggle = (e) => {
    const shouldUseMarketIntelligence = e.target.checked;
    setUseMarketIntelligenceToggle(shouldUseMarketIntelligence);

    if (shouldUseMarketIntelligence) {
      if (activeMarketIntelligence) {
        setUsingMarketIntelligence(true);
      } else {
        fetchMarketIntelligence();
      }
    } else {
      setUsingMarketIntelligence(false);
      setSelectedPorts(4);
      setManualCardForm((prev) => ({
        ...prev,
        origin: "",
        destination: "",
      }));
    }
  };

  useEffect(() => {
    if (useMarketIntelligenceToggle) {
      fetchMarketIntelligence();
    }
  }, [useMarketIntelligenceToggle]);

  return (
    <div className="">
      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={loadingMessageIndex} title="Creating Card" />}
      <form onSubmit={handleManualCardSubmit}>
        <div className="">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <FaShip className="text-blue-500 text-xl mr-2" />
              <h3 className="text-xl font-bold text-gray-800">Create Card</h3>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="p-6">
            {/* Card Details Section */}
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">Use Market Intelligence</h4>
                    <p className="text-sm text-gray-600">Apply market intelligence data to your manual card generation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={useMarketIntelligenceToggle} onChange={handleMarketIntelligenceToggle} className="sr-only peer" />
                    <div
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                    after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                    after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    ></div>
                  </label>
                </div>
              </div>

              {isLoadingMI ? (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center text-sm text-yellow-700">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Checking market intelligence data...</span>
                  </div>
                </div>
              ) : usingMarketIntelligence && activeMarketIntelligence ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center text-sm text-blue-700">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Using market intelligence: <strong>{activeMarketIntelligence.name}</strong> ({miPorts.length} ports available)
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Port Configuration Section */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Ports</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={selectedPorts}
                          onChange={(e) => {
                            if (!usingMarketIntelligence) {
                              const value = parseInt(e.target.value);
                              if (value >= 2 && value <= 10) {
                                setSelectedPorts(value);
                                setManualCardForm((prev) => ({
                                  ...prev,
                                  origin: "",
                                  destination: "",
                                }));
                              }
                            }
                          }}
                          className={`w-full p-2.5 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm
    ${usingMarketIntelligence ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          placeholder="2-10"
                          disabled={usingMarketIntelligence}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Enter a value between 2-10</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Ports
                        {usingMarketIntelligence && <span className="ml-2 text-xs text-blue-600 font-normal">(from Market Intelligence)</span>}
                      </label>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-100 min-h-[38px] max-h-[60px] overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                          {(usingMarketIntelligence ? miPorts : availablePorts[selectedPorts])?.map((port) => (
                            <span key={port} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                              {port}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID, Type, and Priority Group */}
              <div className="grid grid-cols-3 gap-4">
                {/* Card ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Card ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="id"
                      value={manualCardForm.id}
                      onChange={handleManualCardChange}
                      // pattern="^[1-9]\d{0,4}$"
                      required
                      placeholder="Enter Card ID"
                      className="w-full p-3 bg-gray-50 border-2 rounded-lg 
                      focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Container Type - NEW SELECT INPUT */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Container Type</label>
                  <select
                    name="type"
                    value={manualCardForm.type}
                    onChange={handleManualCardChange}
                    className="w-full p-3 bg-gray-50 border-2 rounded-lg 
                    focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="dry">Dry</option>
                    <option value="reefer">Reefer</option>
                  </select>
                  {/* <p className="mt-1 text-xs text-gray-500">Select container type</p> */}
                </div>

                {/* Priority Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                  <select
                    name="priority"
                    value={manualCardForm.priority}
                    onChange={handleManualCardChange}
                    className="w-full p-3 bg-gray-50 border-2 rounded-lg 
                    focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Committed">Committed</option>
                    <option value="Non-Committed">Non-Committed</option>
                  </select>
                </div>
              </div>

              {/* Ports Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Origin Port */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Origin Port</label>
                  <select
                    name="origin"
                    value={manualCardForm.origin}
                    onChange={handleManualCardChange}
                    required
                    className="w-full p-3 bg-gray-50 border-2 rounded-lg 
    focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Origin Port</option>
                    {(usingMarketIntelligence ? miPorts : availablePorts[selectedPorts])?.map((port) => (
                      <option key={port} value={port}>
                        {port}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Port */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Destination Port</label>
                  <select
                    name="destination"
                    value={manualCardForm.destination}
                    onChange={handleManualCardChange}
                    required
                    disabled={!manualCardForm.origin}
                    className={`w-full p-3 bg-gray-50 border-2 rounded-lg 
                    focus:outline-none focus:border-blue-500 transition-colors
                    ${!manualCardForm.origin ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select Destination Port</option>
                    {manualCardForm.origin &&
                      getAvailableDestinations().map((port) => (
                        <option key={port} value={port}>
                          {port}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Container Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Container Details</h4>
                <div className="grid grid-cols-3 gap-6">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={manualCardForm.quantity}
                      onChange={handleManualCardChange}
                      min="1"
                      required
                      className="w-full p-3 bg-white border-2 rounded-lg 
                      focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Revenue per Container */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Revenue/Container</label>
                    <input
                      type="number"
                      name="revenuePerContainer"
                      value={manualCardForm.revenuePerContainer}
                      onChange={handleManualCardChange}
                      min="0"
                      required
                      className="w-full p-3 bg-white border-2 rounded-lg 
                      focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Total Revenue (Read-only) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Total Revenue</label>
                    <div
                      className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg 
                      font-medium text-gray-800"
                    >
                      {formatIDR(calculateTotalRevenue())}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 
              text-white rounded-lg font-medium 
              hover:from-blue-600 hover:to-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:ring-offset-2 transition-all duration-200
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Card"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManualGeneratePanel;
