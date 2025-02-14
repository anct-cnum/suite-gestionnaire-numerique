'use client'

import { useState, useEffect } from 'react'

import type { Editor } from '@tiptap/react'

type EditorReadyEvent = {
  detail: Editor
} & CustomEvent
// istanbul ignore next @preserve
export function useRichTextEditor(contenuInitial = ''): {
  contenu: string
  editeur: Editor | null
  gererLeChangementDeContenu(nouveauContenu: string): void
  viderLeContenu(): void
} {
  const [contenu, setContenu] = useState(contenuInitial)
  const [editeur, setEditeur] = useState<Editor | null>(null)

  function gererLeChangementDeContenu(nouveauContenu: string): void {
    setContenu(nouveauContenu)
  }

  function gererEditeurPret(evenement: Event): void {
    const evenementPersonnalise = evenement as EditorReadyEvent
    setEditeur(evenementPersonnalise.detail as Editor)
  }

  function viderLeContenu(): void {
    setContenu('')
    if (editeur) {
      editeur.commands.setContent('')
    }
  }

  useEffect((): () => void => {
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('editorReady', gererEditeurPret)

    return (): void => {
      // eslint-disable-next-line no-restricted-syntax
      window.removeEventListener('editorReady', gererEditeurPret)
    }
  }, [])

  return {
    contenu,
    editeur,
    gererLeChangementDeContenu,
    viderLeContenu,
  }
}
