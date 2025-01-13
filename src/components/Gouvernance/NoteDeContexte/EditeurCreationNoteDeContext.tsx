'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { MouseEventHandler, ReactElement } from 'react'

import styles from './RichTextFormMenuBar.module.css'

type Props = Readonly<{
  initialContent: string
}>

export default function EditeurCreationNoteDeContext({ initialContent }: Props): ReactElement {
  const editor = useEditor({
    content: initialContent,
    onUpdate: ({ editor }) => {
      console.log(editor.getHTML())
    },
    editorProps: {
      attributes: {
        'aria-label': 'Éditeur de note de contexte',
        class: 'fr-input',
        role: 'textarea',
        style: 'min-height: 400px; resize: vertical;',
      },
    },
    extensions: [StarterKit],
  })

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
      />
    </>
  )
}

function MenuBar({ editor }: { readonly editor: Editor | null }): ReactElement | null {
  if (!editor) {
    return null
  }

  return (
    <div className={styles.menuBar}>
      <MenuButton
        icon="fr-icon-h-1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Titre 1"
      />
      <MenuButton
        icon="fr-icon-h-2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Titre 2"
      />
      <MenuButton
        icon="fr-icon-h-3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        title="Titre 3"
      />
      <div className={styles.separator} />
      <MenuButton
        icon="fr-icon-bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Gras"
      />
      <MenuButton
        icon="fr-icon-italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italique"
      />
      <div className={styles.separator} />
      <MenuButton
        icon="fr-icon-list-ordered"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Liste ordonnée"
      />
      <MenuButton
        icon="fr-icon-list-unordered"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Liste non ordonnée"
      />
      <div className={styles.separator} />
    </div>
  )
}

function MenuButton({
  title,
  icon,
  onClick,
}: {
  readonly title: string
  readonly icon: string
  readonly onClick: MouseEventHandler<HTMLButtonElement>
}): ReactElement {
  return (
    <button
      aria-label={title}
      className={`${icon} ${styles.button} fr-icon--sm`}
      data-testid={`${title}-button`}
      onClick={(event) => {
        event.preventDefault()
        onClick(event)
      }}
      title={title}
      type="button"
    />
  )
}
