'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  MemoCategory,
  TodoItem,
} from '@/types/memo'
import MarkdownEditor from '@/components/MarkdownEditor'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<MemoFormData, 'profile'>) => void
  editingMemo?: Memo | null
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
}: MemoFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<string | undefined>('')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodoText, setNewTodoText] = useState('')
  const [category, setCategory] = useState<MemoCategory>('personal')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (editingMemo && isOpen) {
      setTitle(editingMemo.title)
      setCategory(editingMemo.category)
      setTags(editingMemo.tags || [])

      if (editingMemo.category === 'todo') {
        setTodos(editingMemo.todos || [])
        setContent('')
      } else {
        setContent(editingMemo.content || '')
        setTodos([])
      }
    } else {
      setTitle('')
      setContent('')
      setCategory('personal')
      setTags([])
      setTodos([])
    }
    setTagInput('')
    setNewTodoText('')
  }, [editingMemo, isOpen])

  const handleAddTodo = () => {
    const text = newTodoText.trim()
    if (text) {
      setTodos([...todos, { id: uuidv4(), text, isDone: false }])
      setNewTodoText('')
    }
  }

  const handleTodoInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTodo()
    }
  }

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    let submissionData: Omit<MemoFormData, 'profile'>

    if (category === 'todo') {
      if (todos.length === 0) {
        alert('하나 이상의 할 일을 추가해주세요.')
        return
      }
      submissionData = { title, category, tags, todos, content: '' }
    } else {
      if (!content || !content.trim()) {
        alert('내용을 입력해주세요.')
        return
      }
      submissionData = { title, content, category, tags, todos: [] }
    }

    onSubmit(submissionData)
    onClose()
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="placeholder-gray-400 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as MemoCategory)}
                className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {Object.entries(MEMO_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {category === 'todo' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">할 일 목록 *</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={e => setNewTodoText(e.target.value)}
                      onKeyDown={handleTodoInputKeyDown}
                      className="placeholder-gray-400 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="새 할 일을 입력하고 Enter"
                    />
                    <button type="button" onClick={handleAddTodo} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                      추가
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {todos.map(todo => (
                      <div key={todo.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <span className="flex-1 text-gray-800 break-all">{todo.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTodo(todo.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                          aria-label="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용 * (마크다운 지원)</label>
                <MarkdownEditor value={content || ''} onChange={setContent} height={300} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                  추가
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-600 hover:text-blue-800">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                취소
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                {editingMemo ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
