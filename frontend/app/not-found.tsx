import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <span
        className="animate-fade-in-up flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
        style={{ animationDelay: "0ms" }}
      >
        <Compass className="h-8 w-8" />
      </span>

      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          Even Akosua can&apos;t find this page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">
          It&apos;s not in the study notes, and it&apos;s not on this site
          either. Let&apos;s get you back on track.
        </p>
      </div>

      <div
        className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: "120ms" }}
      >
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-400 hover:to-orange-400"
        >
          Back to Home
        </Link>
        <Link
          href="/chat"
          className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Ask Akosua Instead
        </Link>
      </div>
    </main>
  );
}
