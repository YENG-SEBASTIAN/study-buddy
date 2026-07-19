"use client";

import type { ReactNode } from "react";
import { AuthProvider as OidcAuthProvider, useAuth as useOidcAuth } from "react-oidc-context";

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string;
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

// "authority" is how oidc-client-ts (react-oidc-context's engine) finds
// Cognito's OIDC discovery document (its authorize/token/jwks endpoints) -
// it's built from the User Pool ID, not the Hosted UI domain used below for
// sign-out. redirect_uri must exactly match a CallbackURLs entry on
// StudyBuddyUserPoolClient in infrastructure/template.yaml.
const oidcConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${USER_POOL_ID}`,
  client_id: CLIENT_ID,
  redirect_uri: "http://localhost:3000/auth/callback",
  response_type: "code",
  // Only these two are actually used - openid is required to get an ID
  // token at all, and email is needed for the "email" claim useAuth() reads
  // below. Not requesting "profile" avoids depending on a scope that isn't
  // enabled on every app client (it wasn't on the console-created one).
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
