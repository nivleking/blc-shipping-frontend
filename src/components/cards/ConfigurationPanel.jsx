import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { BsBoxSeam, BsGear, BsLightning } from "react-icons/bs";
import { AiOutlineCopy } from "react-icons/ai";
import StatsPanel from "./StatsPanel";
import { toast } from "react-toastify";

const ConfigurationPanel = ({ portStats, formatIDR, generateFormData, handlePresetSelect, handlePortSelect, handleRevenueSelect, handleQuantitySelect, handleGenerateChange }) => {
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

              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
                }
              >
                Manual Settings
                {/* TODO: create manual settings to add cards manually */}
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
                        totalRevenueEachPort: 250000000,
                        totalContainerQuantityEachPort: 15,
                        salesCallCountEachPort: 8,
                      },
                    },
                    {
                      title: "Medium Revenue",
                      desc: "35 containers per port - 10 sales cards per port - 350M revenue",
                      icon: <BsGear className="text-blue-500" size={24} />,
                      config: {
                        totalRevenueEachPort: 350000000,
                        totalContainerQuantityEachPort: 25,
                        salesCallCountEachPort: 10,
                      },
                    },
                    {
                      title: "High Volume",
                      desc: "50 containers per port - 10 sales cards per port - 1B revenue",
                      icon: <BsLightning className="text-blue-500" size={24} />,
                      config: {
                        totalRevenueEachPort: 1000000000,
                        totalContainerQuantityEachPort: 50,
                        salesCallCountEachPort: 10,
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
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
