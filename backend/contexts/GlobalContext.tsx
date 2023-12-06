"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

const GlobalContext = createContext({
  userPermissions: [] as string[],
  finishedFetchingPermissions: false,
  theme: "light",
  toggleTheme: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

interface UserPermissionsResponse {
  roles: string[];
}

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [finishedFetchingPermissions, setFinishedFetchingPermissions] = useState(false);
  const [theme, setTheme] = useState("light");
  const currentPath = usePathname();

  useEffect(() => {
    const url = window.location.pathname;
    if (url === "/login") { return; }
    const fetchUserPermissions = async () => {
      const response = await axios.get<UserPermissionsResponse>(
        "/api/user-permissions"
      );
      setUserPermissions(response.data.roles ?? []);
      setFinishedFetchingPermissions(true);
    };
    fetchUserPermissions();
  }, [currentPath]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <GlobalContext.Provider value={{ userPermissions, finishedFetchingPermissions, theme, toggleTheme }}>
      {children}
    </GlobalContext.Provider>
  );
};
