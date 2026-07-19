"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Bot, User } from "lucide-react";
import type { ChatMessage, AskResponse } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BubbleMessage = ChatMessage | { role: "assistant"; pending: true };

export default function ChatPage() {
  const { isSignedIn, idToken, loading: authLoading, signIn } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Sign in to start interacting with Akosua.
        </p>
        <button
          type="button"
          onClick={signIn}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-400 hover:to-orange-400"
        >
          Sign In
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
        {messages.length === 0 && <EmptyState />}

        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}

          {loading && <ChatBubble message={{ role: "assistant", pending: true }} />}

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

function ChatBubble({ message }: { message: BubbleMessage }) {
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
              <p className="whitespace-pre-wrap">{message.content}</p>

              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.sources.map((uri) => (
                    <span
                      key={uri}
                      title={uri}
                      className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                    >
                      {uri.split("/").pop()}
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
