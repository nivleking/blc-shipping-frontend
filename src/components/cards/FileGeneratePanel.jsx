import { useState } from "react";
import { BsCloudUpload, BsDownload } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { api } from "../../axios/axios";

const FileGeneratePanel = ({ onImport, deckId, refreshCards, refreshContainers }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState([]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setErrors([]);

    // Create form data to send the file
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send file to backend for processing
      const response = await api.post(`/decks/${deckId}/import-cards`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`${response.data.message}`);

      // Refresh data
      await refreshCards();
      await refreshContainers();

      // Reset file input
      event.target.value = null;
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to upload file");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
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
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={isUploading} />
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
    </div>
  );
};

export default FileGeneratePanel;
