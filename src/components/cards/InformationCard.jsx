import React, { useState } from "react";
import { BsLightningCharge, BsExclamationTriangle, BsFileEarmarkSpreadsheet, BsKeyboard } from "react-icons/bs";
import { Tab } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const InformationCard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  // Each guide section is separated into components for clarity
  const AutoGenerateGuide = () => (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Auto Generate - Complete Workflow</h2>
        <p className="text-gray-600">Auto Generate creates multiple cards at once with balanced distribution. Follow these steps for best results:</p>
      </div>

      {/* Step 1 - Market Intelligence */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">1</div>
          <h3 className="font-semibold text-blue-800">Set Up Market Intelligence First</h3>
        </div>
        <p className="text-blue-700 mb-2">Market Intelligence provides pricing data that the Auto Generator uses as a reference.</p>
        <div className="bg-white p-3 rounded border border-blue-200">
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
            <li>Go to the Market Intelligence tab from the main Deck page</li>
            <li>Choose one of these three methods:</li>
            <ul className="list-disc pl-5 mt-1 mb-1">
              <li>
                <strong>Quick Setup:</strong> Click "Generate Default Data" in the Price Tables tab
              </li>
              <li>
                <strong>Manual Setup:</strong> Go to "Manual Entry" tab and configure pricing for each route
              </li>
              <li>
                <strong>Spreadsheet Import:</strong> Go to "Upload Data" tab and upload a price spreadsheet
              </li>
            </ul>
            <li>Click "Save Market Intelligence" when finished</li>
          </ol>
        </div>
      </div>

      {/* Step 2 - Generate Cards */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">2</div>
          <h3 className="font-semibold text-blue-800">Configure Auto Generate Parameters</h3>
        </div>
        <p className="text-blue-700 mb-2">Now go to the Cards tab, select "Auto Generate" and configure these key parameters:</p>
        <div className="bg-white p-3 rounded border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Essential Parameters</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Port Count:</strong> Number of ports (4-10)
                </li>
                <li>
                  <strong>Revenue/Port:</strong> Total revenue per port
                </li>
                <li>
                  <strong>Containers/Port:</strong> Container quantity per port
                </li>
                <li>
                  <strong>Sales Calls/Port:</strong> Number of cards per port
                </li>
                <li>
                  <strong>Use Market Intelligence:</strong> Toggle to use pricing data
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Recommended Values</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>Ports: 4 (beginners), 6 (intermediate), 8 (advanced)</li>
                <li>Revenue: 250,000,000 per port</li>
                <li>Containers: 15 per port</li>
                <li>Sales Calls: 8 per port</li>
                <li>Quantity Variation: 1.0</li>
                <li>Revenue Variation: 500,000</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 - Generate and Confirm */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">3</div>
          <h3 className="font-semibold text-blue-800">Generate and Review Cards</h3>
        </div>
        <p className="text-blue-700 mb-2">Once your parameters are set, generate and confirm the cards:</p>
        <div className="bg-white p-3 rounded border border-blue-200">
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
            <li>Click the "Generate Cards" button in the top navigation bar</li>
            <li>Review the confirmation popup and click "Generate" to confirm</li>
            <li>Wait for the system to create all cards (this may take a moment)</li>
            <li>Review the generated cards in the Cards list</li>
            <li>Check the distribution statistics in the Stats panel</li>
          </ol>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Important Notes</h3>
        <ul className="list-disc pl-4 text-sm text-yellow-700 space-y-1">
          <li>Auto Generate will delete any existing cards in the deck</li>
          <li>More ports means more cards and a more complex simulation</li>
          <li>The system maintains a balance of 80% Dry and 20% Reefer containers</li>
          <li>Approximately 70% of cards will be Non-Committed and 30% Committed</li>
          <li>Each origin will have cards going to all other destinations</li>
          <li>If Market Intelligence isn't available, the system will use default pricing</li>
        </ul>
      </div>

      {/* Examples */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Example Configuration Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-700 mb-1">Basic Setup (4 Ports)</h4>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>Total Cards: 32 (8 per port)</li>
              <li>Total Containers: 60 (15 per port)</li>
              <li>Total Revenue: Rp 1,000,000,000 (250M per port)</li>
              <li>Ports: SBY, MKS, MDN, JYP</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-700 mb-1">Advanced Setup (8 Ports)</h4>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>Total Cards: 64 (8 per port)</li>
              <li>Total Containers: 120 (15 per port)</li>
              <li>Total Revenue: Rp 2,000,000,000 (250M per port)</li>
              <li>Ports: SBY, MKS, MDN, JYP, BPN, BKS, BGR, BTH</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const ManualGenerateGuide = () => (
    <div className="space-y-6">
      <div className="border-l-4 border-green-500 pl-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Manual Card Creation</h2>
        <p className="text-gray-600">Manual generation gives you complete control over each card's properties. Ideal for creating specific test scenarios.</p>
      </div>

      {/* Step 1 - Navigate */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">1</div>
          <h3 className="font-semibold text-green-800">Select Manual Generate Tab</h3>
        </div>
        <p className="text-green-700 mb-2">Go to the Cards tab, then select the "Manual Generate" option from the configuration panel.</p>
      </div>

      {/* Step 2 - Fill Form */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">2</div>
          <h3 className="font-semibold text-green-800">Fill Card Details</h3>
        </div>
        <p className="text-green-700 mb-2">Complete all required fields in the form:</p>
        <div className="bg-white p-3 rounded border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Card Properties</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Card ID:</strong> Unique identifier
                </li>
                <li>
                  <strong>Origin Port:</strong> Where containers are loaded
                </li>
                <li>
                  <strong>Destination Port:</strong> Where containers are delivered
                </li>
                <li>
                  <strong>Priority:</strong> Committed or Non-Committed
                </li>
                <li>
                  <strong>Quantity:</strong> Number of containers
                </li>
                <li>
                  <strong>Revenue/Container:</strong> Price per container
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Field Guidelines</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>Origin and Destination must be different</li>
                <li>ID must be unique across all cards</li>
                <li>Quantity must be at least 1</li>
                <li>Revenue must be greater than 0</li>
                <li>The system will automatically calculate total revenue</li>
                <li>Container type is determined by card ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 - Add Card */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">3</div>
          <h3 className="font-semibold text-green-800">Add Each Card</h3>
        </div>
        <p className="text-green-700 mb-2">Click "Add Card" to create the card. Repeat this process for each card you want to add.</p>
        <div className="bg-white p-3 rounded border border-green-200">
          <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
            <li>Each card appears in the list immediately after creation</li>
            <li>Containers are automatically created for each card</li>
            <li>You can create as many cards as needed</li>
            <li>Cards can be deleted individually if needed</li>
            <li>The Stats panel updates as you add cards</li>
          </ul>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Manual Generation Tips</h3>
        <ul className="list-disc pl-4 text-sm text-yellow-700 space-y-1">
          <li>Use Market Intelligence as a reference for pricing</li>
          <li>
            For a balanced simulation, aim for:
            <ul className="list-disc pl-4 mt-1">
              <li>70% Non-Committed / 30% Committed cards</li>
              <li>80% Dry / 20% Reefer containers</li>
            </ul>
          </li>
          <li>For Reefer containers, use a card ID divisible by 5 (5, 10, 15, etc.)</li>
          <li>Create a mix of high-value (large quantity) and low-value cards</li>
          <li>Ensure each origin has cards going to multiple destinations</li>
        </ul>
      </div>

      {/* Example Card */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Example Card</h3>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm">
            <strong>ID:</strong> 123
          </p>
          <p className="text-sm">
            <strong>Origin:</strong> SBY
          </p>
          <p className="text-sm">
            <strong>Destination:</strong> MKS
          </p>
          <p className="text-sm">
            <strong>Priority:</strong> Non-Committed
          </p>
          <p className="text-sm">
            <strong>Container Type:</strong> Dry (determined by system)
          </p>
          <p className="text-sm">
            <strong>Quantity:</strong> 5 containers
          </p>
          <p className="text-sm">
            <strong>Revenue/Container:</strong> Rp 15,000,000
          </p>
          <p className="text-sm">
            <strong>Total Revenue:</strong> Rp 75,000,000
          </p>
        </div>
      </div>
    </div>
  );

  const FileGenerateGuide = () => (
    <div className="space-y-6">
      <div className="border-l-4 border-purple-500 pl-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Excel Import Method</h2>
        <p className="text-gray-600">Import many cards at once using an Excel spreadsheet. Perfect for bulk creation or reusing card sets.</p>
      </div>

      {/* Step 1 - Download Template */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">1</div>
          <h3 className="font-semibold text-purple-800">Download Excel Template</h3>
        </div>
        <p className="text-purple-700 mb-2">Start with the provided template to ensure your import works correctly:</p>
        <div className="bg-white p-3 rounded border border-purple-200">
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
            <li>Go to the Cards tab and select "File Generate"</li>
            <li>Click the "Download Template" button</li>
            <li>Save the template to your computer</li>
            <li>
              The template includes these sheets:
              <ul className="list-disc pl-5 mt-1 mb-1">
                <li>
                  <strong>Instructions:</strong> How to use the template
                </li>
                <li>
                  <strong>Sales Call Cards:</strong> Where you'll enter data
                </li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      {/* Step 2 - Fill Template */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">2</div>
          <h3 className="font-semibold text-purple-800">Fill Excel Template</h3>
        </div>
        <p className="text-purple-700 mb-2">Enter your card data in the Sales Call Cards sheet:</p>
        <div className="bg-white p-3 rounded border border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Required Columns</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>
                  <strong>ID:</strong> Unique identifier
                </li>
                <li>
                  <strong>Origin:</strong> Port code (SBY, MKS, etc.)
                </li>
                <li>
                  <strong>Destination:</strong> Port code (different from Origin)
                </li>
                <li>
                  <strong>Priority:</strong> Committed or Non-Committed
                </li>
                <li>
                  <strong>Container Type:</strong> Dry or Reefer
                </li>
                <li>
                  <strong>Quantity:</strong> Number of containers
                </li>
                <li>
                  <strong>Revenue/Container:</strong> Price per container
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Template Guidelines</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>Keep the header row intact</li>
                <li>Don't modify the column structure</li>
                <li>Add as many rows as needed</li>
                <li>Valid port codes: SBY, MKS, MDN, JYP, BPN, BKS, BGR, BTH, AMQ, SMR</li>
                <li>Total Revenue is calculated automatically</li>
                <li>Save the file as .xlsx or .xls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 - Upload & Review */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">3</div>
          <h3 className="font-semibold text-purple-800">Upload and Confirm</h3>
        </div>
        <p className="text-purple-700 mb-2">Upload and review your file:</p>
        <div className="bg-white p-3 rounded border border-purple-200">
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
            <li>Return to the File Generate tab in the Cards section</li>
            <li>Click "Upload Excel File" or drag and drop your file</li>
            <li>A preview will appear showing the parsed data</li>
            <li>Review the data for any errors</li>
            <li>Click "Import Cards" to confirm</li>
            <li>Wait for all cards to be created</li>
          </ol>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Important Notes</h3>
        <ul className="list-disc pl-4 text-sm text-yellow-700 space-y-1">
          <li>The import will replace any existing cards in the deck</li>
          <li>If validation errors occur, fix them in the Excel file and try again</li>
          <li>
            Common validation issues include:
            <ul className="list-disc pl-4 mt-1">
              <li>Invalid port codes</li>
              <li>Origin and destination being the same</li>
              <li>Invalid container types (must be Dry or Reefer)</li>
              <li>Invalid priority values (must be Committed or Non-Committed)</li>
              <li>Missing required fields</li>
            </ul>
          </li>
          <li>You can save your Excel files for reuse in different decks or semesters</li>
        </ul>
      </div>

      {/* Example Excel Data */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Example Excel Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-2 py-1 text-left">ID</th>
                <th className="px-2 py-1 text-left">Origin</th>
                <th className="px-2 py-1 text-left">Destination</th>
                <th className="px-2 py-1 text-left">Priority</th>
                <th className="px-2 py-1 text-left">Container Type</th>
                <th className="px-2 py-1 text-right">Quantity</th>
                <th className="px-2 py-1 text-right">Revenue/Container</th>
                <th className="px-2 py-1 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="bg-white">
                <td className="px-2 py-1">101</td>
                <td className="px-2 py-1">SBY</td>
                <td className="px-2 py-1">MKS</td>
                <td className="px-2 py-1">Non-Committed</td>
                <td className="px-2 py-1">Dry</td>
                <td className="px-2 py-1 text-right">3</td>
                <td className="px-2 py-1 text-right">15,000,000</td>
                <td className="px-2 py-1 text-right">45,000,000</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-2 py-1">105</td>
                <td className="px-2 py-1">SBY</td>
                <td className="px-2 py-1">MDN</td>
                <td className="px-2 py-1">Committed</td>
                <td className="px-2 py-1">Reefer</td>
                <td className="px-2 py-1 text-right">2</td>
                <td className="px-2 py-1 text-right">25,000,000</td>
                <td className="px-2 py-1 text-right">50,000,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Tabbed Navigation */}
      <div className="border-b border-gray-200">
        <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
          <Tab.List className="flex overflow-x-auto space-x-1 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm font-medium leading-5 rounded-lg",
                  "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60",
                  selected ? "bg-blue-600 text-white shadow" : "text-gray-700 bg-white hover:bg-blue-100"
                )
              }
            >
              <div className="flex items-center justify-center space-x-1">
                <BsLightningCharge />
                <span>Auto Generate</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm font-medium leading-5 rounded-lg",
                  "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60",
                  selected ? "bg-green-600 text-white shadow" : "text-gray-700 bg-white hover:bg-green-100"
                )
              }
            >
              <div className="flex items-center justify-center space-x-1">
                <BsKeyboard />
                <span>Manual Generate</span>
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm font-medium leading-5 rounded-lg",
                  "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-purple-400 ring-white ring-opacity-60",
                  selected ? "bg-purple-600 text-white shadow" : "text-gray-700 bg-white hover:bg-purple-100"
                )
              }
            >
              <div className="flex items-center justify-center space-x-1">
                <BsFileEarmarkSpreadsheet />
                <span>File Generate</span>
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel>{<AutoGenerateGuide />}</Tab.Panel>
            <Tab.Panel>{<ManualGenerateGuide />}</Tab.Panel>
            <Tab.Panel>{<FileGenerateGuide />}</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Common Content - Appears at the bottom regardless of selected tab */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <div className="flex items-center gap-2 mb-2">
          <BsExclamationTriangle className="text-amber-500" />
          <h3 className="font-medium text-gray-800">General Card Generation Guidelines</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Card Distribution</h4>
            <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
              <li>Aim for a balanced mix of origins and destinations</li>
              <li>Container distribution: 80% Dry, 20% Reefer</li>
              <li>Priority distribution: 70% Non-Committed, 30% Committed</li>
              <li>More ports = more cards = more complex simulation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Revenue Guidelines</h4>
            <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
              <li>Typical revenue per container: Rp 10M - Rp 30M</li>
              <li>Reefer containers should have ~50% higher revenue</li>
              <li>Longer routes should have higher revenue</li>
              <li>Create a mix of high and low value contracts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationCard;
