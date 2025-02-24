import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

const DashboardLayout = ({ children, navbar: Navbar, sidebar: Sidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <main
        className={`
          transition-all duration-300 ease-in-out
          pt-16 min-h-screen
          ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}
        `}
      >
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
