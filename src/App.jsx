import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminHome from "./pages/Admin/AdminHome";
import UserHome from "./pages/User/UserHome";
import "./App.css";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import Room from "./pages/Room";
import AdminCreateAdmin from "./pages/Admin/AdminCreateAdmin";
import AdminCreateUser from "./pages/Admin/AdminCreateUser";
import AdminLayout from "./pages/Admin/AdminLayout";
import UserLayout from "./pages/User/UserLayout";
import Simulation from "./pages/Simulation";
import AdminCreateCards from "./pages/Admin/AdminCreateCards";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDecks from "./pages/Admin/AdminDecks";
import RoomDetail from "./components/simulations/simulation_details/RoomDetail";
import AdminCreateLayouts from "./pages/Admin/AdminCreateLayouts";
import NotFound from "./pages/NotFound";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import PreviousSimulations from "./components/users/PreviousSimulations";
import PreviousSimulationDetail from "./components/users/PreviousSimulationDetail";
import InteractiveTutorial from "./pages/InteractiveTutorial";

const App = () => {
  const { user } = useContext(AppContext);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        limit={2}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{
          backgroundColor: "#ffffff",
          color: "#1f2937",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          fontSize: "0.875rem",
          padding: "1rem",
        }}
      />

      <BrowserRouter basename="/blc-shipping">
        <Routes>
          {/* Other Routes */}
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<InteractiveTutorial />} />
          <Route path="/rooms/:roomId" element={<Room />} />
          <Route path="/simulation/:roomId" element={<Simulation />} />

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

          <Route
            path="/previous-simulations"
            element={
              user ? (
                <UserLayout>
                  <PreviousSimulations />
                </UserLayout>
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/previous-simulations/:roomId/detail"
            element={
              user ? (
                <UserLayout>
                  <PreviousSimulationDetail />
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
              user ? (
                <AdminLayout>
                  <AdminHome />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/admin-create-admin"
            element={
              user ? (
                <AdminLayout>
                  <AdminCreateAdmin />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/admin-create-user"
            element={
              user ? (
                <AdminLayout>
                  <AdminCreateUser />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/admin-create-sales-call-cards/:deckId"
            element={
              user ? (
                <AdminLayout>
                  <AdminCreateCards />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/admin-decks"
            element={
              user ? (
                <AdminLayout>
                  <AdminDecks />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/rooms/:roomId/detail"
            element={
              user ? (
                <AdminLayout>
                  <RoomDetail />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/bay-layouts"
            element={
              user ? (
                <AdminLayout>
                  <AdminCreateLayouts />
                </AdminLayout>
              ) : (
                <Login />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
