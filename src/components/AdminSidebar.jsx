import { Link } from "react-router-dom";
import { FaHome, FaUserShield, FaUsers } from "react-icons/fa";
import { FaClapperboard } from "react-icons/fa6";

const AdminSidebar = () => {
  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">BLC Shipping</h2>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-4">
          <li>
            <Link to="/admin-home" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaHome className="mr-3" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/admin-create-admin" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaUserShield className="mr-3" />
              Admin Accounts
            </Link>
          </li>
          <li>
            <Link to="/admin-create-user" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaUsers className="mr-3" />
              User Accounts
            </Link>
          </li>

          <li>
            <Link to="/admin-create-cards" className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <FaClapperboard className="mr-3" />
              Sales Calls
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
