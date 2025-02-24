import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { AiOutlineCopy } from "react-icons/ai";
import StatsPanel from "./StatsPanel";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../axios/axios";
import { BiAnchor } from "react-icons/bi";
import { FaShip } from "react-icons/fa";
import { BsBoxSeam, BsGear, BsRocket, BsLightningCharge } from "react-icons/bs";
import FileGeneratePanel from "./FileGeneratePanel";

// Add preset configs array
const PRESET_CONFIGS = [
  {
    title: "Basic Setup",
    desc: "15 containers, 8 sales calls per port with 250M revenue",
    icon: <BsBoxSeam className="text-blue-500" size={24} />,
    config: {
      totalRevenueEachPort: 250000000,
      totalContainerQuantityEachPort: 15,
      salesCallCountEachPort: 8,
      ports: 4,
      quantityStandardDeviation: 1,
      revenueStandardDeviation: 500000,
    },
  },
  {
    title: "Medium Volume",
    desc: "25 containers, 10 sales calls per port with 350M revenue",
    icon: <BsGear className="text-blue-500" size={24} />,
    config: {
      totalRevenueEachPort: 350000000,
      totalContainerQuantityEachPort: 25,
      salesCallCountEachPort: 10,
      ports: 4,
      quantityStandardDeviation: 1,
      revenueStandardDeviation: 500000,
    },
  },
  {
    title: "High Revenue",
    desc: "30 containers, 10 sales calls per port with 550M revenue",
    icon: <BsRocket className="text-blue-500" size={24} />,
    config: {
      totalRevenueEachPort: 550000000,
      totalContainerQuantityEachPort: 30,
      salesCallCountEachPort: 10,
      ports: 4,
      quantityStandardDeviation: 1,
      revenueStandardDeviation: 500000,
    },
  },
  {
    title: "Maximum Scale",
    desc: "50 containers, 10 sales calls per port with 1B revenue",
    icon: <BsLightningCharge className="text-blue-500" size={24} />,
    config: {
      totalRevenueEachPort: 1000000000,
      totalContainerQuantityEachPort: 50,
      salesCallCountEachPort: 10,
      ports: 4,
      quantityStandardDeviation: 1,
      revenueStandardDeviation: 500000,
    },
  },
];

const ConfigurationPanel = ({ portStats, formatIDR, generateFormData, handlePresetSelect, handlePortSelect, handleRevenueSelect, handleQuantitySelect, handleGenerateChange, deckId, refreshCards, refreshContainers }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manualCardForm, setManualCardForm] = useState({
    origin: "",
    destination: "",
    priority: "Committed",
    quantity: 1,
    revenuePerContainer: 0,
  });

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

  const handleManualCardSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create the card
      const cardResponse = await api.post("/cards", {
        priority: manualCardForm.priority,
        origin: manualCardForm.origin,
        destination: manualCardForm.destination,
        quantity: parseInt(manualCardForm.quantity),
        revenue: calculateTotalRevenue(),
      });

      // Then attach the card to the deck
      await api.post(`/decks/${deckId}/add-card`, {
        card_id: cardResponse.data.id,
      });

      // Refresh the card list
      await refreshCards();

      // Refresh the container list
      await refreshContainers();

      toast.success("Sales call card created and added to deck!");

      // Reset form
      setManualCardForm({
        origin: "",
        destination: "",
        priority: "Committed",
        quantity: 1,
        revenuePerContainer: 0,
      });
    } catch (error) {
      toast.error("Failed to create sales call card");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedPorts, setSelectedPorts] = useState(4);
  const [availablePorts, setAvailablePorts] = useState({
    4: ["SBY", "MKS", "MDN", "JYP"],
    5: ["SBY", "MKS", "MDN", "JYP", "BPN"],
    6: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS"],
    7: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR"],
    8: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"],
  });

  // Add before the form
  const getAvailableDestinations = () => {
    return availablePorts[selectedPorts].filter((port) => port !== manualCardForm.origin);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <StatsPanel portStats={portStats} formatIDR={formatIDR} />
      </div>
      <div className="col-span-8">
        <div className="bg-white rounded-lg shadow p-4">
          <TabGroup>
            <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                Manual Generate
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                Auto Generate
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
      ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                File Generate
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                Quick Presets
              </Tab>
            </TabList>

            <TabPanels className="mt-2">
              <TabPanel>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {/* Port Selection Card */}
                  <div className="mb-8">
                    <div className="flex items-center">
                      <BiAnchor className="text-blue-500 text-2xl mr-2" />
                      <h3 className="text-1xl font-bold text-gray-800 mb-3">Port Configuration</h3>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="grid grid-cols-5 gap-3">
                        {[4, 5, 6, 7, 8].map((portCount) => (
                          <button
                            key={portCount}
                            onClick={() => {
                              setSelectedPorts(portCount);
                              setManualCardForm((prev) => ({
                                ...prev,
                                origin: "",
                                destination: "",
                              }));
                            }}
                            className={`
                relative overflow-hidden rounded-lg transition-all duration-200
                ${selectedPorts === portCount ? "bg-blue-500 text-white shadow-lg scale-105" : "bg-white text-gray-600 hover:bg-blue-50"}
                p-4 border-2 border-transparent hover:border-blue-300
              `}
                          >
                            <div className="text-1xl font-bold mb-1">{portCount}</div>
                            <div className="text-xs">Ports</div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600 mb-2">Available Ports:</div>
                        <div className="flex flex-wrap gap-2">
                          {availablePorts[selectedPorts].map((port) => (
                            <span key={port} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                              {port}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sales Call Card Form */}
                  <form onSubmit={handleManualCardSubmit}>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center mb-4">
                          <FaShip className="text-blue-500 text-xl mr-2" />
                          <h3 className="text-1xl font-bold text-gray-800">Create Sales Call Card</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          {/* Origin & Destination */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Origin Port</label>
                              <select name="origin" value={manualCardForm.origin} onChange={handleManualCardChange} required className="w-full p-3 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                                <option value="">Select Origin Port</option>
                                {availablePorts[selectedPorts].map((port) => (
                                  <option key={port} value={port}>
                                    {port}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Destination Port</label>
                              <select
                                name="destination"
                                value={manualCardForm.destination}
                                onChange={handleManualCardChange}
                                required
                                disabled={!manualCardForm.origin}
                                className={`w-full p-3 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors
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

                          {/* Priority & Type */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                              <select name="priority" value={manualCardForm.priority} onChange={handleManualCardChange} className="w-full p-3 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                                <option value="Committed">Committed</option>
                                <option value="Non-Committed">Non-Committed</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Container Type</label>
                              <div className="p-3 bg-gray-100 rounded-lg text-gray-500 text-sm">Auto-generated (Dry/Reefer)</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Revenue Section */}
                      <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              value={manualCardForm.quantity}
                              onChange={handleManualCardChange}
                              min="1"
                              required
                              className="w-full p-3 bg-white border-2 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Revenue/Container</label>
                            <input
                              type="number"
                              name="revenuePerContainer"
                              value={manualCardForm.revenuePerContainer}
                              onChange={handleManualCardChange}
                              min="0"
                              required
                              className="w-full p-3 bg-white border-2 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue</label>
                            <div className="p-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-800">{formatIDR(calculateTotalRevenue())}</div>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium 
        hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
        focus:ring-offset-2 transition-all duration-200
        ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {isSubmitting ? "Creating..." : "Create Sales Call Card"}
                        </button>
                      </div>
                    </div>
                  </form>
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
                    <h3 className="text-md font-semibold text-gray-800">Total Ports</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[4, 5, 6].map((port) => (
                        <button
                          key={port}
                          onClick={() => handlePortSelect(port)}
                          className={`text-xs p-4 rounded-lg border-2 transition-colors
                                    ${generateFormData.ports === port ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                        >
                          {port} Ports
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr />
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-800">Sales Call Revenue Configuration</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[250_000_000, 500_000_000, 750_000_000].map((revenue) => (
                        <button
                          key={revenue}
                          onClick={() => handleRevenueSelect(revenue)}
                          className={`text-xs p-4 rounded-lg border-2 transition-colors
                                    ${generateFormData.totalRevenueEachPort === revenue ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                        >
                          {formatIDR(revenue)}
                        </button>
                      ))}
                      <div className="relative">
                        <input
                          type="number"
                          name="totalRevenueEachPort"
                          value={generateFormData.totalRevenueEachPort}
                          onChange={handleGenerateChange}
                          placeholder="Edit revenue manually"
                          className="text-base w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <span className="absolute bottom-2 right-2 text-xs text-gray-500">Edit revenue manually</span>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-800">Sales Call Quantity Configuration</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[15, 20, 25].map((quantity) => (
                        <button
                          key={quantity}
                          onClick={() => handleQuantitySelect(quantity)}
                          className={`text-xs p-4 rounded-lg border-2 transition-colors
                                    ${generateFormData.totalContainerQuantityEachPort === quantity ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                        >
                          {quantity} Containers
                        </button>
                      ))}
                      <div className="relative">
                        <input
                          type="number"
                          name="totalContainerQuantityEachPort"
                          value={generateFormData.totalContainerQuantityEachPort}
                          onChange={handleGenerateChange}
                          placeholder="Edit container quantity manually"
                          min="1"
                          max="100"
                          className="text-base w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <span className="absolute bottom-2 right-2 text-xs text-gray-500">Edit container quantity manually</span>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">Standard Deviation</h3>
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
              <TabPanel>
                <FileGeneratePanel deckId={deckId} refreshCards={refreshCards} refreshContainers={refreshContainers} />
              </TabPanel>{" "}
              <TabPanel>
                <FileGeneratePanel deckId={deckId} refreshCards={refreshCards} refreshContainers={refreshContainers} />
              </TabPanel>
              <TabPanel>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Presets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {PRESET_CONFIGS.map((preset) => (
                      <button
                        key={preset.title}
                        onClick={() => handlePresetSelect(preset.config)}
                        className="group p-6 rounded-xl border-2 border-gray-200
            hover:border-blue-500 transition-all duration-200
            bg-white shadow-sm hover:shadow-md text-left"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">{preset.icon}</div>
                          <h3 className="font-semibold text-gray-800">{preset.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{preset.desc}</p>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500">Revenue: {formatIDR(preset.config.totalRevenueEachPort)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
