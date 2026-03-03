'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { Memo, MemoFormData, MEMO_CATEGORIES, TodoItem } from '@/types/memo'
import { v4 as uuidv4 } from 'uuid'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: MemoFormData) => void
  editingMemo: Memo | null
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
}: MemoFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('personal')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodoText, setNewTodoText] = useState('')

  const formId = useId()

  const resetForm = useCallback(() => {
    setTitle('')
    setContent('')
    setCategory('personal')
    setTags([])
    setTagInput('')
    setTodos([])
    setNewTodoText('')
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (editingMemo) {
        setTitle(editingMemo.title)
        setCategory(editingMemo.category)
        setTags(editingMemo.tags || [])
        if (editingMemo.category === 'todo') {
          setTodos(editingMemo.todos || [])
          setContent('') // 할 일 메모 편집 시 content는 비워둠
        } else {
          setContent(editingMemo.content)
          setTodos([]) // 일반 메모 편집 시 todos는 비워둠
        }
      } else {
        resetForm()
      }
    } else {
      // 폼이 닫힐 때 0.3초 후에 상태를 초기화 (애니메이션)
      setTimeout(resetForm, 300);
    }
  }, [isOpen, editingMemo, resetForm])

  // 카테고리 변경 시 데이터 변환 로직
  useEffect(() => {
    // 폼이 열려있을 때만 동작
    if (!isOpen) return;

    if (category === 'todo') {
      // 일반 -> 할 일: content를 todos로 변환
      if (content.trim() !== '') {
        const newTodos = content
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => ({ id: uuidv4(), text: line, isDone: false }));
        setTodos(newTodos);
        setContent(''); // 변환 후 content 초기화
      }
    } else {
      // 할 일 -> 일반: todos를 content로 변환
      if (todos.length > 0) {
        const newContent = todos
          .map(todo => `- [${todo.isDone ? 'x' : ' '}] ${todo.text}`)
          .join('\n');
        setContent(newContent);
        setTodos([]); // 변환 후 todos 초기화
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, isOpen]); // isOpen을 추가하여 폼이 열릴 때 초기 변환을 막음


  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddTodo = () => {
    if (newTodoText.trim() !== '') {
      setTodos([...todos, { id: uuidv4(), text: newTodoText, isDone: false }])
      setNewTodoText('')
    }
  }

  const handleTodoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTodo();
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo => (todo.id === id ? { ...todo, isDone: !todo.isDone } : todo))
    )
  }

  const removeTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }
  
  const updateTodoText = (id: string, text: string) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, text } : todo)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    onSubmit({ title, content, category, tags, todos })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
          </div>

          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor={`${formId}-title`} className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                id={`${formId}-title`}
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor={`${formId}-category`} className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                id={`${formId}-category`}
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(MEMO_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* 내용 또는 할 일 목록 */}
            {category === 'todo' ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">할 일 목록</label>
                <div className="space-y-2">
                  {todos.map((todo, index) => (
                    <div key={todo.id} className="flex items-center gap-2 group">
                      <input type="checkbox" checked={todo.isDone} onChange={() => toggleTodo(todo.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                      <input type="text" value={todo.text} onChange={(e) => updateTodoText(todo.id, e.target.value)} className="flex-1 px-2 py-1 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 group-hover:bg-white"/>
                      <button type="button" onClick={() => removeTodo(todo.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={e => setNewTodoText(e.target.value)}
                    onKeyDown={handleTodoKeyDown}
                    placeholder="새 할 일 추가 (Enter)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button type="button" onClick={handleAddTodo} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">추가</button>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor={`${formId}-content`} className="block text-sm font-medium text-gray-700 mb-1">내용 (Markdown 지원)</label>
                <textarea
                  id={`${formId}-content`}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* 태그 */}
            <div>
              <label htmlFor={`${formId}-tags`} className="block text-sm font-medium text-gray-700 mb-1">태그 (Enter로 추가)</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md">
                {tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800">×</button>
                  </div>
                ))}
                <input
                  id={`${formId}-tags`}
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? "태그 추가..." : ""}
                  className="flex-1 min-w-[100px] bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">{editingMemo ? '업데이트' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
