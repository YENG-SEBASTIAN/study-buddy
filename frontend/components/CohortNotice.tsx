import { BookOpen } from "lucide-react";

export default function CohortNotice() {
  return (
    <section className="mx-auto max-w-2xl px-6 pb-20">
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400">
            Meet Akosua
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Akosua is an AI study assistant to Madam Akosua, built by one of
            her students for the{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">
              Cohort April-26-Ext-Akosua
            </span>{" "}
            AWS re/Start class. She only knows what&apos;s in the
            cohort&apos;s own study notes or slides, and says so honestly when a
            question falls outside them. Not an official AWS product -
            always verify against the AWS documentation before your exam.
          </p>
        </div>
      </div>
    </section>
  );
}
