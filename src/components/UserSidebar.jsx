import { Link, useLocation } from "react-router-dom";
import { FaHome, FaDoorOpen, FaShip } from "react-icons/fa";

const UserSidebar = ({ isSidebarOpen }) => {
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    { path: "/user-home", icon: FaHome, label: "Home" },
    { path: "/room", icon: FaDoorOpen, label: "Rooms" },
  ];

  return (
    <div className={`bg-gray-900 text-white ${isSidebarOpen ? "w-64" : "w-20"} flex flex-col fixed h-full transition-all duration-300`}>
      {/* Title section with enhanced styling */}
      <div className="relative p-6 border-b border-gray-800/50">
        <div className={`flex items-center space-x-3 ${!isSidebarOpen && "justify-center"}`}>
          <div className="relative">
            <FaShip className={`text-blue-400 ${isSidebarOpen ? "text-3xl" : "text-2xl"} transform -rotate-12 transition-all duration-300 hover:scale-110`} />
            <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm animate-pulse" />
          </div>
          <div className={`${!isSidebarOpen && "hidden"} transition-all duration-300`}>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent tracking-tight">BLC Shipping</h2>
            <p className="text-xs font-medium text-gray-400 tracking-wider">USER DASHBOARD</p>
          </div>
        </div>
        {isSidebarOpen && <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />}
      </div>

      {/* Enhanced navigation section */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2.5">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative
                  ${isActiveLink(item.path) ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-400" : "hover:bg-gray-800/80"}`}
              >
                <item.icon
                  className={`${isSidebarOpen ? "text-sm" : "text-xs"} 
                    ${isActiveLink(item.path) ? "text-blue-400" : "text-gray-400 group-hover:text-gray-300"}
                    transition-all duration-200`}
                />
                <span
                  className={`text-sm ml-3 font-medium tracking-wide
                    ${!isSidebarOpen && "hidden"}
                    ${isActiveLink(item.path) ? "text-blue-400" : "text-gray-300"}
                    group-hover:translate-x-1 transition-all duration-200`}
                >
                  {item.label}
                </span>
                {isActiveLink(item.path) && <div className="absolute inset-y-0 left-0 w-1 bg-blue-400 rounded-r-full" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default UserSidebar;
