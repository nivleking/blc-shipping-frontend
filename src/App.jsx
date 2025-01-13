import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import "./App.css";
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
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDecks from "./pages/AdminDecks";

const App = () => {
  const { user } = useContext(AppContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* Other Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/simulation2/:roomId" element={<Simulation2 />} />

        {/* User Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/user-home"
          element={
            user ? (
              <UserLayout>
                <UserHome />
              </UserLayout>
            ) : (
              <Login />
            )
          }
        />

        {/* Admin Routes */}
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
          path="/admin-create-sales-call-cards/:deckId"
          element={
            <AdminLayout>
              <AdminCreateSalesCallCards />
            </AdminLayout>
          }
        />

        <Route
          path="/admin-decks"
          element={
            <AdminLayout>
              <AdminDecks />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
