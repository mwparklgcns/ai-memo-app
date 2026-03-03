'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MEMO_CATEGORIES, TodoItem } from '@/types/memo'
import MarkdownPreview from '@/components/MarkdownPreview'

interface MemoDetailProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onUpdate: (memo: Memo) => void // 할 일 상태 변경을 위함
  onDelete: (id: string) => void
  onSummaryUpdate?: (id: string, summary: string) => void
}

export default function MemoDetail({
  memo,
  isOpen,
  onClose,
  onEdit,
  onUpdate,
  onDelete,
  onSummaryUpdate,
}: MemoDetailProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    if (memo?.summary) setSummary(memo.summary)
    else setSummary(null)
    setIsSummarizing(false)
    setSummaryError(null)
  }, [memo, isOpen])

  const handleSummarize = useCallback(async () => {
    if (!memo || isSummarizing || memo.category === 'todo') return

    setIsSummarizing(true)
    setSummaryError(null)
    setSummary(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: memo.content || '' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '요약 실패')
      setSummary(data.summary)
      if (onSummaryUpdate) onSummaryUpdate(memo.id, data.summary)
    } catch (error: any) {
      setSummaryError(error.message || '요약 중 오류 발생')
    } finally {
      setIsSummarizing(false)
    }
  }, [memo, isSummarizing, onSummaryUpdate])

  const handleToggleTodo = (todoId: string) => {
    if (!memo || !memo.todos) return
    const updatedTodos = memo.todos.map(todo =>
      todo.id === todoId ? { ...todo, isDone: !todo.isDone } : todo
    )
    const updatedMemo = { ...memo, todos: updatedTodos }
    onUpdate(updatedMemo)
  }

  const allTodosDone = useMemo(() => {
    if (memo?.category !== 'todo' || !memo.todos || memo.todos.length === 0) {
      return false
    }
    return memo.todos.every(todo => todo.isDone)
  }, [memo])

  if (!isOpen || !memo) return null

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      todo: 'bg-cyan-100 text-cyan-800',
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleEdit = () => {
    onEdit(memo)
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <h2 className={`text-2xl font-bold text-gray-900 mb-3 ${allTodosDone ? 'line-through text-gray-400' : ''}`}>
                {memo.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(memo.category)}`}>
                  {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] || memo.category}
                </span>
                <span className="text-sm text-gray-500">작성: {formatDate(memo.createdAt)}</span>
                {memo.createdAt !== memo.updatedAt && <span className="text-sm text-gray-400">수정: {formatDate(memo.updatedAt)}</span>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" aria-label="닫기">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <hr className="border-gray-200 mb-6" />

          {memo.category === 'todo' ? (
            <div className="space-y-3 mb-6 pr-2">
              {memo.todos && memo.todos.map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={todo.isDone}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`flex-1 text-gray-800 break-all ${todo.isDone ? 'line-through text-gray-400' : ''}`}>
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <MarkdownPreview source={memo.content || ''} className="prose prose-gray max-w-none" />
            </div>
          )}

          {memo.category !== 'todo' && (
             <div className="mb-6">
                {!summary && !isSummarizing && !summaryError && (
                  <button onClick={handleSummarize} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    AI 요약
                  </button>
                )}
                {isSummarizing && <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100"><svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span className="text-sm text-purple-700 font-medium">AI가 메모를 요약하고 있습니다...</span></div>}
                {summaryError && <div className="p-4 bg-red-50 rounded-lg border border-red-100"><div className="flex items-start gap-2"><svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div><p className="text-sm text-red-700">{summaryError}</p><button onClick={handleSummarize} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">다시 시도</button></div></div></div>}
                {summary && <div className="p-4 bg-purple-50 rounded-lg border border-purple-100"><div className="flex items-center gap-2 mb-3"><svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg><span className="text-sm font-semibold text-purple-800">AI 요약</span></div><div><MarkdownPreview source={summary} className="text-sm text-gray-700" /></div></div>}
              </div>
          )}

          {memo.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-200 mb-6" />

          <div className="flex gap-3">
            <button onClick={handleEdit} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              편집
            </button>
            <button onClick={handleDelete} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
