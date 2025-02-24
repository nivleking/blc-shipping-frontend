import { Link, useLocation } from "react-router-dom";
import { FaCcMastercard, FaHome, FaShip, FaUserShield, FaUsers, FaAnchor } from "react-icons/fa";

const AdminSidebar = ({ isSidebarOpen }) => {
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      section: "",
      items: [{ path: "/admin-home", icon: FaHome, label: "Home" }],
    },
    {
      section: "Account Management",
      items: [
        { path: "/admin-create-admin", icon: FaUserShield, label: "Admin Accounts" },
        { path: "/admin-create-user", icon: FaUsers, label: "User Accounts" },
      ],
    },
    {
      section: "Shipping Simulation",
      items: [
        { path: "/admin-decks", icon: FaCcMastercard, label: "Cards & Decks" },
        { path: "/bay-layouts", icon: FaShip, label: "Ship Layouts" },
      ],
    },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full
        bg-gray-900 text-white border-r border-gray-800/50
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64" : "w-20"}
        z-40 print:hidden
      `}
    >
      {/* Logo section */}
      <div className="relative p-6 border-b border-gray-800/50">
        <div className={`flex items-center space-x-3 ${!isSidebarOpen && "justify-center"}`}>
          <div className="relative">
            <FaAnchor
              className={`
                text-blue-400 
                ${isSidebarOpen ? "text-3xl" : "text-2xl"} 
                transform rotate-12 transition-all duration-300 hover:scale-110
              `}
            />
            <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm animate-pulse" />
          </div>
          <div className={`${!isSidebarOpen && "hidden"} transition-all duration-300`}>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent tracking-tight">BLC Shipping</h2>
            <p className="text-xs font-medium text-gray-400 tracking-wider">ADMIN DASHBOARD</p>
          </div>
        </div>
        {isSidebarOpen && <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />}
      </div>

      {/* Navigation sections */}
      <nav className="p-4 space-y-6">
        {navigationItems.map((section, idx) => (
          <div key={idx} className="space-y-2">
            {isSidebarOpen && <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.section}</h2>}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center p-3 rounded-lg text-sm
                      transition-all duration-200 group relative
                      ${isActiveLink(item.path) ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-400" : "hover:bg-gray-800/80"}
                    `}
                  >
                    <item.icon
                      className={`
                        ${isSidebarOpen ? "text-sm" : "text-xs"}
                        ${isActiveLink(item.path) ? "text-blue-400" : "text-gray-400 group-hover:text-gray-300"}
                        transition-all duration-200
                      `}
                    />
                    <span
                      className={`
                        ml-3 font-medium tracking-wide
                        ${!isSidebarOpen && "hidden"}
                        ${isActiveLink(item.path) ? "text-blue-400" : "text-gray-300"}
                        group-hover:translate-x-1 transition-all duration-200
                      `}
                    >
                      {item.label}
                    </span>
                    {isActiveLink(item.path) && <div className="absolute inset-y-0 left-0 w-1 bg-blue-400 rounded-r-full" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
