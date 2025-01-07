import { createContext, useEffect, useState } from "react";
import api from "../axios/axios";

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  async function getUser() {
    try {
      const res = await api.get("user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("This user is:", res);

      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  useEffect(() => {
    console.log("User token:", token);
    if (token) {
      getUser();
    }
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
