import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsInfoCircle, BsTrash } from "react-icons/bs";
import "./GuideButton.css";

const GenerateCardsNavbar = ({ title, onBack, onInfoClick, onDeleteAllCards }) => (
  <nav className="bg-white shadow-md rounded-md">
    <div className="mx-auto px-2 sm:px-4 lg:px-6">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <AiOutlineArrowLeft size={18} />
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onInfoClick} className="guide-button px-4 py-2 text-sm text-blue-600 rounded-lg flex items-center gap-2 relative overflow-hidden">
            <BsInfoCircle />
            Guide
            <span className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse"></span>
          </button>
          <button onClick={onDeleteAllCards} className="px-4 py-2 bg-red-500 text-sm text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors">
            <BsTrash />
            Delete Cards
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default GenerateCardsNavbar;
