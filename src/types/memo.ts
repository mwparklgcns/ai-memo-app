export const MEMO_CATEGORIES = {
  personal: '개인',
  work: '업무',
  idea: '아이디어',
  todo: '할 일',
  study: '학습',
  other: '기타',
} as const;

export type MemoCategory = keyof typeof MEMO_CATEGORIES;

export const MEMO_CATEGORY_COLORS: Record<MemoCategory, string> = {
  personal: 'bg-blue-100 text-blue-800',
  work: 'bg-green-100 text-green-800',
  idea: 'bg-yellow-100 text-yellow-800',
  todo: 'bg-cyan-100 text-cyan-800',
  study: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

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
