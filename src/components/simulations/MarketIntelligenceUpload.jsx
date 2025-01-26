import { useState } from "react";

const MarketIntelligenceUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);

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
    await processFile(file);
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    await processFile(file);
  };

  const processFile = async (file) => {
    if (!file) return;

    try {
      if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            onUpload(json);
            // toast.success("Market intelligence data loaded successfully!");
          } catch (error) {
            // toast.error("Invalid JSON format");
          }
        };
        reader.readAsText(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel") {
        // You'll need to add Excel processing library like xlsx here
        // toast.error("Excel processing coming soon!");
      } else {
        // toast.error("Unsupported file format. Please upload JSON or Excel file.");
      }
    } catch (error) {
    //   toast.error("Error processing file");
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Market Intelligence Upload</h2>
        </div>
      </div>

      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        <input type="file" id="market-intelligence-upload" className="hidden" accept=".json,.xlsx,.xls" onChange={handleChange} />
        <label htmlFor="market-intelligence-upload" className="cursor-pointer text-sm text-gray-600">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="font-medium">
              Drop your market intelligence file here or <span className="text-blue-500">browse</span>
            </span>
            <span className="text-gray-500 text-xs">Supports JSON and Excel files</span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default MarketIntelligenceUpload;
