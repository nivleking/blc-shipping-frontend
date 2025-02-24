import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      <AdminSidebar isSidebarOpen={isSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="mb-12">
          <AdminNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>
        <div className="p-6 bg-gray-100 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
