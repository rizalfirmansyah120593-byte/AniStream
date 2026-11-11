import { ensureArticleSchema } from "@/utils/articleStore";
import { runArticleGeneration } from "@/utils/articleGenerator";

const TICK_MS = 60_000;
const STARTUP_GRACE_MS = 10_000;
const MAX_SLOT_DELAY_MS = 12 * 60_000;

function nextTwoHourSlotDelay(now: Date) {
  const next = new Date(now);
  next.setUTCMinutes(0, 0, 0);
  const nextEvenHour = Math.ceil((now.getUTCHours() + 0.001) / 2) * 2;
  if (nextEvenHour >= 24) {
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(0);
  } else {
    next.setUTCHours(nextEvenHour);
  }
  return Math.max(STARTUP_GRACE_MS, next.getTime() - now.getTime());
}

async function runDueSlot() {
  if (process.env.ARTICLE_AUTOPUBLISH_ENABLED !== "true" || !process.env.OPENAI_API_KEY) return;

  const now = new Date();
  if (now.getUTCMinutes() > MAX_SLOT_DELAY_MS / 60_000) return;

  try {
    await ensureArticleSchema();
    await runArticleGeneration();
  } catch (error) {
    console.error("[article-scheduler] Could not run the scheduled article task:", error);
  }
}

export function startArticleScheduler() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.ARTICLE_AUTOPUBLISH_ENABLED !== "true") {
    console.info("[article-scheduler] Disabled; set ARTICLE_AUTOPUBLISH_ENABLED=true to enable");
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[article-scheduler] Disabled; OPENAI_API_KEY is not configured");
    return;
  }

  const globalState = globalThis as typeof globalThis & { __anistreamArticleScheduler?: boolean };
  if (globalState.__anistreamArticleScheduler) return;
  globalState.__anistreamArticleScheduler = true;

  const scheduleNext = () => {
    const timer = setTimeout(() => {
      void runDueSlot().finally(() => {
        setInterval(() => void runDueSlot(), TICK_MS);
      });
    }, nextTwoHourSlotDelay(new Date()));
    timer.unref?.();
  };

  scheduleNext();
  console.info("[article-scheduler] Enabled; checking UTC two-hour slots");
}
