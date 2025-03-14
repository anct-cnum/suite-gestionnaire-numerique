'use client'

import { FormEvent, ReactElement, useContext, useId, useState } from 'react'

import FormulaireNoteDeContextualisation from './FormulaireNoteDeContextualisation'
import { clientContext } from '../shared/ClientContext'
import Drawer from '../shared/Drawer/Drawer'
import { Notification } from '../shared/Notification/Notification'
import { useRichTextEditor } from '../shared/RichTextEditor/hooks/useRichTextEditor'
import SubmitButton from '../shared/SubmitButton/SubmitButton'

export default function ModifierUneNoteDeContextualisation({ contextualisation }: Props): ReactElement {
  const {
    modifierUneNoteDeContextualisationAction,
    supprimerUneNoteDeContextualisationAction,
    pathname,
  } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { contenu, gererLeChangementDeContenu, viderLeContenu } = useRichTextEditor(contextualisation)
  const drawerId = 'drawerModifierNoteDeContextualisationId'
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
        title="Modifier la contextualisation"
        type="button"
      >
        Modifier
      </button>
      <Drawer
        boutonFermeture="Fermer le formulaire de modification d‘une note de contextualisation"
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
          validerFormulaire={modifierUneNoteDeContextualisation}
        >
          <div className="fr-btns-group fr-mt-2w">
            <SubmitButton
              ariaControls={drawerId}
              isDisabled={isDisabled}
            >
              {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
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

  async function modifierUneNoteDeContextualisation(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    if (contenu === '') {
      const messages = await supprimerUneNoteDeContextualisationAction({ path: pathname })
      if (messages.includes('OK')) {
        Notification('success', { description: 'supprimée', title: 'Note de contextualisation ' })
        setIsDrawerOpen(false)
      } else {
        Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
      }
      setIsDisabled(false)
      return
    }
    const messages = await modifierUneNoteDeContextualisationAction({ contenu, path: pathname })
    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Note de contextualisation ' })
      setIsDrawerOpen(false)
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    setIsDisabled(false)
  }
}

type Props = {
  readonly contextualisation: string
}
