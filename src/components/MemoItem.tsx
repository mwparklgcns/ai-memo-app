'use client'

import { Memo, MEMO_CATEGORIES, MEMO_CATEGORY_COLORS } from '@/types/memo'
import MarkdownPreview from '@/components/MarkdownPreview'

interface MemoItemProps {
  memo: Memo
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
  onView: (memo: Memo) => void
}

export default function MemoItem({
  memo,
  onEdit,
  onDelete,
  onView,
}: MemoItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const allTodosDone = memo.category === 'todo' && memo.todos && memo.todos.length > 0 && memo.todos.every(t => t.isDone);

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col justify-between"
      onClick={() => onView(memo)}
      data-testid="memo-item-card"
    >
      <div>
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold text-gray-900 mb-2 truncate ${allTodosDone ? 'line-through text-gray-400' : ''}`}>
              {memo.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${MEMO_CATEGORY_COLORS[memo.category]}`}
              >
                {MEMO_CATEGORIES[memo.category] || memo.category}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(memo.updatedAt)}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button
              onClick={e => {
                e.stopPropagation()
                onEdit(memo)
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="편집"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                  onDelete(memo.id)
                }
              }}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="my-4 text-sm text-gray-800">
            {memo.category === 'todo' && memo.todos && memo.todos.length > 0 ? (
              <div className="space-y-2">
                <ul className="space-y-1">
                  {memo.todos.slice(0, 3).map(todo => (
                    <li key={todo.id} className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={todo.isDone}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-0 focus:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={`${todo.isDone ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {todo.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {memo.todos.length > 3 && (
                  <p className="text-xs text-gray-500 ml-6">...외 {memo.todos.length - 3}개</p>
                )}
              </div>
            ) : (
              <div className="line-clamp-3">
                <MarkdownPreview source={memo.content} />
              </div>
            )}
        </div>

        {/* AI 요약 (있는 경우) */}
        {memo.summary && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <span className="text-xs font-semibold text-purple-700">
                AI 요약
              </span>
            </div>
            <div className="text-xs text-gray-600 line-clamp-2">
              <MarkdownPreview source={memo.summary} />
            </div>
          </div>
        )}
      </div>

      {/* 태그 */}
      {memo.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-auto">
          {memo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
