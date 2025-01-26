import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsLightning } from "react-icons/bs";

const GenerateCardsNavbar = ({ title, onBack, onGenerate }) => (
  <nav className="bg-white shadow-md rounded-md w-full z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <AiOutlineArrowLeft size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onGenerate} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg">
            <BsLightning />
            <span>Generate Cards</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default GenerateCardsNavbar;
