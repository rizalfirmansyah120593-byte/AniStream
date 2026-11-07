export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startArticleScheduler } = await import("./src/utils/articleScheduler");
  startArticleScheduler();
}
