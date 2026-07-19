"use client";

import Link from "next/link";
import AkosuaAvatar from "@/components/AkosuaAvatar";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { isSignedIn, user, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <Link
        href="/"
        className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50"
      >
        <AkosuaAvatar size="md" />
        Study Buddy
      </Link>

      <nav className="flex items-center gap-3">
        <Link
          href="/chat"
          className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          Chat
        </Link>

        <Link
          href="/architecture"
          className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          How It&apos;s Built
        </Link>

        {isSignedIn ? (
          <button
            type="button"
            onClick={signOut}
            title={user?.email}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={signIn}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-amber-400 hover:to-orange-400"
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
}
