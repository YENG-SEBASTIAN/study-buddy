"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AkosuaAvatar from "@/components/AkosuaAvatar";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/architecture", label: "How It's Built" },
];

export default function Header() {
  const { isSignedIn, user, signIn, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50"
        >
          <AkosuaAvatar size="md" />
          Study Buddy
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}

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

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-200/80 bg-white/95 px-6 py-3 backdrop-blur md:hidden dark:border-slate-800/80 dark:bg-slate-950/95">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {isSignedIn ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              title={user?.email}
              className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                signIn();
              }}
              className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-left text-sm font-medium text-white shadow-sm transition hover:from-amber-400 hover:to-orange-400"
            >
              Sign In
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
