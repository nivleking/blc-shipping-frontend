import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import UserLogin from "./pages/UserLogin";
import "./App.css";
import AdminLogin from "./pages/AdminLogin";
import { AppContext } from "./context/AppContext";
import { useContext } from "react";
import Room from "./pages/Room";

const App = () => {
  const { user } = useContext(AppContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/user-home" element={user ? <UserHome /> : <UserLogin />} />
        <Route path="/room/:roomId" element={<Room />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-home" element={user ? <AdminHome /> : <AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
