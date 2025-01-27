import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsLightning, BsInfoCircle } from "react-icons/bs";
import "./GuideButton.css";

const GenerateCardsNavbar = ({ title, onBack, onGenerate, onInfoClick }) => (
  <nav className="bg-white shadow-md rounded-md">
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <AiOutlineArrowLeft size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onInfoClick} className="guide-button px-4 py-2 text-blue-600 rounded-lg flex items-center gap-2 relative overflow-hidden">
            <BsInfoCircle />
            Guide
            <span className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse"></span>
          </button>
          <button onClick={onGenerate} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <BsLightning />
            Generate Cards
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default GenerateCardsNavbar;
