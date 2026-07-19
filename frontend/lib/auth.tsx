"use client";

import type { ReactNode } from "react";
import { AuthProvider as OidcAuthProvider, useAuth as useOidcAuth } from "react-oidc-context";

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string;
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

const oidcConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${USER_POOL_ID}`,
  client_id: CLIENT_ID,
  // Computed per-origin rather than hardcoded, so this works on both
  // localhost and the deployed site - each origin must also be listed in
  // StudyBuddyUserPoolClient's CallbackURLs (infrastructure/template.yaml).
  redirect_uri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
  response_type: "code",

  scope: "openid email",
  onSigninCallback: () => {
    window.location.replace("/chat");
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  return <OidcAuthProvider {...oidcConfig}>{children}</OidcAuthProvider>;
}

export function useAuth() {
  const auth = useOidcAuth();

  return {
    user: auth.user
      ? { sub: auth.user.profile.sub, email: auth.user.profile.email ?? "" }
      : null,
    isSignedIn: auth.isAuthenticated,
    idToken: auth.user?.id_token ?? null,
    loading: auth.isLoading,
    error: auth.error?.message ?? null,
    signIn: () => auth.signinRedirect(),
    signOut: () => {
      auth.removeUser();
      const logoutUri = `${window.location.origin}/`;
      window.location.href = `https://${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(logoutUri)}`;
    },
  };
}
