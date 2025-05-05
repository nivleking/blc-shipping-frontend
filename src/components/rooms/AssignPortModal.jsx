import { useState } from "react";
import useToast from "../../toast/useToast";

const AssignPortModal = ({ users, origins, ports, setPorts, onClose, onConfirm }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [assignmentMode, setAssignmentMode] = useState("manual");

  const handleRandomAssignment = () => {
    const availablePorts = [...Object.values(origins)];
    var newPorts = {};

    // Shuffle array of ports
    for (let i = availablePorts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePorts[i], availablePorts[j]] = [availablePorts[j], availablePorts[i]];
    }

    // Assign random ports to users
    users.forEach((user, index) => {
      if (index < availablePorts.length) {
        newPorts[user.id] = availablePorts[index];
      }
    });

    // THIS IS FOR LOCAL
    // newPorts = {
    //   // 1: "BPN",
    //   1: "SBY",
    //   2: "MDN",
    //   3: "MKS",
    //   4: "JYP",
    // };

    setPorts(newPorts);
    showSuccess("Ports assigned randomly!");
  };

  const handleManualPortChange = (userId, port) => {
    if (!port) {
      setPorts((prev) => {
        const newPorts = { ...prev };
        delete newPorts[userId];
        return newPorts;
      });
      return;
    }

    const isPortAssigned = Object.entries(ports).some(([key, value]) => value === port && key !== userId.toString());

    if (isPortAssigned) {
      showError("This port is already assigned to another user!");
      return;
    }

    setPorts((prev) => ({
      ...prev,
      [userId]: port,
    }));
  };

  const handleResetAll = () => {
    setPorts({});
    showSuccess("All port assignments cleared!");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="px-6 py-2 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Assign Ports to Users</h2>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setAssignmentMode("manual")} className={`px-2 py-1 text-sm rounded-md ${assignmentMode === "manual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                Manual Assignment
              </button>
              <button onClick={() => setAssignmentMode("random")} className={`px-2 py-1 text-sm rounded-md ${assignmentMode === "random" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                Random Assignment
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              {assignmentMode === "random" && (
                <button onClick={handleRandomAssignment} className="flex-1 py-1 px-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">
                  Randomly Assign Ports
                </button>
              )}

              {/* Add Reset All button */}
              <button onClick={handleResetAll} className="flex-1 py-1 px-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">
                Reset All Ports
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="space-y-2">
                <hr />
                <label className="block text-sm font-medium text-gray-700">{user.name}</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={ports[user.id] || ""}
                  onChange={(e) => handleManualPortChange(user.id, e.target.value)}
                  disabled={assignmentMode === "random"}
                >
                  <option value="">Select a port</option>
                  {Object.values(origins).map((origin) => (
                    <option key={origin} value={origin} disabled={Object.values(ports).includes(origin) && ports[user.id] !== origin}>
                      {origin} {Object.values(ports).includes(origin) && ports[user.id] !== origin ? "(Assigned)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Confirm Ports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPortModal;
