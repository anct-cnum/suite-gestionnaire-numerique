'use client'

import { Editor } from '@tiptap/react'
import { ReactElement } from 'react'

import { BoutonDeMenu } from './BoutonDeMenu'
import styles from './RichTextFormMenuBar.module.css'

type BarreDeMenuProps = Readonly<{
  editor: Editor | null
}>

export function BarreDeMenuEditeurDeTexte({ editor }: BarreDeMenuProps): ReactElement | null {
  if (!editor) {
    return null
  }

  function toggleLink(): void {
    if (!editor) {
      return
    }
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }

    // eslint-disable-next-line no-alert
    const url = window.prompt('URL du lien :')

    if (url === null || url === '') {
      return
    }

    const urlToSet = url.startsWith('http') ? url : `https://${url}`

    const URL_PATTERN = /^(https?:\/\/)?([a-z\d-]+\.)+[a-z]{2,}(:\d{1,5})?(\/.*)?$/
    if (!URL_PATTERN.test(urlToSet)) {
      // eslint-disable-next-line no-alert
      alert('URL invalide. Veuillez entrer une URL valide commençant par https://')
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: urlToSet })
      .run()
  }

  return (
    <div className={styles.menuBar}>
      <BoutonDeMenu
        icon="fr-icon-h-1"
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Titre 1"
      />
      <BoutonDeMenu
        icon="fr-icon-h-2"
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Titre 2"
      />
      <BoutonDeMenu
        icon="fr-icon-h-3"
        isActive={editor.isActive('heading', { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        title="Titre 3"
      />
      <div className={styles.separator} />
      <BoutonDeMenu
        icon="fr-icon-bold"
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Gras"
      />
      <BoutonDeMenu
        icon="fr-icon-italic"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italique"
      />
      <div className={styles.separator} />
      <BoutonDeMenu
        icon="fr-icon-list-ordered"
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Liste ordonnée"
      />
      <BoutonDeMenu
        icon="fr-icon-list-unordered"
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Liste non ordonnée"
      />
      <div className={styles.separator} />
      <BoutonDeMenu
        icon="fr-icon-link"
        isActive={editor.isActive('link')}
        onClick={toggleLink}
        title={editor.isActive('link') ? 'Supprimer le lien' : 'Ajouter un lien'}
      />
    </div>
  )
}
