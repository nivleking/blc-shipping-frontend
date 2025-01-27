import { PiXCircleDuotone } from "react-icons/pi";
import InformationCard from "../cards/InformationCard";

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-end mb-4">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <PiXCircleDuotone className="w-6 h-6" />
            </button>
          </div>
          <InformationCard />
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
