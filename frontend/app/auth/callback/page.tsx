"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

// AuthProvider (mounted in app/layout.tsx, so it's present on this route
// too) detects the ?code= Cognito redirected back with and exchanges it for
// tokens automatically, then calls onSigninCallback (see lib/auth.tsx),
// which navigates away from here. This page just covers that brief gap -
// or, if the exchange fails, gives the user a way out instead of being
// stuck on a blank "Redirecting..." screen forever.
export default function AuthCallbackPage() {
  const { loading, error } = useAuth();

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      {error ? (
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            Sign-in failed: {error}
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm text-amber-600 hover:underline dark:text-amber-400"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? "Signing you in..." : "Redirecting..."}
        </p>
      )}
    </main>
  );
}
