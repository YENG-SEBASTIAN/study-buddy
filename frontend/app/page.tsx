import Hero from "@/components/Hero";
import CohortNotice from "@/components/CohortNotice";

export default function Home() {
  return (
    <main className="flex-1 bg-white dark:bg-slate-950">
      <Hero />
      <CohortNotice />
    </main>
  );
}
