'use client'

import { useState, useEffect } from 'react'

import type { Editor } from '@tiptap/react'

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
    setEditeur((evenement as EditorReadyEvent).detail as Editor)
  }

  function viderLeContenu(): void {
    setContenu('')
    if (editeur) {
      editeur.commands.clearContent(true)
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

type EditorReadyEvent = {
  detail: Editor
} & CustomEvent
