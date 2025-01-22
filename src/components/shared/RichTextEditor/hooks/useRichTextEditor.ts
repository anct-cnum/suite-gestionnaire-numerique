'use client'

import { useState, useEffect } from 'react'

import type { Editor } from '@tiptap/react'

interface EditorReadyEvent extends CustomEvent {
  detail: Editor
}
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
    setEditeur(evenementPersonnalise.detail)
  }

  function viderLeContenu(): void {
    setContenu('')
    if (editeur) {
      editeur.commands.setContent('')
    }
  }

  useEffect((): () => void => {
    window.addEventListener('editorReady', gererEditeurPret)

    return (): void => {
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
