import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import UserLogin from "./pages/UserLogin";
import "./App.css";
import AdminLogin from "./pages/AdminLogin";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import Room from "./pages/Room";
import AdminCreateAdmin from "./pages/AdminCreateAdmin";
import AdminCreateUser from "./pages/AdminCreateUser";
import AdminLayout from "./pages/AdminLayout";
import UserLayout from "./pages/UserLayout";
import Simulation from "./pages/Simulation";
import AdminCreateSalesCallCards from "./pages/AdminCreateSalesCallCards";
import Simulation2 from "./pages/Simulation2";

const App = () => {
  const { user } = useContext(AppContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Other Routes */}
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/simulation2/:roomId" element={<Simulation2 />} />

        {/* User Routes */}
        <Route path="/" element={<UserLogin />} />
        <Route
          path="/user-home"
          element={
            user ? (
              <UserLayout>
                <UserHome />
              </UserLayout>
            ) : (
              <UserLogin />
            )
          }
        />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-home"
          element={
            <AdminLayout>
              <AdminHome />
            </AdminLayout>
          }
        />
        <Route
          path="/admin-create-admin"
          element={
            <AdminLayout>
              <AdminCreateAdmin />
            </AdminLayout>
          }
        />
        <Route
          path="/admin-create-user"
          element={
            <AdminLayout>
              <AdminCreateUser />
            </AdminLayout>
          }
        />
        <Route
          path="/admin-create-sales-call-cards"
          element={
            <AdminLayout>
              <AdminCreateSalesCallCards />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
