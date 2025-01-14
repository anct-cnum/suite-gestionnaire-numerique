'use client'

import { Link } from '@tiptap/extension-link'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { ReactElement } from 'react'

import { BarreDeMenuEditeurDeTexte } from './BarreDeMenuEditeurDeTexte'

type Props = Readonly<{
  initialContent: string
  onChange(content: string): void
}>

export default function EditeurDeTexte({ initialContent, onChange }: Props): ReactElement {
  const editor = useEditor({
    content: initialContent,
    editorProps: {
      attributes: {
        'aria-label': 'Éditeur de note de contexte',
        class: 'fr-input',
        role: 'textarea',
        style: 'min-height: 400px; resize: vertical;',
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
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <>
      <BarreDeMenuEditeurDeTexte editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
