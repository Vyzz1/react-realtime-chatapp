import { User } from "firebase/auth";
import { createContext, useState } from "react";

type AuthContextType = {
  auth: User | null;
  handleSetAuth: (auth: User | null) => void;
  handleDeleteAuth: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<User | null>(
    JSON.parse(localStorage.getItem("auth") || null)
  );

  const handleSetAuth = (auth: User | null) => {
    localStorage.setItem("auth", JSON.stringify(auth));
    setAuth(auth);
  };

  const handleDeleteAuth = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, handleSetAuth, handleDeleteAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
