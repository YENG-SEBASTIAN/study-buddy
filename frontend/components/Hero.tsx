import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import LiveDemo from "@/components/LiveDemo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white px-6 pb-20 pt-20 text-center dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      <div
        aria-hidden
        className="motion-reduce:hidden animate-float pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10"
      />
      <div
        aria-hidden
        className="motion-reduce:hidden animate-float pointer-events-none absolute top-24 -right-24 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl dark:bg-orange-500/10"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative mx-auto max-w-2xl">
        <span
          className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          style={{ animationDelay: "0ms" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AWS Cloud Practitioner Study Aid
        </span>

        <h1
          className="animate-fade-in-up mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50"
          style={{ animationDelay: "60ms" }}
        >
          Ask questions.{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Get answers
          </span>{" "}
          from your own study notes.
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-4 max-w-lg text-slate-600 dark:text-slate-400"
          style={{ animationDelay: "120ms" }}
        >
          Meet Akosua, your study assistant: a retrieval-augmented chatbot
          whose every answer comes from a knowledge base of real study
          material, not the model&apos;s general training data.
        </p>

        <div
          className="animate-fade-in-up mt-8"
          style={{ animationDelay: "180ms" }}
        >
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:scale-105 hover:shadow-amber-500/40"
          >
            Start Studying
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          className="animate-fade-in-up mt-14"
          style={{ animationDelay: "260ms" }}
        >
          <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-600">
            See Akosua in action
          </p>
          <LiveDemo />
        </div>
      </div>
    </section>
  );
}
