import React, { useState } from "react";
import MarketIntelligenceUpload from "./MarketIntelligenceUpload";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BsFiletypeXlsx } from "react-icons/bs";
import MarketIntelligencePreviewModal from "./MarketIntelligencePreviewModal";
import "./UploadDataPanel.css";
import useToast from "../../../toast/useToast";

const UploadDataPanel = ({ handleUpload }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileUpload = (data) => {
    if (data) {
      setPreviewData(data);
      setShowPreviewModal(true);
    }
  };

  const handleConfirmUpload = () => {
    handleUpload(previewData);
    setShowPreviewModal(false);
    setPreviewData(null);
  };

  const downloadExcelTemplate = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add instructions to the workbook
      const infoSheet = XLSX.utils.aoa_to_sheet([
        ["Market Intelligence Template - Instructions"],
        [""],
        ["This template is used to define market intelligence price data for the shipping simulation."],
        ["Instructions:"],
        ["1. Each row represents a shipping route with its price"],
        ["2. Required columns: Origin, Destination, Type (Dry/Reefer), Price"],
        ["3. Valid port codes: SBY, MKS, MDN, JYP, BPN, BKS, BGR, BTH, AMQ, SMR"],
        ["4. Price should be entered as a number without currency symbols or commas"],
        ["5. For the same Origin-Destination pair, add separate rows for Dry and Reefer types"],
        [""],
        ["Example:"],
        ["Origin", "Destination", "Type", "Price"],
        ["SBY", "MDN", "Reefer", "30000000"],
        ["SBY", "MDN", "Dry", "18000000"],
      ]);

      XLSX.utils.book_append_sheet(wb, infoSheet, "Instructions");

      // Create data sheet with headers
      const headers = [["Origin", "Destination", "Type", "Price"]];

      // Create comprehensive sample data for 4 ports (SBY, MDN, MKS, JYP)
      const sampleData = [
        // SBY routes
        ["SBY", "MKS", "Reefer", 30000000],
        ["SBY", "MKS", "Dry", 18000000],
        ["SBY", "MDN", "Reefer", 22000000],
        ["SBY", "MDN", "Dry", 13000000],
        ["SBY", "JYP", "Reefer", 24000000],
        ["SBY", "JYP", "Dry", 16200000],

        // MKS routes
        ["MKS", "SBY", "Reefer", 18000000],
        ["MKS", "SBY", "Dry", 10000000],
        ["MKS", "MDN", "Reefer", 20000000],
        ["MKS", "MDN", "Dry", 12000000],
        ["MKS", "JYP", "Reefer", 24000000],
        ["MKS", "JYP", "Dry", 16000000],

        // MDN routes
        ["MDN", "SBY", "Reefer", 22000000],
        ["MDN", "SBY", "Dry", 13000000],
        ["MDN", "MKS", "Reefer", 24000000],
        ["MDN", "MKS", "Dry", 14000000],
        ["MDN", "JYP", "Reefer", 22000000],
        ["MDN", "JYP", "Dry", 14000000],

        // JYP routes
        ["JYP", "SBY", "Reefer", 19000000],
        ["JYP", "SBY", "Dry", 13000000],
        ["JYP", "MKS", "Reefer", 23000000],
        ["JYP", "MKS", "Dry", 13000000],
        ["JYP", "MDN", "Reefer", 17000000],
        ["JYP", "MDN", "Dry", 11000000],
      ];

      // Combine headers and data
      const wsData = [...headers, ...sampleData];

      // Create worksheet and add to workbook
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Market Intelligence");

      // Set column widths
      ws["!cols"] = [
        { wch: 10 }, // Origin
        { wch: 12 }, // Destination
        { wch: 10 }, // Type
        { wch: 15 }, // Price
      ];

      // Format price column as numbers
      for (let i = 2; i <= sampleData.length + 1; i++) {
        const cellRef = `D${i}`;
        if (ws[cellRef]) {
          ws[cellRef].z = "#,##0";
        }
      }

      // Add data validation for Type column
      const typeValidationComment = {
        t: "s",
        v: "Valid values: Reefer, Dry",
        r: "<t>Valid values: Reefer, Dry</t>",
        h: "Valid values: Reefer, Dry",
      };

      ws["C1"].c = [typeValidationComment];

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Create Blob and save
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "market_intelligence_template.xlsx");

      showSuccess("Template downloaded successfully");
    } catch (error) {
      console.error("Error generating Excel template:", error);
      showError("Failed to generate Excel template");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-800">Upload Market Intelligence</h3>
          <button onClick={downloadExcelTemplate} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <BsFiletypeXlsx className="text-blue-600" />
            <span>Download Excel Template</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Upload an Excel file containing market intelligence pricing data or select from existing data.</p>

        <MarketIntelligenceUpload onUpload={handleFileUpload} />
      </div>

      {/* Preview Modal */}
      {showPreviewModal && <MarketIntelligencePreviewModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} onConfirm={handleConfirmUpload} data={previewData} />}
    </div>
  );
};

export default UploadDataPanel;
