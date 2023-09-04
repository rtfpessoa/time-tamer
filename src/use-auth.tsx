import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type Account = {
  id: number;
  email: string;
};

interface AuthContextType {
  account: Account | null;
  loading: boolean;
  isAuthenticated: boolean;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accountStr = localStorage.getItem("account");
    if (accountStr) {
      setAccount(JSON.parse(accountStr));
      setLoading(false);
      return;
    }

    const fetchAccount = async () => {
      const response = await fetch("/api/v1/me");
      if (!response.ok) {
        setAccount(null);
        setLoading(false);
        return;
      }

      const account = await response.json();
      setAccount(account);
      setLoading(false);
    };

    fetchAccount();
  }, []);

  let value = {
    loading,
    isAuthenticated: loading === false && account != null,
    account,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (auth.loading) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div>
        <span>
          This page requires authentication. Please{" "}
          <a href={`/login?from=${location.pathname}`}>Log in</a>
        </span>
      </div>
    );
  }

  return children;
}
