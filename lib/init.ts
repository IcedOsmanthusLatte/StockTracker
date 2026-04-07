import { startScheduler, startupCacheUpdate } from './scheduled-tasks';

let initialized = false;

/**
 * 初始化应用程序
 * - 启动时更新缓存
 * - 启动定时任务调度器
 */
export async function initializeApp(): Promise<void> {
  if (initialized) {
    console.log('[Init] 应用已初始化，跳过');
    return;
  }

  console.log('[Init] 开始初始化应用...');

  try {
    // 1. 启动时更新缓存（异步执行，不阻塞启动）
    startupCacheUpdate().catch(error => {
      console.error('[Init] 启动时缓存更新失败:', error);
    });

    // 2. 启动定时任务调度器
    startScheduler();

    initialized = true;
    console.log('[Init] 应用初始化完成');
  } catch (error) {
    console.error('[Init] 应用初始化失败:', error);
  }
}
