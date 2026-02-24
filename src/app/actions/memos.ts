'use server'

import { supabase, rowToMemo, memoToRow, MemoRow } from '@/utils/supabase'
import { Memo, MemoFormData } from '@/types/memo'

// 모든 메모 조회
export async function getMemos(): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('메모 조회 오류:', error)
    throw new Error('메모를 불러오는데 실패했습니다.')
  }

  return (data as MemoRow[]).map(rowToMemo)
}

// 단일 메모 조회
export async function getMemoById(id: string): Promise<Memo | null> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // 메모를 찾을 수 없음
    }
    console.error('메모 조회 오류:', error)
    throw new Error('메모를 불러오는데 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 생성
export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .select()
    .single()

  if (error) {
    console.error('메모 생성 오류:', error)
    throw new Error('메모 생성에 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 수정
export async function updateMemo(
  id: string,
  formData: Partial<MemoFormData>
): Promise<Memo> {
  const updateData = memoToRow(formData)

  const { data, error } = await supabase
    .from('memos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('메모 수정 오류:', error)
    throw new Error('메모 수정에 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 요약 업데이트
export async function updateMemoSummary(
  id: string,
  summary: string
): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .update({ summary })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('메모 요약 업데이트 오류:', error)
    throw new Error('메모 요약 업데이트에 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 삭제
export async function deleteMemo(id: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) {
    console.error('메모 삭제 오류:', error)
    throw new Error('메모 삭제에 실패했습니다.')
  }
}

// 카테고리별 메모 조회
export async function getMemosByCategory(category: string): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('카테고리별 메모 조회 오류:', error)
    throw new Error('메모를 불러오는데 실패했습니다.')
  }

  return (data as MemoRow[]).map(rowToMemo)
}

// 메모 검색
export async function searchMemos(query: string): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('메모 검색 오류:', error)
    throw new Error('메모 검색에 실패했습니다.')
  }

  return (data as MemoRow[]).map(rowToMemo)
}
