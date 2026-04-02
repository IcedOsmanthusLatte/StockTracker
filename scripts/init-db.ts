// 这个脚本需要在 Supabase SQL Editor 中手动执行
// 或者你可以提供 service_role key 让我通过 API 执行

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 需要 service_role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initDatabase() {
  console.log('开始初始化数据库...');
  
  // 插入初始股票数据
  const stocks = [
    { symbol: '600519', name: '贵州茅台' },
    { symbol: '000858', name: '五粮液' },
    { symbol: '601318', name: '中国平安' },
    { symbol: '600036', name: '招商银行' },
    { symbol: '000333', name: '美的集团' }
  ];

  for (const stock of stocks) {
    const { data, error } = await supabase
      .from('stocks')
      .upsert(stock, { onConflict: 'symbol' });
    
    if (error) {
      console.error(`插入 ${stock.name} 失败:`, error);
    } else {
      console.log(`✓ ${stock.name} 已添加`);
    }
  }

  console.log('数据库初始化完成！');
}

initDatabase();
