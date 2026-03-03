import { createClient } from '@supabase/supabase-js'
import { Memo, TodoItem } from '@/types/memo'

// Database row type (snake_case)
export interface MemoRow {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  summary: string | null;
  created_at: string;
  updated_at: string;
  profile: string;
}

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// DB row -> Memo 변환 (snake_case -> camelCase)
export function rowToMemo(row: MemoRow): Memo {
  const memo: Memo = {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category as Memo['category'],
    tags: row.tags,
    summary: row.summary ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile: row.profile,
  }

  // 'todo' 카테고리인 경우 content를 todos로 파싱
  if (memo.category === 'todo' && memo.content) {
    try {
      memo.todos = JSON.parse(memo.content) as TodoItem[];
      // 파싱에 성공하면 content는 비워두어 혼동을 방지
      memo.content = ''; 
    } catch (e) {
      console.error('Failed to parse todos from content:', e);
      memo.todos = []; // 파싱 실패 시 빈 배열 할당
    }
  }

  return memo;
}

// Memo -> DB row 변환 (camelCase -> snake_case)
export function memoToRow(
  memo: Partial<Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>>
): Partial<Omit<MemoRow, 'id' | 'created_at' | 'updated_at'>> {
  const row: Partial<Omit<MemoRow, 'id' | 'created_at' | 'updated_at'>> = {};

  // 'todo' 카테고리인 경우 todos를 content로 변환
  if (memo.category === 'todo' && memo.todos) {
    row.content = JSON.stringify(memo.todos);
  } else if (memo.content !== undefined) {
    row.content = memo.content;
  }

  if (memo.title !== undefined) row.title = memo.title;
  if (memo.category !== undefined) row.category = memo.category;
  if (memo.tags !== undefined) row.tags = memo.tags;
  if (memo.summary !== undefined) row.summary = memo.summary;
  if (memo.profile !== undefined) row.profile = memo.profile;

  return row;
}
