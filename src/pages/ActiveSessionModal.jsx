// Active Session Warning Modal component
const ActiveSessionModal = ({ isOpen, onClose, onForceLogout, sessionInfo }) => {
  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Account Already Active</h3>
          <p className="mb-4">You are already logged in on another device:</p>
          <div className="bg-gray-50 p-3 mb-4 rounded">
            <p>
              <strong>IP Address:</strong> {sessionInfo?.ip}
            </p>
            <p>
              <strong>Device:</strong> {sessionInfo?.user_agent}
            </p>
            <p>
              <strong>Last Active:</strong> {sessionInfo?.last_active}
            </p>
          </div>
          <p className="mb-4">Logging in here will terminate your session on the other device.</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button onClick={onForceLogout} className="px-4 py-2 bg-red-600 text-white rounded">
              Continue & Log Out Other Device
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ActiveSessionModal;
