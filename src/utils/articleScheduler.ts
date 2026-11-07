import { ensureArticleSchema } from "@/utils/articleStore";
import { runArticleGeneration } from "@/utils/articleGenerator";

const TICK_MS = 60_000;
const STARTUP_GRACE_MS = 10_000;
const MAX_SLOT_DELAY_MINUTES = 12;

async function runDueSlot(force = false) {
  if (process.env.ARTICLE_AUTOPUBLISH_ENABLED !== "true" || !process.env.OPENAI_API_KEY) return;

  const now = new Date();
  if (!force && now.getUTCMinutes() > MAX_SLOT_DELAY_MINUTES) return;

  try {
    console.info(`[article-scheduler] Starting ${force ? "startup recovery" : "scheduled slot"} at ${now.toISOString()}`);
    await ensureArticleSchema();
    await runArticleGeneration();
  } catch (error) {
    console.error("[article-scheduler] Could not run the scheduled article task:", error);
  }
}

export function startArticleScheduler() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.ARTICLE_AUTOPUBLISH_ENABLED !== "true") {
    console.info("[article-scheduler] Disabled; ARTICLE_AUTOPUBLISH_ENABLED is not true");
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[article-scheduler] Disabled; OPENAI_API_KEY is not configured");
    return;
  }

  const globalState = globalThis as typeof globalThis & { __anistreamArticleScheduler?: boolean };
  if (globalState.__anistreamArticleScheduler) return;
  globalState.__anistreamArticleScheduler = true;

  setTimeout(() => {
    void runDueSlot(true);
    setInterval(() => void runDueSlot(), TICK_MS);
  }, STARTUP_GRACE_MS);
  console.info("[article-scheduler] Enabled; running once after startup and checking every two-hour UTC slot");
}
