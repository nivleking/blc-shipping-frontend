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
      origin: "SBY",
      destination: "MDN",
      priority: "Committed",
      container_type: "Dry",
      quantity: 5,
      revenue_per_container: 15000000,
      total_revenue: "=E2*F2",
    },
    {
      origin: "MDN",
      destination: "JYP",
      priority: "Non-Committed",
      container_type: "Reefer",
      quantity: 3,
      revenue_per_container: 20000000,
      total_revenue: "=E3*F3",
    },
    {
      origin: "MKS",
      destination: "SBY",
      priority: "Committed",
      container_type: "Dry",
      quantity: 4,
      revenue_per_container: 12000000,
      total_revenue: "=E4*F4",
    },
    {
      origin: "JYP",
      destination: "MKS",
      priority: "Non-Committed",
      container_type: "Dry",
      quantity: 6,
      revenue_per_container: 13000000,
      total_revenue: "=E5*F5",
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
      ["Origin", "Destination", "Priority", "Container Type", "Quantity", "Revenue/Container", "Total Revenue"],
      ["(Required)", "(Required)", "(Required)", "(Required)", "(Required)", "(Required)", "(Formula)"],
    ];

    XLSX.utils.sheet_add_aoa(ws, headers);

    // Add example data with formulas
    templateData.forEach((row, index) => {
      const rowNum = index + 12; // Start after headers
      const cellRef = `G${rowNum}`; // Reference untuk total revenue cell

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            row.origin,
            row.destination,
            row.priority,
            row.container_type,
            row.quantity,
            row.revenue_per_container,
            { f: `E${rowNum}*F${rowNum}`, t: "n" }, // Set formula dengan tipe numeric
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
        formula1: '"Dry,Reefer"',
        showErrorMessage: true,
        errorTitle: "Invalid Container Type",
        error: "Please select either Dry or Reefer",
      },
    };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "sales_call_cards_template.xlsx");
  };

  // Update handleFileUpload untuk memperbaiki pembacaan data Excel
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setIsUploading(true);
    setErrors([]);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 11,
          header: ["origin", "destination", "priority", "container_type", "quantity", "revenue_per_container", "total_revenue"],
        });

        const validationErrors = [];
        const cards = [];

        const validPorts = ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row.origin) continue; // Skip empty rows

          // Clean and validate data
          const card = {
            origin: String(row.origin).trim().toUpperCase(),
            destination: String(row.destination).trim().toUpperCase(),
            priority: String(row.priority).trim(),
            type: String(row.container_type).trim(),
            quantity: parseInt(row.quantity),
            revenue_per_container: parseInt(row.revenue_per_container),
            // Kalkulasi revenue dari quantity dan revenue_per_container
            revenue: parseInt(row.quantity) * parseInt(row.revenue_per_container),
          };

          // Validation checks
          if (!validPorts.includes(card.origin)) {
            validationErrors.push(`Row ${i + 12}: Invalid origin port "${card.origin}"`);
            continue;
          }

          if (!validPorts.includes(card.destination)) {
            validationErrors.push(`Row ${i + 12}: Invalid destination port "${card.destination}"`);
            continue;
          }

          // ... validasi lainnya dengan row number yang diupdate
          if (card.origin === card.destination) {
            validationErrors.push(`Row ${i + 12}: Origin and destination cannot be the same`);
            continue;
          }

          if (!["Committed", "Non-Committed"].includes(card.priority)) {
            validationErrors.push(`Row ${i + 12}: Invalid priority "${card.priority}"`);
            continue;
          }

          if (!["Dry", "Reefer"].includes(card.type)) {
            validationErrors.push(`Row ${i + 12}: Invalid container type "${card.type}"`);
            continue;
          }

          if (isNaN(card.quantity) || card.quantity <= 0) {
            validationErrors.push(`Row ${i + 12}: Invalid quantity`);
            continue;
          }

          if (isNaN(card.revenue_per_container) || card.revenue_per_container <= 0) {
            validationErrors.push(`Row ${i + 12}: Invalid revenue per container`);
            continue;
          }

          cards.push(card);
        }

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          toast.error("Please fix the validation errors");
          return;
        }

        // Create cards and attach to deck
        try {
          const createdCards = await Promise.all(cards.map((card) => api.post("/cards", card)));

          await Promise.all(
            createdCards.map((response) =>
              api.post(`/decks/${deckId}/add-card`, {
                card_id: response.data.id,
              })
            )
          );

          await refreshCards();
          await refreshContainers();

          toast.success(`Successfully imported ${cards.length} cards to deck!`);
          event.target.value = null; // Reset file input
        } catch (error) {
          console.error("Error creating cards:", error);
          toast.error("Failed to create cards");
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read Excel file");
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
