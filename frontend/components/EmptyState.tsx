import { MessageCircle } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 pt-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <MessageCircle className="h-6 w-6" />
      </span>
      <p className="text-slate-400 dark:text-slate-500">
        Try asking Akosua something like &quot;What&apos;s the difference
        between IAM roles and IAM users?&quot;
      </p>
    </div>
  );
}
