import { Box, Button, Stack, Title } from "@mantine/core";
import React, { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as api from "./api.gen";
import { handle } from "oazapfts";


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
      await handle(api.userInfo(), {
        200(user: api.User) {
          setAccount(user);
          setLoading(false);
        },
        default(status: number, data: Error) {
          setAccount(null);
          setLoading(false);
        },
      });
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

export function RequireAuth({ children }: { children: ReactNode }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.isAuthenticated) {
    return (
      <Box className="App">
        <header className="App-header">
          <img
            src="/static/images/logo-face.png"
            className="App-logo"
            alt="logo"
          />
          {auth.loading ? (
            <Box>
              <Title size="h2" c="#94bdb7">
                Loading...
              </Title>
            </Box>
          ) : (
            <Stack>
              <Title size="h2" c="#94bdb7">
                This page requires authentication
              </Title>
              <Box>
                <Button
                  variant="white"
                  onClick={() =>
                    (window.location.href = `/login?from=${location.pathname}`)
                  }
                >
                  Log in
                </Button>
              </Box>
            </Stack>
          )}
        </header>
      </Box>
    );
  }

  return children;
}
