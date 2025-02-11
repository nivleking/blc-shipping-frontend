const LoadingOverlay = ({ messages, currentMessageIndex, title }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 animate-pulse">{messages[currentMessageIndex]}</p>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingOverlay;
