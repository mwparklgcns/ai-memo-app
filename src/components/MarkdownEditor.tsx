'use client'

import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <span className="text-gray-400">에디터 로딩 중...</span>
    </div>
  ),
})

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 300,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={val => onChange(val || '')}
        preview="live"
        height={height}
        visibleDragbar={true}
      />
    </div>
  )
}
