'use client'

import { FormEvent, ReactElement, useContext, useId, useRef, useState } from 'react'

import FormulaireFeuilleDeRoute from '../FeuillesDeRoute/FormulaireFeuilleDeRoute'
import { clientContext } from '../shared/ClientContext'
import Drawer from '../shared/Drawer/Drawer'
import { Notification } from '../shared/Notification/Notification'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { LabelValue } from '@/presenters/shared/labels'

export default function ModifierUneFeuilleDeRoute({
  membres,
  nom,
  perimetre,
  perimetres,
  uidFeuilleDeRoute,
  uidGouvernance,
}: Props): ReactElement {
  const { modifierUneFeuilleDeRouteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerModifierUneFeuilleDeRouteId'
  const labelId = useId()
  const drawerRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        aria-controls={drawerId}
        className="fr-btn fr-btn--secondary"
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        title="Modifier la feuille de route"
        type="button"
      >
        Modifier
      </button>
      <Drawer
        boutonFermeture="Fermer le formulaire de modification d’une feuille de route"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
        ref={drawerRef}
      >
        <FormulaireFeuilleDeRoute
          label="Modifier une feuille de route"
          labelId={labelId}
          membres={membres}
          nom={nom}
          perimetreActuel={perimetre}
          perimetres={perimetres}
          validerFormulaire={modifierUneFeuilleDeRoute}
        >
          <SubmitButton isDisabled={isDisabled}>
            {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
          </SubmitButton>
        </FormulaireFeuilleDeRoute>
      </Drawer>
    </>
  )

  async function modifierUneFeuilleDeRoute(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const [nom, membre, perimetre] = form.values() as FormDataIterator<string>
    const messages = await modifierUneFeuilleDeRouteAction({
      nom,
      path: pathname,
      perimetre,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur: membre,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Feuille de route ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    setIsDrawerOpen(false)
    window.dsfr(drawerRef.current).modal.conceal()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  membres: ReadonlyArray<LabelValue>
  nom: string
  perimetre: string
  perimetres: ReadonlyArray<LabelValue>
  uidFeuilleDeRoute: string
  uidGouvernance: string
}>
