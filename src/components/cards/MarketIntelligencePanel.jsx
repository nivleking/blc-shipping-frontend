import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { toast } from "react-toastify";
import { BsUpload, BsTable, BsInfoCircle } from "react-icons/bs";

const PriceTable = ({ origin, prices }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Origin: {origin}</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reefer</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dry</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prices.map((price, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{price.destination}</td>
              <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{new Intl.NumberFormat("id-ID").format(price.reefer)}</td>
              <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{new Intl.NumberFormat("id-ID").format(price.dry)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PenaltyTable = () => (
  <div className="bg-red-50 rounded-lg shadow-sm p-4">
    <h3 className="text-lg font-semibold text-red-800 mb-3">Penalties per Container</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-red-200">
        <thead className="bg-red-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Type</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-red-700 uppercase">Committed</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-red-700 uppercase">Non-Committed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-red-200">
          <tr className="hover:bg-red-50">
            <td className="px-4 py-3 text-sm text-red-900">Dry</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">8,000,000</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">4,000,000</td>
          </tr>
          <tr className="hover:bg-red-50">
            <td className="px-4 py-3 text-sm text-red-900">Reefer</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">15,000,000</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">9,000,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const MarketIntelligencePanel = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const priceData = {
    SBY: [
      { destination: "MKS", reefer: 30000000, dry: 18000000 },
      { destination: "MDN", reefer: 11000000, dry: 6000000 },
      { destination: "JYP", reefer: 24000000, dry: 16200000 },
    ],
    MDN: [
      { destination: "SBY", reefer: 22000000, dry: 13000000 },
      { destination: "MKS", reefer: 24000000, dry: 14000000 },
      { destination: "JYP", reefer: 22000000, dry: 14000000 },
    ],
    MKS: [
      { destination: "SBY", reefer: 18000000, dry: 10000000 },
      { destination: "MDN", reefer: 20000000, dry: 12000000 },
      { destination: "JYP", reefer: 24000000, dry: 16000000 },
    ],
    JYP: [
      { destination: "SBY", reefer: 19000000, dry: 13000000 },
      { destination: "MKS", reefer: 23000000, dry: 13000000 },
      { destination: "MDN", reefer: 17000000, dry: 11000000 },
    ],
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      // File processing logic here
      toast.success("Market intelligence data uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload market intelligence data");
    } finally {
      setIsUploading(false);
    }
  };

  // Add new states
  const [selectedPorts, setSelectedPorts] = useState(4);
  const [availablePorts, setAvailablePorts] = useState({
    4: ["SBY", "MKS", "MDN", "JYP"],
    5: ["SBY", "MKS", "MDN", "JYP", "BPN"],
    6: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS"],
    7: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR"],
    8: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"],
  });

  // Add new price state
  const [manualPrices, setManualPrices] = useState({});

  // Add price change handler
  const handlePriceChange = (origin, destination, type, value) => {
    setManualPrices((prev) => ({
      ...prev,
      [origin]: {
        ...prev[origin],
        [destination]: {
          ...prev[origin]?.[destination],
          [type]: parseInt(value) || 0,
        },
      },
    }));
  };

  // Add new state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add submit handler
  const handleSubmitPrices = async () => {
    setIsSubmitting(true);
    try {
      // Validate if all prices are filled
      for (const origin of availablePorts[selectedPorts]) {
        for (const dest of availablePorts[selectedPorts]) {
          if (origin === dest) continue;

          const prices = manualPrices[origin]?.[dest];
          if (!prices?.reefer || !prices?.dry) {
            toast.error(`Please fill all prices for ${origin} to ${dest}`);
            return;
          }
        }
      }

      toast.success("Market intelligence data saved successfully!");

      // Reset form after success
      setManualPrices({});
    } catch (error) {
      toast.error("Failed to save market intelligence data");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Market Intelligence</h2>
            <p className="text-blue-100">View and manage shipping route prices</p>
          </div>
          <BsInfoCircle className="w-6 h-6 text-blue-100" />
        </div>
      </div>

      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
        <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            <div className="flex items-center justify-center gap-2">
              <BsTable />
              Price Tables
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            <div className="flex items-center justify-center gap-2">Manual Entry</div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            <div className="flex items-center justify-center gap-2">
              <BsUpload />
              Upload Data
            </div>
          </Tab>
        </TabList>

        <TabPanels className="mt-4">
          <TabPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(priceData).map(([origin, prices]) => (
                <PriceTable key={origin} origin={origin} prices={prices} />
              ))}
            </div>
            <div className="mt-6">
              <PenaltyTable />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-6">
              {/* Port Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Select Number of Ports</h3>
                <div className="grid grid-cols-5 gap-3">
                  {[4, 5, 6, 7, 8].map((portCount) => (
                    <button
                      key={portCount}
                      onClick={() => setSelectedPorts(portCount)}
                      className={`
                      relative overflow-hidden rounded-lg transition-all duration-200
                      ${selectedPorts === portCount ? "bg-blue-500 text-white shadow-lg scale-105" : "bg-white text-gray-600 hover:bg-blue-50"}
                      p-4 border-2 border-transparent hover:border-blue-300
                    `}
                    >
                      <div className="text-2xl font-bold mb-1">{portCount}</div>
                      <div className="text-xs">Ports</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePorts[selectedPorts].map((origin) => (
                  <div key={origin} className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Origin: {origin}</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Destination</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Reefer</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Dry</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {availablePorts[selectedPorts]
                          .filter((dest) => dest !== origin)
                          .map((destination) => (
                            <tr key={destination}>
                              <td className="px-4 py-3 text-sm text-gray-900">{destination}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  className="w-full p-1 text-right border rounded"
                                  value={manualPrices[origin]?.[destination]?.reefer || ""}
                                  onChange={(e) => handlePriceChange(origin, destination, "reefer", e.target.value)}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input type="number" className="w-full p-1 text-right border rounded" value={manualPrices[origin]?.[destination]?.dry || ""} onChange={(e) => handlePriceChange(origin, destination, "dry", e.target.value)} />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitPrices}
                  disabled={isSubmitting}
                  className={`
              px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-200
              ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"}
            `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    "Save Market Intelligence Data"
                  )}
                </button>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center 
                ${isUploading ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              >
                <input type="file" id="file-upload" className="hidden" accept=".json,.xlsx,.xls" onChange={(e) => handleFileUpload(e.target.files[0])} />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`rounded-full p-4 
                      ${isUploading ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      <BsUpload
                        className={`w-8 h-8 
                        ${isUploading ? "text-blue-500" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">{isUploading ? "Uploading..." : "Upload market intelligence data"}</p>
                      <p className="text-xs text-gray-500">Drop your file here or click to browse</p>
                    </div>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg
                      hover:bg-blue-600 transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                </label>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Supported Formats</h3>
                <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                  <li>JSON files (.json)</li>
                  <li>Excel files (.xlsx, .xls)</li>
                </ul>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default MarketIntelligencePanel;
