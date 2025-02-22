import React, { useState } from "react";
import { GiShipBow } from "react-icons/gi";
import { BiCube } from "react-icons/bi";
import { MdOutlineGridOn } from "react-icons/md";
import { FiHelpCircle } from "react-icons/fi";
import ShipLayout3D from "./ShipLayout3D";
import RenderShipBayLayout from "../../components/simulations/RenderShipBayLayout";

const GuideModal = ({ onClose }) => {
  const [previewConfig, setPreviewConfig] = useState({
    rows: 4,
    columns: 6,
    bayCount: 2,
  });

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <GiShipBow className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Layout Guide</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Tips Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiHelpCircle className="text-blue-600" />
              Tips & Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Adjust the controls above to see how different configurations look
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Compare the 3D and 2D views to better understand the layout
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Consider practical limitations when planning your layout
              </li>
            </ul>
          </div>

          {/* Configuration Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 ">
            <h3 className="text-lg font-semibold mb-4">Layout Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rows (1-7)</label>
                <input type="number" min="1" max="7" value={previewConfig.rows} onChange={(e) => handleConfigChange("rows", parseInt(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Columns (1-8)</label>
                <input type="number" min="1" max="8" value={previewConfig.columns} onChange={(e) => handleConfigChange("columns", parseInt(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bay Count (1-8)</label>
                <input type="number" min="1" max="8" value={previewConfig.bayCount} onChange={(e) => handleConfigChange("bayCount", parseInt(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-2 gap-8">
            {/* 3D Visualization */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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

            {/* 2D Visualization */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  readonly={true} // Disable editing
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
