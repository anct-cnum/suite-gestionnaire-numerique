'use client'

import { Link } from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { ReactElement } from 'react'

import { BarreDeMenuEditeurDeTexte } from './MenuBar'

export default function TextEditor({ ariaLabel, contenu, height, onChange }: Props): ReactElement {
  const editor = useEditor({
    content: contenu,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        class: 'fr-input',
        role: 'textarea',
        style: `min-height: ${height}px; resize: vertical;`,
      },
    },
    extensions: [
      StarterKit,
      Link.configure({
        defaultProtocol: 'https',
        openOnClick: true,
        protocols: ['https'],
      }),
    ],
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      window.dispatchEvent(new CustomEvent('editorReady', { detail: editor }))
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const isEmptyContent = content === '<p></p>'
      onChange(isEmptyContent ? '' : content)
    },
  })

  return (
    <>
      <BarreDeMenuEditeurDeTexte editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}

type Props = Readonly<{
  ariaLabel: string
  contenu: string
  height: number
  onChange(content: string): void
}>
