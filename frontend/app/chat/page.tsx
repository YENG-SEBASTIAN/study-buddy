"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { ArrowRight, Bot, LogIn, MessageCircleQuestion, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage, AskResponse, HistoryItem } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import { useAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BubbleMessage = ChatMessage | { role: "assistant"; pending: true };

const SAMPLE_QUESTIONS = [
  "What's the difference between IAM roles and IAM users?",
  "Explain the AWS shared responsibility model.",
  "When would I use S3 over EBS?",
];

// The API returns the full answer in one response - this reveals it a few
// characters at a time so it reads like the model is streaming it live.
function streamText(fullText: string, onUpdate: (partial: string) => void) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    onUpdate(fullText);
    return Promise.resolve();
  }

  const CHARS_PER_TICK = 4;
  const TICK_MS = 20;

  return new Promise<void>((resolve) => {
    let shown = 0;
    const interval = setInterval(() => {
      shown = Math.min(shown + CHARS_PER_TICK, fullText.length);
      onUpdate(fullText.slice(0, shown));
      if (shown >= fullText.length) {
        clearInterval(interval);
        resolve();
      }
    }, TICK_MS);
  });
}

export default function ChatPage() {
  const { isSignedIn, idToken, loading: authLoading, signIn } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState(-1);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isSignedIn || !idToken) {
      setHistoryLoading(false);
      return;
    }

    fetch(`${API_URL}/history`, {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("history fetch failed"))))
      .then((data: { items: HistoryItem[] }) => {
        const restored = [...data.items].reverse().flatMap((item): ChatMessage[] => [
          { role: "user", content: item.question },
          { role: "assistant", content: item.answer, sources: item.sources },
        ]);
        setMessages(restored);
      })
      .catch(() => {
        // No history yet, or the fetch failed - start with an empty chat
        // either way rather than blocking the page.
      })
      .finally(() => setHistoryLoading(false));
  }, [isSignedIn, idToken]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ question }),
      });

      const data: AskResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      let assistantIndex = -1;
      setMessages((prev) => {
        assistantIndex = prev.length;
        return [...prev, { role: "assistant", content: "" }];
      });
      setStreamingIndex(assistantIndex);

      await streamText(data.answer, (partial) => {
        setMessages((prev) => {
          const next = [...prev];
          next[assistantIndex] = { ...next[assistantIndex], content: partial };
          return next;
        });
      });

      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndex] = { ...next[assistantIndex], sources: data.sources };
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message, isError: true },
      ]);
    } finally {
      setLoading(false);
      setStreamingIndex(-1);
    }
  }

  if (authLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-50/40 via-slate-50 to-slate-50 px-6 py-16 text-center dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div
          className="animate-fade-in-up relative flex h-20 w-20 items-center justify-center"
          style={{ animationDelay: "0ms" }}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30 dark:bg-amber-500/20" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <Bot className="h-8 w-8" />
          </span>
          <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-amber-500 dark:text-amber-400" />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            Curious what{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Akosua
            </span>{" "}
            knows?
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-slate-600 dark:text-slate-400">
            Sign in and ask anything from your cohort&apos;s study notes or slides -
            here&apos;s what other students have wondered about.
          </p>
        </div>

        <div
          className="animate-fade-in-up flex w-full max-w-md flex-col gap-2"
          style={{ animationDelay: "140ms" }}
        >
          {SAMPLE_QUESTIONS.map((question, index) => (
            <button
              key={question}
              type="button"
              onClick={signIn}
              className="animate-fade-in-up group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-left text-sm text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-amber-500/40"
              style={{ animationDelay: `${180 + index * 60}ms` }}
            >
              <MessageCircleQuestion className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
              <span className="flex-1">{question}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-500 dark:text-slate-600" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={signIn}
          className="animate-fade-in-up group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-105 hover:from-amber-400 hover:to-orange-400"
          style={{ animationDelay: "380ms" }}
        >
          <LogIn className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Sign In to Ask Akosua
        </button>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50/40 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      <div className="border-b border-slate-200/80 bg-white/60 px-6 py-3 text-center backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/60">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Chatting with Akosua, assistant to Madam Akosua - answers are
          grounded in your cohort&apos;s study notes.
        </p>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {historyLoading ? (
          <div className="flex flex-col items-center gap-3 pt-20">
            <Spinner />
            <p className="text-sm text-slate-400">
              Loading your past conversations...
            </p>
          </div>
        ) : (
          messages.length === 0 && <EmptyState />
        )}

        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              message={message}
              isStreaming={index === streamingIndex}
            />
          ))}

          {loading && streamingIndex === -1 && (
            <ChatBubble message={{ role: "assistant", pending: true }} />
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70"
      >
        <div className="mx-auto flex max-w-2xl gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-amber-500/20">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 rounded-full bg-transparent px-3 py-2 text-sm text-slate-900 outline-none disabled:opacity-50 dark:text-slate-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:hover:from-amber-500 disabled:hover:to-orange-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// S3 URIs come back with percent-encoded spaces (e.g. "LS18%20M12%20...pdf")
// and the full bucket path. Keep just the parent folder (e.g. "Week6") plus
// the filename, decoded, so students can tell which week to go reference.
function sourceLabel(uri: string) {
  let path = uri;
  try {
    path = new URL(uri).pathname;
  } catch {
    // Not a full URL (e.g. an s3:// URI) - use it as-is.
  }

  const relevant = path.split("/").filter(Boolean).slice(-2);
  try {
    return relevant.map(decodeURIComponent).join("/");
  } catch {
    return relevant.join("/");
  }
}

function ChatBubble({
  message,
  isStreaming = false,
}: {
  message: BubbleMessage;
  isStreaming?: boolean;
}) {
  const isUser = "role" in message && message.role === "user";
  const isError = "isError" in message && message.isError;

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm"
            : isError
              ? "rounded-bl-sm bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
              : "rounded-bl-sm border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
        }`}
      >
        {"pending" in message && message.pending ? (
          <div className="flex gap-1 py-1">
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
          "content" in message && (
            <>
              {isUser || isError ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 first:prose-headings:mt-0">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  {isStreaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-amber-500 align-middle dark:bg-amber-400" />
                  )}
                </div>
              )}

              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.sources.map((uri) => (
                    <span
                      key={uri}
                      title={uri}
                      className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                    >
                      {sourceLabel(uri)}
                    </span>
                  ))}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
