import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import StatsPanel from "./StatsPanel";
import FileGeneratePanel from "./FileGeneratePanel";
import ManualGeneratePanel from "./ManualGeneratePanel";
import AutoGeneratePanel from "./AutoGeneratePanel";

const ConfigurationPanel = ({ portStats, formatIDR, generateFormData, handlePresetSelect, handlePortSelect, handleRevenueSelect, handleQuantitySelect, handleGenerateChange, deckId, refreshData, handleGenerateButtonClick }) => {
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
            </TabList>

            <TabPanels className="mt-2">
              <TabPanel>
                <ManualGeneratePanel
                  formatIDR={formatIDR}
                  deckId={deckId}
                  refreshData={refreshData}
                />
              </TabPanel>
              <TabPanel>
                <FileGeneratePanel deckId={deckId} refreshData={refreshData} />
              </TabPanel>
              <TabPanel>
                <AutoGeneratePanel
                  formatIDR={formatIDR}
                  generateFormData={generateFormData}
                  handleGenerateChange={handleGenerateChange}
                  handlePortSelect={handlePortSelect}
                  handleRevenueSelect={handleRevenueSelect}
                  handleQuantitySelect={handleQuantitySelect}
                  deckId={deckId}
                  onGenerate={handleGenerateButtonClick}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
