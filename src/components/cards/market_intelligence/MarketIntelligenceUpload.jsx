import { useState } from "react";
import * as XLSX from "xlsx";
import useToast from "../../../toast/useToast";

const MarketIntelligenceUpload = ({ onUpload }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    await processExcelFile(file);
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    await processExcelFile(file);
  };

  // Update the file processing logic to better handle the template format
  const processExcelFile = async (file) => {
    if (!file) return;

    // Validate file type
    const validExcelTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];

    if (!validExcelTypes.includes(file.type)) {
      showError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Look for a sheet named "Market Intelligence", otherwise use the first sheet
          // Skip "Instructions" sheet if it exists
          let sheetName;
          if (workbook.SheetNames.includes("Market Intelligence")) {
            sheetName = "Market Intelligence";
          } else {
            sheetName = workbook.SheetNames.find((name) => name !== "Instructions") || workbook.SheetNames[0];
          }

          const worksheet = workbook.Sheets[sheetName];

          // Convert Excel to JSON
          const rows = XLSX.utils.sheet_to_json(worksheet);

          if (rows.length === 0) {
            showError("Excel file is empty");
            return;
          }

          // Create the market intelligence data structure
          const priceData = {};

          // Use the sheet name or a default name for the market intelligence
          const name = `Market Intelligence - ${new Date().toLocaleDateString()}`;

          let importedCount = 0;
          let skippedCount = 0;
          let invalidCount = 0;

          rows.forEach((row) => {
            // Support multiple possible column header formats
            const origin = row.Origin || row.origin || row.ORIGIN;
            const destination = row.Destination || row.destination || row.DESTINATION;
            const type = row.Type || row.type || row.TYPE;
            const price = row.Price || row.price || row.PRICE || row.value || row.VALUE;

            if (!origin || !destination || !type || price === undefined) {
              skippedCount++;
              return;
            }

            // Validate port codes
            const validPorts = ["SBY", "MDN", "MKS", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"];
            if (!validPorts.includes(origin.toUpperCase()) || !validPorts.includes(destination.toUpperCase())) {
              invalidCount++;
              return;
            }

            // Normalize port codes to uppercase
            const normalizedOrigin = origin.toUpperCase();
            const normalizedDestination = destination.toUpperCase();

            // Skip if origin and destination are the same
            if (normalizedOrigin === normalizedDestination) {
              skippedCount++;
              return;
            }

            // Normalize the container type to ensure either "Dry" or "Reefer"
            let normalizedType;
            if (typeof type === "string") {
              normalizedType = type.toLowerCase().includes("reefer") ? "Reefer" : type.toLowerCase().includes("dry") ? "Dry" : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            } else {
              normalizedType = "Dry"; // Default if type is not a string
            }

            if (normalizedType !== "Dry" && normalizedType !== "Reefer") {
              invalidCount++;
              return;
            }

            // Create the key in the format Origin-Destination-Type
            const key = `${normalizedOrigin}-${normalizedDestination}-${normalizedType}`;

            // Convert price to number if it's a string
            const numericPrice = typeof price === "string" ? Number(price.replace(/[^0-9.-]+/g, "")) : Number(price);

            if (!isNaN(numericPrice) && numericPrice > 0) {
              priceData[key] = numericPrice;
              importedCount++;
            } else {
              invalidCount++;
            }
          });

          // Check if we have valid price data
          if (Object.keys(priceData).length === 0) {
            showError("Could not find valid price data in the Excel file. Please check the column headers.");
            return;
          }

          const marketIntelligenceData = {
            name,
            price_data: priceData,
          };

          showInfo(`Imported ${importedCount} price entries${skippedCount > 0 ? `, skipped ${skippedCount} rows` : ""}${invalidCount > 0 ? `, ${invalidCount} invalid entries` : ""}`);

          // Pass the data to parent component
          onUpload(marketIntelligenceData);
        } catch (error) {
          console.error("Excel processing error:", error);
          showError("Error processing Excel file");
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File processing error:", error);
      showError("Error processing file");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Upload Excel File</h2>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"} ${isProcessing ? "opacity-60" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" id="market-intelligence-upload" className="hidden" accept=".xlsx,.xls" onChange={handleChange} disabled={isProcessing} />
        <label htmlFor="market-intelligence-upload" className="cursor-pointer text-sm text-gray-600">
          <div className="flex flex-col items-center space-y-2">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            <span className="font-medium">
              {isProcessing ? (
                "Processing file..."
              ) : (
                <>
                  Drop your Excel file here or <span className="text-blue-500">browse</span>
                </>
              )}
            </span>
            <span className="text-gray-500 text-xs">Supports .xlsx and .xls files</span>
          </div>
        </label>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>For best results, use the template provided above. Make sure your Excel has the following columns:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Origin (port code)</li>
          <li>Destination (port code)</li>
          <li>Type (Dry or Reefer)</li>
          <li>Price (numeric value)</li>
        </ul>
      </div>
    </div>
  );
};

export default MarketIntelligenceUpload;
