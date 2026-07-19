export default function CohortNotice() {
  return (
    <section className="mx-auto max-w-2xl px-6 pb-20">
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg dark:bg-amber-500/10">
          📚
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Where the knowledge comes from
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            This assistant only knows what&apos;s in its knowledge base: the
            study resources for{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">
              Cohort April-26-Ext-Akosua
            </span>
            , shared by Akosua with her AWS re/Start students. It&apos;s a
            study aid built by a student in that cohort, not an official AWS
            product - always verify against the AWS documentation before your
            exam.
          </p>
        </div>
      </div>
    </section>
  );
}
