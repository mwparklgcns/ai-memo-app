'use client'

import { useState } from 'react'
import { useMemos } from '@/hooks/useMemos'
import { Memo, MemoFormData } from '@/types/memo'
import MemoList from '@/components/MemoList'
import MemoForm from '@/components/MemoForm'
import MemoDetail from '@/components/MemoDetail'
import ProfileLogin from '@/components/ProfileLogin'

export default function Home() {
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);
  const {
    memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo, // MemoDetail에서 사용하기 위해 가져옴
    deleteMemo,
    searchMemos,
    filterByCategory,
    updateMemoSummary,
  } = useMemos(currentProfile)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [viewingMemo, setViewingMemo] = useState<Memo | null>(null)

  const handleLogin = (profile: string) => {
    setCurrentProfile(profile);
  };

  const handleCreateMemo = async (formData: Omit<MemoFormData, 'profile'>) => {
    await createMemo(formData)
    setIsFormOpen(false)
  }

  const handleUpdateMemoInForm = async (formData: Omit<MemoFormData, 'profile'>) => {
    if (editingMemo) {
      // 폼을 통해 전체 내용을 수정하는 경우
      await updateMemo(editingMemo.id, formData)
      setEditingMemo(null)
      setIsFormOpen(false)
      // 상세 보기가 열려있었다면, 최신 내용으로 업데이트
      if (viewingMemo && viewingMemo.id === editingMemo.id) {
        // Đây là nơi bạn sẽ cần tải lại dữ liệu hoặc cập nhật cục bộ
        const reloadedMemos = await useMemos(currentProfile).memos;
        const updatedViewingMemo = reloadedMemos.find(m => m.id === editingMemo.id);
        setViewingMemo(updatedViewingMemo || null);
      }
    }
  }
  
  const handleUpdateMemoState = async (memo: Memo) => {
    // 상세 보기에서 '할 일' 상태만 변경하는 경우
    await updateMemo(memo.id, memo as MemoFormData);
    // viewingMemo 상태를 직접 업데이트하여 UI에 즉시 반영
    setViewingMemo(memo);
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo)
    setIsFormOpen(true)
    // 상세 보기 모달이 열려있다면 닫기
    if (viewingMemo) {
      setViewingMemo(null);
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  const handleViewMemo = (memo: Memo) => {
    setViewingMemo(memo)
  }

  const handleCloseDetail = () => {
    setViewingMemo(null)
  }

  const handleDeleteFromDetail = async (id: string) => {
    await deleteMemo(id)
    setViewingMemo(null)
  }

  const handleDeleteMemo = async (id: string) => {
    await deleteMemo(id)
  }

  const handleSummaryUpdate = async (id: string, summary: string) => {
    await updateMemoSummary(id, summary)
    if (viewingMemo && viewingMemo.id === id) {
      setViewingMemo({ ...viewingMemo, summary })
    }
  }

  if (!currentProfile) {
    return <ProfileLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">📝 메모 앱 ({currentProfile})</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onEditMemo={handleEditMemo}
          onDeleteMemo={handleDeleteMemo}
          onViewMemo={handleViewMemo}
          stats={stats}
        />
      </main>

      <MemoDetail
        memo={viewingMemo}
        isOpen={viewingMemo !== null}
        onClose={handleCloseDetail}
        onEdit={handleEditMemo} // 편집 버튼 클릭 시 handleEditMemo 호출
        onUpdate={handleUpdateMemoState} // 할 일 상태 변경 시
        onDelete={handleDeleteFromDetail}
        onSummaryUpdate={handleSummaryUpdate}
      />

      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemoInForm : handleCreateMemo}
        editingMemo={editingMemo}
      />
    </div>
  )
}
