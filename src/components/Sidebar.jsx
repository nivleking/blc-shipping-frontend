import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-gray-200 p-4 w-64 min-h-screen">
      <ul>
        <li className="mb-4">
          <Link to="/admin-home" className="block p-2 bg-blue-500 text-white rounded">
            Home
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin-configure-accounts" className="block p-2 bg-blue-500 text-white rounded">
            Configure Accounts
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/admin-reports" className="block p-2 bg-blue-500 text-white rounded">
            Reports
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
