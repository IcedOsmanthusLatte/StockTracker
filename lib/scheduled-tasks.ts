import { supabase } from './supabase';
import { getTodayCache, saveTodayCache, analyzeWithRetry, getChinaDateString } from './cache-utils';
import { analyzeStock } from './openai';
import { formatPrompt } from './ai-prompt';

/**
 * 更新指定列表类型的所有股票缓存
 * @param listType - 列表类型 ('berkshire' 或 'featured')
 */
export async function updateListCache(listType: 'berkshire' | 'featured'): Promise<void> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return;
  }

  console.log(`[Scheduled Task] 开始更新 ${listType} 列表缓存...`);
  const todayDate = getChinaDateString();

  // 获取该列表的所有股票
  const { data: stocks, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('list_type', listType)
    .order('display_order', { ascending: true });

  if (error || !stocks || stocks.length === 0) {
    console.error(`[Scheduled Task] 获取 ${listType} 股票列表失败:`, error);
    return;
  }

  console.log(`[Scheduled Task] 找到 ${stocks.length} 只 ${listType} 股票`);

  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // 逐个检查并更新
  for (const stock of stocks) {
    try {
      // 检查是否已有当天缓存
      const existingCache = await getTodayCache(stock.symbol);
      
      if (existingCache) {
        console.log(`[Scheduled Task] ${stock.symbol} 已有当天缓存，跳过`);
        skippedCount++;
        continue;
      }

      console.log(`[Scheduled Task] 开始分析 ${stock.symbol} (${stock.name})`);

      // 使用重试机制进行AI分析
      const analysis = await analyzeWithRetry(async () => {
        const prompt = formatPrompt({
          symbol: stock.symbol,
          name: stock.name
        });
        return await analyzeStock(prompt);
      }, 3);

      // 保存到缓存
      await saveTodayCache(stock.id, stock.symbol, analysis);
      console.log(`[Scheduled Task] ${stock.symbol} 分析完成并已缓存`);
      updatedCount++;

      // 添加延迟避免API限流（每次分析后等待2秒）
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`[Scheduled Task] ${stock.symbol} 分析失败:`, error);
      failedCount++;
    }
  }

  console.log(`[Scheduled Task] ${listType} 列表更新完成:`);
  console.log(`  - 更新: ${updatedCount} 只`);
  console.log(`  - 跳过: ${skippedCount} 只`);
  console.log(`  - 失败: ${failedCount} 只`);
}

/**
 * 每天早上10点（中国时间）执行的定时任务
 */
export async function dailyScheduledUpdate(): Promise<void> {
  console.log('[Scheduled Task] 开始每日定时更新...');
  
  try {
    // 更新伯克希尔列表
    await updateListCache('berkshire');
    
    // 更新特别关注列表
    await updateListCache('featured');
    
    console.log('[Scheduled Task] 每日定时更新完成');
  } catch (error) {
    console.error('[Scheduled Task] 每日定时更新失败:', error);
  }
}

/**
 * 项目启动时执行的缓存更新
 */
export async function startupCacheUpdate(): Promise<void> {
  console.log('[Startup] 开始启动时缓存更新...');
  
  try {
    // 更新伯克希尔列表
    await updateListCache('berkshire');
    
    // 更新特别关注列表
    await updateListCache('featured');
    
    console.log('[Startup] 启动时缓存更新完成');
  } catch (error) {
    console.error('[Startup] 启动时缓存更新失败:', error);
  }
}

/**
 * 启动定时任务调度器
 * 每天早上10点（中国时间）执行
 */
export function startScheduler(): void {
  console.log('[Scheduler] 定时任务调度器已启动');
  
  // 计算下次执行时间（中国时间早上10点）
  function getNextRunTime(): number {
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    
    const targetTime = new Date(chinaTime);
    targetTime.setUTCHours(2, 0, 0, 0); // UTC 2:00 = 中国时间 10:00
    
    // 如果今天的10点已过，设置为明天10点
    if (chinaTime.getTime() >= targetTime.getTime()) {
      targetTime.setUTCDate(targetTime.getUTCDate() + 1);
    }
    
    return targetTime.getTime() - now.getTime();
  }
  
  // 设置定时任务
  function scheduleNext(): void {
    const delay = getNextRunTime();
    const hours = Math.floor(delay / (1000 * 60 * 60));
    const minutes = Math.floor((delay % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`[Scheduler] 下次执行时间: ${hours}小时${minutes}分钟后`);
    
    setTimeout(async () => {
      await dailyScheduledUpdate();
      scheduleNext(); // 执行完后安排下一次
    }, delay);
  }
  
  scheduleNext();
}
