import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white px-6 pb-16 pt-20 text-center dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          AWS Cloud Practitioner Study Aid
        </span>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          Ask questions.{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Get answers
          </span>{" "}
          from your own study notes.
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-slate-600 dark:text-slate-400">
          Meet Akosua, your study assistant: a retrieval-augmented chatbot
          whose every answer comes from a knowledge base of real study
          material, not the model&apos;s general training data.
        </p>

        <Link
          href="/chat"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/40"
        >
          Start Studying →
        </Link>
      </div>
    </section>
  );
}
