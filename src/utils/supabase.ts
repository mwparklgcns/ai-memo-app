import { createClient } from '@supabase/supabase-js'
import { Memo } from '@/types/memo'

// Database row type (snake_case)
export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  summary: string | null
  created_at: string
  updated_at: string
}

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// DB row -> Memo 변환 (snake_case -> camelCase)
export function rowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    summary: row.summary ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Memo -> DB row 변환 (camelCase -> snake_case)
export function memoToRow(
  memo: Partial<Memo>
): Partial<Omit<MemoRow, 'id' | 'created_at' | 'updated_at'>> {
  const row: Partial<Omit<MemoRow, 'id' | 'created_at' | 'updated_at'>> = {}

  if (memo.title !== undefined) row.title = memo.title
  if (memo.content !== undefined) row.content = memo.content
  if (memo.category !== undefined) row.category = memo.category
  if (memo.tags !== undefined) row.tags = memo.tags
  if (memo.summary !== undefined) row.summary = memo.summary

  return row
}
