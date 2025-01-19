import { Link } from "react-router-dom";
import { FaCcMastercard, FaHome, FaUserShield, FaUsers } from "react-icons/fa";

const AdminSidebar = ({ isSidebarOpen }) => {
  return (
    <div className={`bg-gray-900 text-white ${isSidebarOpen ? "w-64" : "w-16"} flex flex-col fixed h-full transition-all duration-300`}>
      <div className="p-6">
        <h2 className={`text-2xl font-bold ${!isSidebarOpen && "hidden"}`}>BLC Shipping</h2>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-4">
          <li>
            <Link to="/admin-home" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaHome className="mr-3" />
              <span className={`${!isSidebarOpen && "hidden"}`}>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/admin-create-admin" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaUserShield className="mr-3" />
              <span className={`${!isSidebarOpen && "hidden"}`}>Admin Accounts</span>
            </Link>
          </li>
          <li>
            <Link to="/admin-create-user" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaUsers className="mr-3" />
              <span className={`${!isSidebarOpen && "hidden"}`}>User Accounts</span>
            </Link>
          </li>
          <li>
            <Link to="/admin-decks" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaCcMastercard className="mr-3" />
              <span className={`${!isSidebarOpen && "hidden"}`}>Cards & Decks</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
