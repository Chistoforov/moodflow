'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center" style={{ color: '#8B3A3A' }}>
      Загрузка редактора...
    </div>
  ),
})

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-[300px] flex items-center justify-center" style={{ color: '#8B3A3A' }}>
        Загрузка редактора...
      </div>
    )
  }

  return (
    <div className="quill-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        }}
        style={{ minHeight: '300px', backgroundColor: '#FFFFFF' }}
      />
    </div>
  )
}

