'use server'

import { supabase, rowToMemo, memoToRow, MemoRow } from '@/utils/supabase'
import { Memo, MemoFormData } from '@/types/memo'

// 특정 프로필의 모든 메모 조회
export async function getMemos(profile: string): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('profile', profile)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('메모 조회 오류:', error)
    throw new Error('메모를 불러오는데 실패했습니다.')
  }

  return (data as MemoRow[]).map(rowToMemo)
}

// 단일 메모 조회 (프로필 검증 포함)
export async function getMemoById(id: string, profile: string): Promise<Memo | null> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .eq('profile', profile)
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
    .insert(memoToRow(formData))
    .select()
    .single()

  if (error) {
    console.error('메모 생성 오류:', error)
    throw new Error('메모 생성에 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 수정 (프로필 검증 포함)
export async function updateMemo(
  id: string,
  profile: string,
  formData: Partial<Omit<MemoFormData, 'profile'>>
): Promise<Memo> {
  const updateData = memoToRow(formData)

  const { data, error } = await supabase
    .from('memos')
    .update(updateData)
    .eq('id', id)
    .eq('profile', profile)
    .select()
    .single()

  if (error) {
    console.error('메모 수정 오류:', error)
    throw new Error('메모 수정에 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 요약 업데이트 (프로필 검증 포함)
export async function updateMemoSummary(
  id: string,
  profile: string,
  summary: string
): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .update({ summary })
    .eq('id', id)
    .eq('profile', profile)
    .select()
    .single()

  if (error) {
    console.error('메모 요약 업데이트 오류:', error)
    throw new Error('메모 요약 업데이트에 실패했습니다.')
  }

  return rowToMemo(data as MemoRow)
}

// 메모 삭제 (프로필 검증 포함)
export async function deleteMemo(id: string, profile: string): Promise<void> {
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id)
    .eq('profile', profile)

  if (error) {
    console.error('메모 삭제 오류:', error)
    throw new Error('메모 삭제에 실패했습니다.')
  }
}
