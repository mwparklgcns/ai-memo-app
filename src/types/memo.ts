
export const MEMO_CATEGORIES = {
  todo: '할 일',
  personal: '개인',
  work: '업무',
  study: '학습',
  idea: '아이디어',
  other: '기타',
} as const;

export type MemoCategory = keyof typeof MEMO_CATEGORIES;

export interface TodoItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface Memo {
  id: string;
  profile: string;
  title: string;
  category: MemoCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
  content?: string; // 일반 메모용
  todos?: TodoItem[]; // '할 일' 메모용
}

export type MemoFormData = Omit<Memo, 'id' | 'createdAt' | 'updatedAt' | 'summary'>;
