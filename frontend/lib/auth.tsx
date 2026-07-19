"use client";

// Placeholder until a Cognito User Pool exists. signIn()/user stay stubbed
// so the rest of the app can already call useAuth() everywhere it'll be
// needed once real sign-in is wired up.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type User = {
  sub: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSignedIn: user !== null,
      signIn() {
        console.info("Sign-in isn't wired up yet - Cognito is coming soon.");
      },
      signOut() {
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be called within an <AuthProvider>.");
  }
  return ctx;
}
