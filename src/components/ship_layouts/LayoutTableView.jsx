import React from "react";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";

const LayoutTableView = ({ layouts, currentPageData, setSelectedLayout, setShowPreviewModal, setFormData, setShowEditForm, confirmDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bays
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bay Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentPageData.map((layout, index) => {
            const baySize = typeof layout.bay_size === "string" ? JSON.parse(layout.bay_size) : layout.bay_size;

            const bayTypes = typeof layout.bay_types === "string" ? JSON.parse(layout.bay_types) : layout.bay_types;

            return (
              <tr key={layout.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{layout.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{layout.bay_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${baySize.rows} × ${baySize.columns}`}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {bayTypes.map((type, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${type === "dry" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {type === "dry" ? "Dry" : "Reefer"}
                      </span>
                    ))}
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{layout.description || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedLayout(layout);
                        setShowPreviewModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                      title="Preview layout"
                    >
                      <AiFillEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLayout(layout);
                        setFormData({
                          name: layout.name,
                          description: layout.description,
                          bay_size: {
                            rows: baySize.rows,
                            columns: baySize.columns,
                          },
                          bay_count: layout.bay_count,
                          bay_types: [...bayTypes],
                        });
                        setShowEditForm(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50"
                      title="Edit layout"
                    >
                      <AiFillEdit className="w-5 h-5" />
                    </button>
                    <button onClick={() => confirmDelete(layout)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Delete layout">
                      <AiFillDelete className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {currentPageData.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No layouts found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default LayoutTableView;
