import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { AiOutlineCopy } from "react-icons/ai";
import StatsPanel from "./StatsPanel";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../axios/axios";
import { BsBoxSeam, BsGear, BsRocket, BsLightningCharge } from "react-icons/bs";
import FileGeneratePanel from "./FileGeneratePanel";
import ManualGeneratePanel from "./ManualGeneratePanel";
import AutoGeneratePanel from "./AutoGeneratePanel";

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

const validateId = (id) => {
  const num = parseInt(id);
  return !isNaN(num) && num >= 1 && num <= 99999;
};

const ConfigurationPanel = ({ portStats, formatIDR, generateFormData, handlePresetSelect, handlePortSelect, handleRevenueSelect, handleQuantitySelect, handleGenerateChange, deckId, refreshCards, refreshContainers }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manualCardForm, setManualCardForm] = useState({
    id: "",
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
      if (!validateId(manualCardForm.id)) {
        toast.error("Invalid ID. Must be a number between 1-99999");
        return;
      }

      const cardResponse = await api.post("/cards", {
        id: manualCardForm.id,
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
      console.error("Error creating card:", error);
      toast.error(error.response?.data?.message || "Failed to create card");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedPorts, setSelectedPorts] = useState(4);
  const [availablePorts, setAvailablePorts] = useState({
    2: ["SBY", "MKS"],
    3: ["SBY", "MKS", "MDN"],
    4: ["SBY", "MKS", "MDN", "JYP"],
    5: ["SBY", "MKS", "MDN", "JYP", "BPN"],
    6: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS"],
    7: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR"],
    8: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"],
    9: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ"],
    10: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"],
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
                File Generate
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                Auto Generate
              </Tab>

              {/* <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                Quick Presets
              </Tab> */}
            </TabList>

            <TabPanels className="mt-2">
              <TabPanel>
                <ManualGeneratePanel formatIDR={formatIDR} deckId={deckId} refreshCards={refreshCards} refreshContainers={refreshContainers} />
              </TabPanel>
              <TabPanel>
                <FileGeneratePanel deckId={deckId} refreshCards={refreshCards} refreshContainers={refreshContainers} />
              </TabPanel>
              <TabPanel>
                <AutoGeneratePanel
                  formatIDR={formatIDR}
                  generateFormData={generateFormData}
                  handleGenerateChange={handleGenerateChange}
                  handlePortSelect={handlePortSelect}
                  handleRevenueSelect={handleRevenueSelect}
                  handleQuantitySelect={handleQuantitySelect}
                />
              </TabPanel>
              {/* <TabPanel>
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
              </TabPanel> */}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
