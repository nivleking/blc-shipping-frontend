import { useState } from "react";
import { api } from "../../axios/axios";
import { FaShip } from "react-icons/fa";
import LoadingOverlay from "../LoadingOverlay";
import useToast from "../../toast/useToast";

const validateId = (id) => {
  const num = parseInt(id);
  return !isNaN(num) && num >= 1 && num <= 99999;
};

const ManualGeneratePanel = ({ formatIDR, deckId, refreshCards, refreshContainers }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPorts, setSelectedPorts] = useState(4);
  const [manualCardForm, setManualCardForm] = useState({
    id: "",
    origin: "",
    destination: "",
    priority: "Committed",
    quantity: 1,
    revenuePerContainer: 0,
    type: "dry",
  });

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
    return availablePorts[selectedPorts].filter((port) => port !== manualCardForm.origin);
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
        showError("Invalid ID. Must be a number between 1-99999");
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

      // Refresh the card list
      await refreshCards();

      // Refresh the container list
      await refreshContainers();

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
              {/* Container Type Selection Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Choose the container type and configure the card details</span>
                </div>
              </div>

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
                            const value = parseInt(e.target.value);
                            if (value >= 2 && value <= 10) {
                              setSelectedPorts(value);
                              setManualCardForm((prev) => ({
                                ...prev,
                                origin: "",
                                destination: "",
                              }));
                            }
                          }}
                          className="w-full p-2.5 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                          placeholder="2-10"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Enter a value between 2-10</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Available Ports</label>
                      <div className="p-2.5 bg-white rounded-lg border border-blue-100 h-[38px] overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                          {availablePorts[selectedPorts]?.map((port) => (
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
                      pattern="^[1-9]\d{0,4}$"
                      required
                      placeholder="1-99999"
                      className="w-full p-3 bg-gray-50 border-2 rounded-lg 
                      focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {/* <p className="mt-1 text-xs text-gray-500">Enter a number between 1-99999</p> */}
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
                    {availablePorts[selectedPorts]?.map((port) => (
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
