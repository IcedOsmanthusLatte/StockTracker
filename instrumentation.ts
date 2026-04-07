/**
 * Next.js Instrumentation
 * 在服务器启动时自动执行
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeApp } = await import('./lib/init');
    await initializeApp();
  }
}
