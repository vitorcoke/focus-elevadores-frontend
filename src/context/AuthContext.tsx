import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../service";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { User } from "../types/users.type";
import Router from "next/router";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthContextData = {
  isAuthenticated: boolean;
  singIn: ({ username, password }: SingInData) => Promise<void>;
  singOut: () => void;
  user: User | null;
};

type SingInData = {
  username: string;
  password: string;
};

const AuthContext = createContext({} as AuthContextData);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "focus-elevador-token": token } = parseCookies();

    const fetchUserToken = async () => {
      try {
        const { data } = await api.get("/users/bytoken");
        setUser(data);
      } catch {
        destroyCookie(undefined, "focus-elevador-token");
        Router.push("/");
      }
    };

    if (token) fetchUserToken();
  }, []);

  const singIn = async ({ username, password }: SingInData) => {
    const { data } = await api.post("/auth/login", {
      username,
      password,
    });

    setCookie(undefined, "focus-elevador-token", data.token, {
      maxAge: 60 * 60 * 1, // 1 hour
    });

    setCookie(
      undefined,
      "focus-elevador-refreshToken",
      data.refresh_token._id,
      {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );

    setUser(data.user);

    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    Router.push("/dashboard");
  };

  const singOut = () => {
    destroyCookie(undefined, "focus-elevador-token");
    destroyCookie(undefined, "focus-elevador-refreshToken");
    Router.replace("/", {}, { shallow: true });
  };

  return (
    <AuthContext.Provider value={{ singIn, singOut, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
