'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import * as memoActions from '@/app/actions/memos'

export const useMemos = (profile: string | null) => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadMemos = useCallback(async () => {
    if (!profile) {
      setMemos([]);
      setLoading(false);
      return;
    }
    setLoading(true)
    try {
      const loadedMemos = await memoActions.getMemos(profile)
      setMemos(loadedMemos)
    } catch (error) {
      console.error('Failed to load memos:', error)
      setMemos([]); // Clear memos on error
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    loadMemos()
  }, [loadMemos])

  const createMemo = useCallback(async (formData: Omit<MemoFormData, 'profile'>) => {
    if (!profile) throw new Error('Profile not set');
    const newMemo = await memoActions.createMemo({ ...formData, profile })
    setMemos(prev => [newMemo, ...prev])
    return newMemo
  }, [profile])

  const updateMemo = useCallback(async (id: string, formData: Omit<MemoFormData, 'profile'>) => {
    if (!profile) throw new Error('Profile not set');
    const updatedMemo = await memoActions.updateMemo(id, profile, formData)
    setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))
  }, [profile])

  const deleteMemo = useCallback(async (id: string) => {
    if (!profile) throw new Error('Profile not set');
    await memoActions.deleteMemo(id, profile)
    setMemos(prev => prev.filter(memo => memo.id !== id))
  }, [profile])

  const updateMemoSummary = useCallback(async (id: string, summary: string) => {
    if (!profile) throw new Error('Profile not set');
    const updatedMemo = await memoActions.updateMemoSummary(id, profile, summary)
    setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))
  }, [profile])

  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  const filteredMemos = useMemo(() => {
    let filtered = memos;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          (memo.tags && memo.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    memos: filteredMemos,
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
  }
}
