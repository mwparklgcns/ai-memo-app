'use client'

import { useState, useCallback } from 'react'
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
    updateMemo, 
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

  const handleCreateMemo = useCallback(async (formData: Omit<MemoFormData, 'profile'>) => {
    await createMemo(formData)
    setIsFormOpen(false)
  }, [createMemo]);

  const handleUpdateMemo = useCallback(async (formData: Omit<MemoFormData, 'profile'>) => {
    if (editingMemo) {
      const updatedMemo = await updateMemo(editingMemo.id, formData);
      setEditingMemo(null);
      setIsFormOpen(false);
      // 상세 보기가 열려있었다면, 최신 내용으로 업데이트
      if (viewingMemo && viewingMemo.id === editingMemo.id) {
        setViewingMemo(updatedMemo);
      }
    }
  }, [editingMemo, viewingMemo, updateMemo]);
  
  const handleUpdateTodoState = useCallback(async (memo: Memo) => {
    // 상세 보기에서 '할 일' 상태만 변경하는 경우
    const updatedMemo = await updateMemo(memo.id, memo);
    // viewingMemo 상태를 직접 업데이트하여 UI에 즉시 반영
    setViewingMemo(updatedMemo);
  }, [updateMemo]);

  const openNewMemoForm = useCallback(() => {
    setEditingMemo(null);
    setIsFormOpen(true);
  }, []);

  const openEditMemoForm = useCallback((memo: Memo) => {
    setViewingMemo(null); // 상세 모달 닫기
    setEditingMemo(memo);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingMemo(null);
  }, []);

  const handleViewMemo = useCallback((memo: Memo) => {
    setViewingMemo(memo);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setViewingMemo(null);
  }, []);

  const handleDeleteMemo = useCallback(async (id: string) => {
    await deleteMemo(id);
    if (viewingMemo && viewingMemo.id === id) {
      setViewingMemo(null); // 삭제된 메모가 상세보기에 있었다면 닫기
    }
  }, [deleteMemo, viewingMemo]);

  const handleSummaryUpdate = useCallback(async (id: string, summary: string) => {
    await updateMemoSummary(id, summary);
    if (viewingMemo && viewingMemo.id === id) {
      setViewingMemo(prev => prev ? { ...prev, summary } : null);
    }
  }, [updateMemoSummary, viewingMemo]);

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
                onClick={openNewMemoForm}
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
          onEditMemo={openEditMemoForm}
          onDeleteMemo={handleDeleteMemo}
          onViewMemo={handleViewMemo}
          stats={stats}
        />
      </main>

      <MemoDetail
        memo={viewingMemo}
        isOpen={viewingMemo !== null}
        onClose={handleCloseDetail}
        onEdit={openEditMemoForm}
        onUpdate={handleUpdateTodoState}
        onDelete={handleDeleteMemo}
        onSummaryUpdate={handleSummaryUpdate}
      />

      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
        editingMemo={editingMemo}
      />
    </div>
  )
}
