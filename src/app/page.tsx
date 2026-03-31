'use client'

import { useState } from 'react'

const STYLES = [
  { value: 'formal', label: '正式 (Formal)', desc: '商务、书面语风格' },
  { value: 'casual', label: '口语化 (Casual)', desc: '轻松、日常表达' },
  { value: 'concise', label: '简洁 (Concise)', desc: '更简短直接' },
  { value: 'expand', label: '扩展 (Expand)', desc: '更详细丰富' },
  { value: 'academic', label: '学术 (Academic)', desc: '论文风格' },
]

const STYLE_PROMPTS: Record<string, string> = {
  formal: 'Rewrite this text in a formal, professional business style:',
  casual: 'Rewrite this text in a casual, conversational style:',
  concise: 'Rewrite this text in a more concise and brief style:',
  expand: 'Rewrite this text in a more detailed and expanded style:',
  academic: 'Rewrite this text in an academic scholarly style:',
}

export default function Home() {
  const [text, setText] = useState('')
  const [style, setStyle] = useState('formal')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleParaphrase = async () => {
    if (!text.trim()) {
      setError('请输入文本')
      return
    }

    if (text.length > 5000) {
      setError('文本过长，请控制在 5000 字以内')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '改写失败，请重试')
      }

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '改写失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Spinwise
          </h1>
          <p className="text-slate-600">
            AI 驱动的文本改写工具 · 5 种风格可选
          </p>
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            改写风格
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  style === s.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs opacity-75">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            输入文本
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此粘贴或输入需要改写的文本..."
            className="w-full h-48 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900 placeholder-slate-400"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-500">
              {text.length} / 5000 字
            </span>
            {error && text.length > 0 && (
              <span className="text-xs text-red-500">{error}</span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleParaphrase}
          disabled={loading || !text.trim()}
          className="w-full py-3 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors mb-8"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              改写中...
            </span>
          ) : (
            '开始改写'
          )}
        </button>

        {/* Error Display */}
        {error && !text.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Result Area */}
        {result && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">
                改写结果
              </label>
              <button
                onClick={handleCopy}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {copied ? '✓ 已复制' : '复制结果'}
              </button>
            </div>
            <textarea
              value={result}
              readOnly
              className="w-full h-48 p-4 rounded-lg border border-slate-300 bg-slate-50 resize-none text-slate-900"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-500">
                原文 {text.length} 字 → 结果 {result.length} 字
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-500">
          <p>纯前端架构 · API 直调 · Cloudflare Pages 部署</p>
          <p className="mt-1">不存储用户输入，保护隐私</p>
        </footer>
      </div>
    </main>
  )
}
