'use client'

import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoListProps {
  memos: Memo[]
  loading: boolean
  searchQuery: string
  selectedCategory: string
  stats: {
    total: number
    filtered: number
    byCategory: Record<string, number>
  }
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onEditMemo: (memo: Memo) => void
  onDeleteMemo: (id: string) => void
  onViewMemo: (memo: Memo) => void
}

export default function MemoList({
  memos,
  loading,
  searchQuery,
  selectedCategory,
  stats,
  onSearchChange,
  onCategoryChange,
  onEditMemo,
  onDeleteMemo,
  onViewMemo,
}: MemoListProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      todo: 'border-cyan-500',
      personal: 'border-blue-500',
      work: 'border-green-500',
      study: 'border-purple-500',
      idea: 'border-yellow-500',
      other: 'border-gray-500',
    }
    return colors[category] || colors.other
  }

  const allCategories = ['all', ...Object.keys(MEMO_CATEGORIES)]

  return (
    <div className="space-y-8">
      {/* 검색 및 필터 */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="검색... (제목, 내용, 태그)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '전체 카테고리' : MEMO_CATEGORIES[cat as keyof typeof MEMO_CATEGORIES]}
                ({stats.byCategory[cat] || 0})
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          총 {stats.total}개의 메모 중 {stats.filtered}개가 표시됩니다.
        </p>
      </div>

      {/* 메모 목록 */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">메모를 불러오는 중...</p>
        </div>
      ) : memos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memos.map(memo => {
             const allTodosDone = memo.category === 'todo' && memo.todos && memo.todos.every(t => t.isDone);
             return (
                <div
                  key={memo.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 border-l-4 ${getCategoryColor(memo.category)}`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 
                        className={`text-lg font-bold text-gray-800 mb-2 truncate cursor-pointer hover:text-blue-600 transition-colors ${allTodosDone ? 'line-through text-gray-400' : ''}`}
                        onClick={() => onViewMemo(memo)}
                        title={memo.title}
                      >
                        {memo.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {MEMO_CATEGORIES[memo.category]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 h-12 overflow-hidden mb-3">
                      {memo.summary || (memo.category === 'todo' ? `${memo.todos?.length || 0}개의 할 일` : memo.content) }
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(memo.updatedAt).toLocaleDateString('ko-KR')}</span>
                      <div className="flex space-x-2">
                        <button onClick={() => onEditMemo(memo)} className="text-blue-500 hover:text-blue-700">편집</button>
                        <button onClick={() => onDeleteMemo(memo.id)} className="text-red-500 hover:text-red-700">삭제</button>
                      </div>
                    </div>
                  </div>
                </div>
             );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">표시할 메모가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">새 메모를 작성해보세요!</p>
        </div>
      )}
    </div>
  )
}
