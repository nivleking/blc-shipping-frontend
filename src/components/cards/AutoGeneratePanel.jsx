import { toast } from "react-toastify";
import { AiOutlineCopy } from "react-icons/ai";

const AutoGeneratePanel = ({ formatIDR, generateFormData, handleGenerateChange, handlePortSelect, handleRevenueSelect, handleQuantitySelect }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Auto Form */}
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
        <div className="text-xs text-gray-500">Edit the JSON directly or use the form controls below</div>
      </div>
      <hr />
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-800">Total Ports</h3>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              min="2"
              max="10"
              value={generateFormData.ports}
              onChange={(e) => handlePortSelect(parseInt(e.target.value))}
              className="text-base w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter total ports (2-10)"
            />
            <span className="absolute bottom-2 right-2 text-xs text-gray-500">Enter total ports (2-10)</span>
          </div>

          {/* Available Ports Display */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-sm text-gray-600 mb-2">Available Ports:</div>
            <div className="flex flex-wrap gap-2">
              {availablePorts[generateFormData.ports]?.map((port) => (
                <span key={port} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {port}
                </span>
              ))}
            </div>
          </div>
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
  );
};

export default AutoGeneratePanel;
