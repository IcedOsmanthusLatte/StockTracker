import { NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const XAI_API_KEY = process.env.XAI_API_KEY!;
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

// POST - AI搜索股票
export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入搜索关键词' },
        { status: 400 }
      );
    }

    const prompt = `请根据搜索关键词"${query}"，搜索相关股票。

要求：
1. 返回最多3个最相关的股票
2. 每个股票必须包含：股票代码（symbol）和股票名称（name）
3. 股票代码必须是标准格式（如：AAPL, 600519.SH, 0700.HK）
4. 必须返回JSON格式：{"stocks": [{"symbol": "代码", "name": "名称"}]}
5. 如果找不到相关股票，返回：{"stocks": []}
6. 不要返回任何解释性文字，只返回JSON`;

    const axiosConfig: any = {
      method: 'POST',
      url: 'https://api.x.ai/v1/responses',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      data: {
        model: 'grok-4-1-fast',
        input: prompt,
      },
      timeout: 60000, // 增加到60秒
    };

    // 如果有代理配置，使用axios的代理
    if (HTTP_PROXY) {
      const agent = new HttpsProxyAgent(HTTP_PROXY, {
        timeout: 30000, // 代理连接超时30秒
      });
      axiosConfig.httpsAgent = agent;
      axiosConfig.proxy = false;
    }

    // 调用 xAI API
    let response;
    try {
      response = await axios(axiosConfig);
    } catch (axiosError: any) {
      console.error('[AI Search] API call failed:', axiosError.message);
      if (axiosError.code === 'ECONNRESET' || axiosError.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { error: '网络连接失败，请检查代理设置或稍后重试' },
          { status: 500 }
        );
      }
      throw axiosError;
    }

    // 提取AI响应文本
    let aiResponse: string = '';
    
    console.log('[AI Search] Response data output:', response.data.output);
    
    if (response.data.output && response.data.output.length > 0) {
      // 尝试找到 output_text 类型的输出
      const outputText = response.data.output.find((item: any) => item.type === 'output_text');
      console.log('[AI Search] Found output_text:', outputText);
      
      if (outputText && outputText.text) {
        aiResponse = String(outputText.text);
        console.log('[AI Search] Extracted text from output_text:', aiResponse);
      } else {
        // 备用：尝试找到 assistant 消息
        const assistantMessage = response.data.output.find((msg: any) => msg.role === 'assistant');
        console.log('[AI Search] Found assistant message:', assistantMessage);
        
        if (assistantMessage && assistantMessage.content) {
          // content 可能是数组
          if (Array.isArray(assistantMessage.content)) {
            // 查找 output_text 类型的内容
            const textContent = assistantMessage.content.find((item: any) => item.type === 'output_text' || item.type === 'text');
            console.log('[AI Search] Found text content in array:', textContent);
            if (textContent && textContent.text) {
              aiResponse = String(textContent.text);
              console.log('[AI Search] Extracted text from assistant content array:', aiResponse);
            }
          } else if (typeof assistantMessage.content === 'string') {
            aiResponse = assistantMessage.content;
            console.log('[AI Search] Extracted text from assistant content string:', aiResponse);
          }
        }
      }
    }

    if (!aiResponse) {
      console.error('[AI Search] Empty response, output was:', response.data.output);
      return NextResponse.json(
        { error: 'AI返回空响应' },
        { status: 500 }
      );
    }

    console.log('[AI Search] Final aiResponse type:', typeof aiResponse);
    console.log('[AI Search] Final aiResponse value:', aiResponse);
    
    // 解析AI返回的JSON
    let stocks = [];
    try {
      // 尝试提取JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      console.log('[AI Search] JSON match result:', jsonMatch ? 'Found' : 'Not found');
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[AI Search] Parsed result:', parsed);
        stocks = parsed.stocks || [];
      } else {
        console.error('[AI Search] No JSON found in response');
        return NextResponse.json(
          { error: 'AI返回格式错误：未找到JSON' },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error('[AI Search] Failed to parse JSON:', parseError);
      console.error('[AI Search] AI response was:', aiResponse);
      return NextResponse.json(
        { error: 'AI返回格式错误' },
        { status: 500 }
      );
    }

    // 验证和清理数据
    const validStocks = stocks
      .filter((stock: any) => stock.symbol && stock.name)
      .slice(0, 3)
      .map((stock: any) => ({
        symbol: stock.symbol.trim().toUpperCase(),
        name: stock.name.trim(),
      }));

    return NextResponse.json({ stocks: validStocks });
  } catch (error) {
    console.error('AI stock search error:', error);
    return NextResponse.json(
      { error: 'AI搜索失败' },
      { status: 500 }
    );
  }
}
