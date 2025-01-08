import { useState } from "react";
import UserSidebar from "./../components/UserSidebar";
import UserNavbar from "./../components/UserNavbar";

const UserLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      {isSidebarOpen && <UserSidebar />}
      <div className="flex-1">
        <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="p-6 bg-gray-100 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default UserLayout;
