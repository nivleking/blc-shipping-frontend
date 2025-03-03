import { useState } from "react";
import UserSidebar from "../../components/users/UserSidebar";
import UserNavbar from "../../components/users/UserNavbar";

const UserLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Changed to true by default

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      <UserSidebar isSidebarOpen={isSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="pt-16 p-6 bg-gray-100 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default UserLayout;
