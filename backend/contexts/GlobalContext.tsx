"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const GlobalContext = createContext({
  userPermissions: [] as string[],
  theme: "light",
  toggleTheme: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

interface UserPermissionsResponse {
  roles: string[];
}

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [theme, setTheme] = useState("light");
  const router = useRouter();

  useEffect(() => {
    const url = window.location.pathname;
    if (url === "/login") { return; }
    const fetchUserPermissions = async () => {
      const response = await axios.get<UserPermissionsResponse>(
        "/api/user-permissions"
      );
      setUserPermissions(response.data.roles ?? []);
    };
    fetchUserPermissions();
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <GlobalContext.Provider value={{ userPermissions, theme, toggleTheme }}>
      {children}
    </GlobalContext.Provider>
  );
};
