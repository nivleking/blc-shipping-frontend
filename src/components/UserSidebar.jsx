import { Link } from "react-router-dom";
import { FaHome, FaDoorOpen } from "react-icons/fa";

const UserSidebar = () => {
  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">BLC Shipping</h2>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-4">
          <li>
            <Link to="/user-home" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaHome className="mr-3" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/room" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaDoorOpen className="mr-3" />
              Rooms
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default UserSidebar;
