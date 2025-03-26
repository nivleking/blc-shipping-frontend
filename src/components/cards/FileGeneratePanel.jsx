import { useState } from "react";
import { BsCloudUpload, BsDownload } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { api } from "../../axios/axios";
import LoadingOverlay from "../LoadingOverlay";
import ExcelPreviewModal from "./ExcelPreviewModal";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const FileGeneratePanel = ({ onImport, deckId, refreshCards, refreshContainers }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  // const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = ["Processing your Excel file..."];
  const [parsedExcelData, setParsedExcelData] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  const templateData = [
    {
      id: "734",
      origin: "SBY",
      destination: "JYP",
      priority: "Non-Committed",
      container_type: "dry",
      quantity: 2,
      revenue_per_container: 21000000,
      total_revenue: "=F12*G12",
    },
  ];

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Call Cards");

    // Add column headers and instructions
    const headers = [
      ["Sales Call Cards Template"],
      ["Instructions:"],
      ["1. Valid Ports: SBY, MKS, MDN, JYP, BPN, BKS, BGR, BTH"],
      ["2. Priority Options: Committed, Non-Committed"],
      ["3. Container Types: Dry, Reefer"],
      ["4. Quantity must be greater than 0"],
      ["5. Revenue/Container must be in IDR (numbers only)"],
      ["6. Total Revenue will be calculated automatically"],
      [],
      ["ID", "Origin", "Destination", "Priority", "Container Type", "Quantity", "Revenue/Container", "Total Revenue"],
      ["(Required)", "(Required)", "(Required)", "(Required)", "(Required)", "(Required)", "(Required)", "(Formula)"],
    ];

    XLSX.utils.sheet_add_aoa(ws, headers);

    // Add example data with formulas
    templateData.forEach((row, index) => {
      const rowNum = index + 12; // Start after headers
      const cellRef = `H${rowNum}`; // Reference untuk total revenue cell

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            row.id,
            row.origin,
            row.destination,
            row.priority,
            row.container_type,
            row.quantity,
            row.revenue_per_container,
            { f: `F${rowNum}*G${rowNum}`, t: "n" }, // Set formula dengan tipe numeric
          ],
        ],
        { origin: `A${rowNum}` }
      );

      // Format cell untuk menampilkan hasil kalkulasi
      if (!ws["!rows"]) ws["!rows"] = [];
      ws["!rows"][rowNum] = { hidden: false };

      // Set format numerik untuk total revenue
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].z = "#,##0";
    });

    // Set column widths
    ws["!cols"] = [
      { wch: 10 }, // ID
      { wch: 12 }, // Origin
      { wch: 12 }, // Destination
      { wch: 15 }, // Priority
      { wch: 15 }, // Container Type
      { wch: 10 }, // Quantity
      { wch: 18 }, // Revenue/Container
      { wch: 15 }, // Total Revenue
    ];

    // Add styling
    const headerStyle = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "CCE5FF" } },
      alignment: { horizontal: "center" },
    };

    // Apply styles to headers
    ["A10:G10"].forEach((range) => {
      const [start, end] = range.split(":");
      for (let col = start[0]; col <= end[0]; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
        ws[`${col}10`].s = headerStyle;
      }
    });

    // Add data validation
    ws["!dataValidation"] = {
      C12: {
        // Priority column
        type: "list",
        formula1: '"Committed,Non-Committed"',
        showErrorMessage: true,
        errorTitle: "Invalid Priority",
        error: "Please select either Committed or Non-Committed",
      },
      D12: {
        // Container Type column
        type: "list",
        formula1: '"dry,reefer,Dry,Reefer,DRY,REEFER"',
        showErrorMessage: true,
        errorTitle: "Invalid Container Type",
        error: "Please select either Dry or Reefer",
      },
    };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "sales_call_cards_template.xlsx");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Skip directly to data rows (row 12 and later in the spreadsheet)
        const formattedData = [];

        // Get the range of the worksheet
        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        // Loop through each row starting from row 12 (index 11)
        for (let rowNum = 11; rowNum <= range.e.r; rowNum++) {
          // Check if this is a valid row with actual data
          const idCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 0 })];
          const originCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];

          // Skip if no ID or if it's an instruction row
          if (!idCell || !idCell.v || (typeof idCell.v === "string" && (idCell.v.includes("Instructions") || idCell.v.includes("Required") || idCell.v === "ID"))) {
            continue;
          }

          // Extract cells for this row
          const card = {
            id: String(idCell.v),
            origin: originCell?.v ? String(originCell.v) : "",
            destination: worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 2 })]?.v || "",
            priority: worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 3 })]?.v || "",
            container_type: String(worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 4 })]?.v || "").toLowerCase(),
            quantity: parseInt(worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 5 })]?.v) || 0,
            revenue_per_container: parseInt(worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 6 })]?.v) || 0,
          };

          // Only add rows with actual data
          if (card.id && card.origin && card.destination) {
            formattedData.push(card);
          }
        }

        console.log("Formatted Excel data:", formattedData);

        if (formattedData.length > 0) {
          setParsedExcelData(formattedData);
          setShowExcelPreview(true);
        } else {
          toast.error("No valid data found in Excel file. Please check the template format.");
          setSelectedFile(null);
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Failed to parse Excel file");
        setSelectedFile(null);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setErrors([]);
    setIsLoading(true); // Use isLoading for API operations

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post(`/decks/${deckId}/import-cards`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`${response.data.message}`);

      // Refresh data
      await refreshCards();
      await refreshContainers();

      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload-input");
      if (fileInput) fileInput.value = null;

      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to upload file");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    setShowExcelPreview(false);
    setIsLoading(true);

    setTimeout(async () => {
      try {
        await handleFileUpload();
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const cancelFileUpload = () => {
    setShowExcelPreview(false);
    setSelectedFile(null);
    const fileInput = document.getElementById("file-upload-input");
    if (fileInput) fileInput.value = null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={loadingMessageIndex} title="Importing Cards" />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">File Generate</h3>
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
            <BsDownload /> Download Template
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <BsCloudUpload className="text-4xl text-gray-400" />
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{isUploading ? "Uploading..." : "Upload Excel File"}</span>
              <input id="file-upload-input" type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileSelect} disabled={isUploading} />
            </label>
            <p className="text-sm text-gray-500">Upload your Excel file with sales call cards data</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-medium mb-2">Validation Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Excel Preview Modal */}
      <ExcelPreviewModal isOpen={showExcelPreview} onClose={cancelFileUpload} onConfirm={handleConfirmImport} data={parsedExcelData} formatIDR={formatIDR} />
    </div>
  );
};

export default FileGeneratePanel;
