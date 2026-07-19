import Image from "next/image";
import {
  Server,
  ShieldCheck,
  Users,
  Network,
  Database,
  HardDrive,
  KeyRound,
  Brain,
  Sparkles,
  FileCode2,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

type Resource = {
  name: string;
  icon: LucideIcon;
  description: string;
  badge: "AWS" | "Anthropic";
};

type Category = {
  title: string;
  resources: Resource[];
};

const categories: Category[] = [
  {
    title: "Compute",
    resources: [
      {
        name: "AWS Lambda",
        icon: Server,
        description:
          "Runs the entire Python backend - answering questions, fetching chat history, generating upload links, and auto-confirming new sign-ups.",
        badge: "AWS",
      },
    ],
  },
  {
    title: "Identity & Access",
    resources: [
      {
        name: "Amazon Cognito",
        icon: Users,
        description:
          "Handles sign-up and sign-in through a hosted login page, and issues the secure token every request to Akosua carries.",
        badge: "AWS",
      },
      {
        name: "AWS IAM",
        icon: ShieldCheck,
        description:
          "Defines exactly what the Lambda function is allowed to touch - and nothing more, following least privilege.",
        badge: "AWS",
      },
    ],
  },
  {
    title: "API",
    resources: [
      {
        name: "Amazon API Gateway",
        icon: Network,
        description:
          "The front door for every request from your browser - routes /ask, /history, and /upload to the Lambda function.",
        badge: "AWS",
      },
    ],
  },
  {
    title: "Storage & Data",
    resources: [
      {
        name: "Amazon DynamoDB",
        icon: Database,
        description:
          "Stores every question and answer per student, so your chat history is there when you come back.",
        badge: "AWS",
      },
      {
        name: "Amazon S3",
        icon: HardDrive,
        description:
          "Two buckets: one holds the cohort's study notes for Akosua to search, the other stores files students upload.",
        badge: "AWS",
      },
      {
        name: "AWS Secrets Manager",
        icon: KeyRound,
        description:
          "Safely stores the API key used to talk to Claude, so it's never hardcoded anywhere in the code.",
        badge: "AWS",
      },
    ],
  },
  {
    title: "AI & Knowledge",
    resources: [
      {
        name: "Amazon Bedrock Knowledge Base",
        icon: Brain,
        description:
          "Searches the cohort's study notes for the passages most relevant to your question, using vector search.",
        badge: "AWS",
      },
      {
        name: "Claude",
        icon: Sparkles,
        description:
          "Reads those relevant passages and writes a clear, grounded answer as Akosua - never guessing beyond the notes.",
        badge: "Anthropic",
      },
    ],
  },
  {
    title: "Monitoring",
    resources: [
      {
        name: "Amazon CloudWatch Logs",
        icon: ScrollText,
        description:
          "Every Lambda invocation logs here automatically - it's exactly where a real platform-mismatch bug in this project's dependencies was caught and diagnosed during development.",
        badge: "AWS",
      },
    ],
  },
  {
    title: "Infrastructure as Code",
    resources: [
      {
        name: "AWS CloudFormation",
        icon: FileCode2,
        description:
          "Every resource on this page is defined in one template and deployed with a single command - nothing here was clicked into existence by hand.",
        badge: "AWS",
      },
    ],
  },
];

export default function ArchitecturePage() {
  // Comes in after every category card has started its own entrance
  // animation, so the diagram caps off the cascade instead of racing it.
  const diagramDelay = categories.length * 80 + 160;

  return (
    <main className="flex-1 bg-white px-6 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          style={{ animationDelay: "0ms" }}
        >
          Built for AWS re/Start
        </span>

        <h1
          className="animate-fade-in-up mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50"
          style={{ animationDelay: "60ms" }}
        >
          How Akosua is{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            built
          </span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400"
          style={{ animationDelay: "120ms" }}
        >
          Every service that powers this app, in plain language - so you can
          connect what you&apos;re studying to something real.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl space-y-14">
        {categories.map((category, categoryIndex) => (
          <section key={category.title}>
            <h2
              className="animate-fade-in-up text-sm font-bold tracking-wide text-amber-600 uppercase dark:text-amber-400"
              style={{ animationDelay: `${categoryIndex * 80}ms` }}
            >
              {category.title}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {category.resources.map((resource, resourceIndex) => {
                const Icon = resource.icon;
                const delay = `${categoryIndex * 80 + resourceIndex * 60 + 80}ms`;

                return (
                  <div
                    key={resource.name}
                    className="animate-fade-in-up group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/40"
                    style={{ animationDelay: delay }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-transform duration-300 group-hover:scale-110 dark:bg-amber-500/10 dark:text-amber-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                          resource.badge === "AWS"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {resource.badge}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {resource.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {resource.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-5xl">
        <h2
          className="animate-fade-in-up text-sm font-bold tracking-wide text-amber-600 uppercase dark:text-amber-400"
          style={{ animationDelay: `${diagramDelay}ms` }}
        >
          The Full Picture
        </h2>
        <p
          className="animate-fade-in-up mt-2 text-sm text-slate-600 dark:text-slate-400"
          style={{ animationDelay: `${diagramDelay + 40}ms` }}
        >
          How a question travels from your browser to Akosua and back.
        </p>

        <div
          className="animate-fade-in-up mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          style={{ animationDelay: `${diagramDelay + 80}ms` }}
        >
          <Image
            src="/architecture.png"
            alt="Diagram of the Study Buddy request flow: the student's browser signs in through Cognito, sends questions through API Gateway to a Lambda function, which retrieves study notes from a Bedrock Knowledge Base, generates an answer with Claude, and saves the conversation to DynamoDB."
            width={1693}
            height={929}
            className="h-auto w-full rounded-xl"
            sizes="(min-width: 1024px) 960px, 100vw"
          />
        </div>
      </div>
    </main>
  );
}
