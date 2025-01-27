// Stryker disable all
'use client'

import { Link } from '@tiptap/extension-link'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { ReactElement } from 'react'

import { BarreDeMenuEditeurDeTexte } from './MenuBar'

type Props = Readonly<{
  contenu: string
  onChange(content: string): void
}>

// istanbul ignore next @preserve
export default function TextEditor({ contenu, onChange }: Props): ReactElement {

  console.log('===========>contenu', contenu)
  const editor = useEditor({
    content: contenu,
    editorProps: {
      attributes: {
        'aria-label': 'Éditeur de note de contexte',
        class: 'fr-input',
        role: 'textarea',
        style: 'min-height: 380px; resize: vertical;',
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
