import React, { useState } from "react";
import { GiShipBow } from "react-icons/gi";
import { FiHelpCircle } from "react-icons/fi";
import { BiCube } from "react-icons/bi";
import { MdOutlineGridOn } from "react-icons/md";
import { TbCrane } from "react-icons/tb";
import ShipLayout3D from "./ShipLayout3D";
import Stevedoring from "./Stevedoring";
import RenderShipBayLayout from "../../components/simulations/RenderShipBayLayout";

const GuideModal = ({ onClose, isSimulationMode = false }) => {
  const [previewConfig, setPreviewConfig] = useState({
    rows: 2,
    columns: 2,
    bayCount: 4,
  });

  const [activeTab, setActiveTab] = useState("stevedoring");

  const handleConfigChange = (field, value) => {
    const limits = {
      rows: { min: 1, max: 7 },
      columns: { min: 1, max: 8 },
      bayCount: { min: 1, max: 8 },
    };

    const limitedValue = Math.min(Math.max(value, limits[field].min), limits[field].max);
    setPreviewConfig((prev) => ({ ...prev, [field]: limitedValue }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-1xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <GiShipBow className="w-4 h-4 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Ship Bay Guide</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button className={`py-3 px-6 ${activeTab === "stevedoring" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("stevedoring")}>
            <div className="flex items-center gap-2">
              <TbCrane className={activeTab === "stevedoring" ? "text-blue-600" : "text-gray-400"} />
              <span>Stevedoring</span>
            </div>
          </button>
          <button className={`py-3 px-6 ${activeTab === "shipBays" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("shipBays")}>
            <div className="flex items-center gap-2">
              <FiHelpCircle className={activeTab === "shipBays" ? "text-blue-600" : "text-gray-400"} />
              <span>Understanding Ship Bays</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 text-xs">
          {activeTab === "shipBays" && (
            <>
              {/* Ship Bay Concept Description */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiHelpCircle className="text-blue-600" />
                  Understanding Ship Bays
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>A ship bay is a vertical section of a container ship where containers are stacked. Here are the key concepts:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Bays</strong>: Sections of the ship from bow to stern
                    </li>
                    <li>
                      <strong>Rows</strong>: Vertical positions within a bay (bottom to top)
                    </li>
                    <li>
                      <strong>Columns</strong>: Horizontal positions within a bay (port to starboard)
                    </li>
                    <li>
                      <strong>Container ID</strong>: Typically shown as BayRowColumn (e.g., 123 = Bay 1, Row 2, Column 3)
                    </li>
                  </ul>

                  <p className="mt-2">
                    <strong>Important Rules:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Containers must be stacked from bottom to top (no floating containers)</li>
                    <li>Reefer (refrigerated) containers can only be placed in reefer bays</li>
                    <li>To access a container, all containers above it must be moved first</li>
                    <li>For optimal operations, containers going to the same port should be stacked together</li>
                  </ul>
                </div>
              </div>

              {/* Configuration Controls */}
              {!isSimulationMode && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold mb-4">Layout Configuration</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Rows (1-7)</label>
                      <input type="number" min="1" max="7" value={previewConfig.rows} onChange={(e) => handleConfigChange("rows", parseInt(e.target.value))} className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Columns (1-8)</label>
                      <input type="number" min="1" max="8" value={previewConfig.columns} onChange={(e) => handleConfigChange("columns", parseInt(e.target.value))} className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bay Count (1-8)</label>
                      <input type="number" min="1" max="8" value={previewConfig.bayCount} onChange={(e) => handleConfigChange("bayCount", parseInt(e.target.value))} className="w-full text-xs p-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>
              )}

              {/* Visualizations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <BiCube className="text-blue-600" />
                    3D Visualization
                  </h3>
                  <div className="aspect-square bg-white rounded-lg shadow-inner border border-gray-200">
                    <ShipLayout3D
                      baySize={{
                        rows: previewConfig.rows,
                        columns: previewConfig.columns,
                      }}
                      bayCount={previewConfig.bayCount}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <MdOutlineGridOn className="text-blue-600" />
                    2D Visualization
                  </h3>
                  <div className="aspect-square bg-white rounded-lg shadow-inner border border-gray-200 p-4">
                    <RenderShipBayLayout
                      bayCount={previewConfig.bayCount}
                      baySize={{
                        rows: previewConfig.rows,
                        columns: previewConfig.columns,
                      }}
                      bayTypes={Array(previewConfig.bayCount).fill("dry")}
                      readonly={true}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "stevedoring" && <Stevedoring />}
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
