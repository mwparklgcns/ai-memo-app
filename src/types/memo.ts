export const MEMO_CATEGORIES = {
  personal: '개인',
  work: '업무',
  idea: '아이디어',
  todo: '할 일',
  study: '학습',
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
  title: string;
  content: string; 
  category: MemoCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  profile: string;
  summary?: string;
  todos?: TodoItem[]; // '할 일' 메모용
}

export type MemoFormData = Partial<Omit<Memo, 'id' | 'createdAt' | 'updatedAt' | 'summary'>>;
