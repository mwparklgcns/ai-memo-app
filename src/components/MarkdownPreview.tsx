'use client'

import dynamic from 'next/dynamic'

const MDPreview = dynamic(
  () =>
    import('@uiw/react-md-editor').then(mod => ({
      default: mod.default.Markdown,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-100 rounded h-6 w-full" />
    ),
  }
)

interface MarkdownPreviewProps {
  source: string
  className?: string
}

export default function MarkdownPreview({
  source,
  className,
}: MarkdownPreviewProps) {
  return (
    <div data-color-mode="light" className={className}>
      <MDPreview source={source} />
    </div>
  )
}
