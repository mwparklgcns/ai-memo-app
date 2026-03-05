'use client'

import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MemoItem from './MemoItem'

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
          {memos.map(memo => (
            <MemoItem 
              key={memo.id}
              memo={memo}
              onEdit={onEditMemo}
              onDelete={onDeleteMemo}
              onView={onViewMemo}
            />
          ))}
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
