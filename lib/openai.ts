import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function analyzeStock(prompt: string): Promise<string> {
  try {
    console.log('[xAI] 开始分析请求...');
    console.log('[xAI] 代理配置:', process.env.HTTP_PROXY || process.env.HTTPS_PROXY || '未配置');
    
    // 组合系统提示词和用户提示词
    const fullPrompt = `你是一位专业的股票分析师，请严格按照用户提供的格式和要求进行分析。

【核心要求 - 必须严格遵守】
1. **数据真实性原则**：
   - 必须使用用户提供的基础数据（价格、涨跌幅、52周范围等）
   - 绝对禁止编造任何数据，包括价格、时间、新闻内容等
   - 如需补充信息，必须通过web_search工具搜索真实、可验证的信息
   - 如果搜索不到可靠信息，明确说明"暂无可靠信息"，不要猜测或编造

2. **输出格式要求**：
   - 语气实事求是、认真谨慎，仅针对问题直接回答
   - 所有判断必须有明确的事实依据
   - **绝对禁止在输出中包含任何形式的引用标记、URL链接或网址**
   - 不要使用 [[1]](url)、[[2]](url)、(http://...)、(https://...) 等任何引用格式
   - 将信息直接整合到文字描述中，以自然语言方式呈现

3. **严禁的行为**：
   - 不要编造不存在的新闻、公告或研报
   - 不要使用"据报道"、"有消息称"等模糊表述来掩盖编造的内容
   - 不要修改用户提供的基础数据（价格、涨跌幅等）

${prompt}`;

    console.log('[xAI] Prompt长度:', fullPrompt.length);

    const axiosConfig: any = {
      method: 'POST',
      url: 'https://api.x.ai/v1/responses',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      data: {
        model: 'grok-4-1-fast',
        input: fullPrompt,
        tools: [
          { type: 'web_search' },
          { type: 'x_search' }
        ],
      },
      timeout: 120000, // 增加到120秒
    };

    // 只在本地开发环境使用代理
    if (process.env.NODE_ENV === 'development' && (process.env.HTTP_PROXY || process.env.HTTPS_PROXY)) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      console.log('[xAI] 使用代理:', proxyUrl);
      const agent = new HttpsProxyAgent(proxyUrl!);
      axiosConfig.httpsAgent = agent;
      axiosConfig.proxy = false;
    }

    console.log('[xAI] 发送请求到 xAI API...');
    const startTime = Date.now();
    const response = await axios(axiosConfig);
    const duration = Date.now() - startTime;
    
    console.log('[xAI] 请求成功! 耗时:', duration, 'ms');
    console.log('[xAI] 响应状态:', response.status);
    
    // 提取分析文本 - 支持有tools和无tools两种响应格式
    let analysis = '分析暂时不可用';
    
    if (response.data.output && response.data.output.length > 0) {
      // 方式1: 查找assistant message（当使用tools时）
      const messageItem = response.data.output.find(
        (item: any) => item.type === 'message' && item.role === 'assistant'
      );
      
      if (messageItem?.content) {
        const textContent = messageItem.content.find((c: any) => c.type === 'output_text');
        if (textContent?.text) {
          analysis = textContent.text;
          console.log('[xAI] 从assistant message提取文本');
        }
      } else {
        // 方式2: 直接从第一个output获取（无tools时）
        const firstOutput = response.data.output[0];
        if (firstOutput?.content?.[0]?.text) {
          analysis = firstOutput.content[0].text;
          console.log('[xAI] 从第一个output提取文本');
        }
      }
    }
    
    console.log('[xAI] 分析结果长度:', analysis.length);
    console.log('[xAI] 使用的工具数:', response.data.usage?.num_server_side_tools_used || 0);
    
    const disclaimer = '\n\n---\n\n【数据说明】\n本分析数据基于公开市场及财经信息来源，存在时效性与交易时段差异风险。操作倾向严格依据公开事实与逻辑推导，不构成任何投资推荐或买卖指令。投资有风险，请结合自身情况与专业顾问意见审慎决策。';
    
    return analysis + disclaimer;
  } catch (error: any) {
    console.error('[xAI] API Error:', error.message);
    console.error('[xAI] Error code:', error.code);
    if (error.response) {
      console.error('[xAI] Response status:', error.response.status);
      console.error('[xAI] Response data:', error.response.data);
    }
    throw new Error('AI分析服务暂时不可用，请稍后再试');
  }
}
