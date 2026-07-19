"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import AkosuaAvatar from "@/components/AkosuaAvatar";

const DEMOS = [
  {
    question: "What's the difference between IAM roles and IAM users?",
    answer:
      "IAM users are long-term identities for a person or service. IAM roles are temporary identities that trusted entities assume - no long-term credentials involved.",
    source: "Week3/IAM-Fundamentals.pdf",
  },
  {
    question: "When would I use S3 over EBS?",
    answer:
      "S3 is object storage reachable over HTTP from anywhere - great for static assets and backups. EBS is block storage attached to a single EC2 instance.",
    source: "Week5/Storage-Services.pdf",
  },
  {
    question: "What is the AWS shared responsibility model?",
    answer:
      "AWS secures the cloud itself - hardware, infrastructure, facilities. You're responsible for what you put in it: data, IAM configuration, your applications.",
    source: "Week2/Security-Basics.pdf",
  },
];

type Phase = "typing" | "thinking" | "answering" | "holding" | "leaving";

// Same pacing as the real /chat reveal (see streamText in app/chat/page.tsx)
// so this preview matches what signed-in users actually see.
const ANSWER_CHARS_PER_TICK = 4;
const ANSWER_TICK_MS = 20;

export default function LiveDemo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");

  const demo = DEMOS[index];

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (phase === "typing") {
      if (reduceMotion) {
        setTypedQuestion(demo.question);
        const t = setTimeout(() => setPhase("thinking"), 200);
        return () => clearTimeout(t);
      }
      if (typedQuestion.length < demo.question.length) {
        const t = setTimeout(
          () => setTypedQuestion(demo.question.slice(0, typedQuestion.length + 1)),
          28,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("thinking"), 400);
      return () => clearTimeout(t);
    }

    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("answering"), reduceMotion ? 200 : 1000);
      return () => clearTimeout(t);
    }

    if (phase === "answering") {
      if (reduceMotion) {
        setTypedAnswer(demo.answer);
        const t = setTimeout(() => setPhase("holding"), 200);
        return () => clearTimeout(t);
      }
      if (typedAnswer.length < demo.answer.length) {
        const t = setTimeout(
          () =>
            setTypedAnswer(
              demo.answer.slice(0, typedAnswer.length + ANSWER_CHARS_PER_TICK),
            ),
          ANSWER_TICK_MS,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("holding"), 300);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("leaving"), 3200);
      return () => clearTimeout(t);
    }

    if (phase === "leaving") {
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % DEMOS.length);
        setPhase("typing");
        setTypedQuestion("");
        setTypedAnswer("");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [phase, typedQuestion, typedAnswer, demo.question, demo.answer]);

  const isAnsweringLive = phase === "answering" && typedAnswer.length < demo.answer.length;

  return (
    <div
      className="mx-auto flex max-w-md flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition-opacity duration-300 dark:border-slate-800 dark:bg-slate-900/60"
      style={{ opacity: phase === "leaving" ? 0 : 1 }}
    >
      <div className="flex items-start gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <MessageCircle className="h-3.5 w-3.5" />
        </span>
        <p className="min-h-5 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {typedQuestion}
          {phase === "typing" && (
            <span className="motion-reduce:hidden ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-slate-400 align-middle dark:bg-slate-500" />
          )}
        </p>
      </div>

      {(phase === "thinking" || phase === "answering" || phase === "holding") && (
        <div className="flex items-start gap-2">
          <AkosuaAvatar size="sm" />

          {phase === "thinking" ? (
            <div className="flex items-center gap-1 py-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400" />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {typedAnswer}
                {isAnsweringLive && (
                  <span className="motion-reduce:hidden ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-amber-500 align-middle dark:bg-amber-400" />
                )}
              </p>
              {phase === "holding" && (
                <span className="animate-fade-in-up mt-1.5 inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                  {demo.source}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
