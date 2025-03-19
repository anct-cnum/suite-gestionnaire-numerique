'use client'

import { FormEvent, ReactElement, useContext, useId, useState } from 'react'

import FormulaireNoteDeContextualisation from './FormulaireNoteDeContextualisation'
import { clientContext } from '../shared/ClientContext'
import Drawer from '../shared/Drawer/Drawer'
import { Notification } from '../shared/Notification/Notification'
import { useRichTextEditor } from '../shared/RichTextEditor/hooks/useRichTextEditor'
import SubmitButton from '../shared/SubmitButton/SubmitButton'

export default function AjouterUneNoteDeContextualisation(): ReactElement {
  const { ajouterUneNoteDeContextualisationAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { contenu, gererLeChangementDeContenu, viderLeContenu } = useRichTextEditor('')
  const drawerId = 'drawerAjouterNoteDeContextualisationId'
  const labelId = useId()

  return (
    <>
      <button
        aria-controls={drawerId}
        className="fr-btn fr-btn--secondary"
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        title="Ajouter la contextualisation"
        type="button"
      >
        Ajouter
      </button>
      <Drawer
        boutonFermeture="Fermer le formulaire de création d‘une note de contextualisation"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <FormulaireNoteDeContextualisation
          contenu={contenu}
          gererLeChangementDeContenu={gererLeChangementDeContenu}
          labelId={labelId}
          validerFormulaire={creerUneNoteDeContextualisation}
        >
          <div className="fr-btns-group fr-mt-2w">
            <SubmitButton
              ariaControls={drawerId}
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
      </Drawer>
    </>
  )

  async function creerUneNoteDeContextualisation(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)
    const messages = await ajouterUneNoteDeContextualisationAction({ contenu, path: pathname })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajoutée', title: 'Note de contextualisation ' })
      setIsDrawerOpen(false)
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    setIsDisabled(false)
  }
}
