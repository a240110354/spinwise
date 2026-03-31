import { NextRequest, NextResponse } from 'next/server'

const STYLE_PROMPTS: Record<string, string> = {
  formal: 'Rewrite this text in a formal, professional business style. Only output the rewritten text, no explanations:',
  casual: 'Rewrite this text in a casual, conversational style. Only output the rewritten text, no explanations:',
  concise: 'Rewrite this text in a more concise and brief style. Only output the rewritten text, no explanations:',
  expand: 'Rewrite this text in a more detailed and expanded style. Only output the rewritten text, no explanations:',
  academic: 'Rewrite this text in an academic scholarly style. Only output the rewritten text, no explanations:',
}

export async function POST(request: NextRequest) {
  try {
    const { text, style } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的文本内容' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: '文本过长，请控制在 5000 字以内' },
        { status: 400 }
      )
    }

    const validStyles = Object.keys(STYLE_PROMPTS)
    if (!style || !validStyles.includes(style)) {
      return NextResponse.json(
        { success: false, error: '请选择有效的改写风格' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key 未配置' },
        { status: 500 }
      )
    }

    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional text rewriting assistant.',
            },
            {
              role: 'user',
              content: `${STYLE_PROMPTS[style]}\n\n${text}`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (openaiResponse.ok) {
        const data = await openaiResponse.json()
        const result = data.choices?.[0]?.message?.content?.trim()

        if (result) {
          return NextResponse.json({
            success: true,
            result,
            stats: {
              originalLength: text.length,
              resultLength: result.length,
            },
          })
        }
      }
    }

    // Fallback to Claude
    if (process.env.ANTHROPIC_API_KEY) {
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `${STYLE_PROMPTS[style]}\n\n${text}`,
            },
          ],
        }),
      })

      if (claudeResponse.ok) {
        const data = await claudeResponse.json()
        const result = data.content?.[0]?.text?.trim()

        if (result) {
          return NextResponse.json({
            success: true,
            result,
            stats: {
              originalLength: text.length,
              resultLength: result.length,
            },
          })
        }
      }
    }

    return NextResponse.json(
      { success: false, error: 'AI 服务暂不可用，请稍后重试' },
      { status: 500 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: '服务器错误，请重试' },
      { status: 500 }
    )
  }
}
