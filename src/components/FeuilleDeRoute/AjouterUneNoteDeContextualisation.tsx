'use client'

import { FormEvent, ReactElement, useState } from 'react'

import FormulaireNoteDeContextualisation from './FormulaireNoteDeContextualisation'
import { useRichTextEditor } from '../shared/RichTextEditor/hooks/useRichTextEditor'
import SubmitButton from '../shared/SubmitButton/SubmitButton'

export default function AjouterUneNoteDeContextualisation({ id,labelId }: Props): ReactElement {
  // const { ajouterOuModifierXXXAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const { contenu, gererLeChangementDeContenu, viderLeContenu } = useRichTextEditor('')

  return (
    <FormulaireNoteDeContextualisation
      contenu={contenu}
      gererLeChangementDeContenu={gererLeChangementDeContenu}
      labelId={labelId}
      texte=""
      validerFormulaire={creerUneNoteDeContextualisation}
    >
      <div className="fr-btns-group fr-mt-2w">
        <SubmitButton
          ariaControls={id}
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
        </SubmitButton>
        {
          contenu.trim() ?
            <button
              className="fr-btn red-button"
              onClick={viderLeContenu}
              type="button"
            >
              Supprimer
            </button>
            : null
        }
      </div>
    </FormulaireNoteDeContextualisation>
  )

  async function creerUneNoteDeContextualisation(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    // const [XXX, XXX] = form.values() as FormDataIterator<string>
    // const messages = await ajouterOuModifierXXXAction({
    //   path: pathname,
    //   XXX,
    //   XXX,
    // })
    // if (messages.includes('OK')) {
    //   Notification('success', { description: 'ajoutée|modifiée', title: 'XXX ' })
    // } else {
    //   Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    // }
    // setIsDrawerOpen(false)
    // S'il faut réinitialiser le formulaire
    // (event.target as HTMLFormElement).reset()
    // setIsDisabled(false)
  }
}

type Props = Readonly<{
  id: string
  labelId: string
}>
