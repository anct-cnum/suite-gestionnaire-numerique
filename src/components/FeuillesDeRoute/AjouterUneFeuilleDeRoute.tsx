'use client'

import { FormEvent, ReactElement, useContext, useId, useRef, useState } from 'react'

import FormulaireFeuilleDeRoute from './FormulaireFeuilleDeRoute'
import { clientContext } from '../shared/ClientContext'
import Drawer from '../shared/Drawer/Drawer'
import { Notification } from '../shared/Notification/Notification'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { FeuillesDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function AjouterUneFeuilleDeRoute({
  contratPreexistant,
  membres,
  perimetres,
  uidGouvernance,
}: Props): ReactElement {
  const { ajouterUneFeuilleDeRouteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerAjouterFeuilleDeRouteId'
  const labelId = useId()
  const drawerRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        aria-controls={drawerId}
        className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-add-line"
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        type="button"
      >
        Ajouter une feuille de route
      </button>
      <Drawer
        boutonFermeture="Fermer le formulaire d’ajout d’une feuille de route"
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
          contratPreexistant={contratPreexistant}
          label="Ajouter une feuille de route"
          labelId={labelId}
          membres={membres}
          nom=""
          perimetres={perimetres}
          validerFormulaire={ajouterUneFeuilleDeRoute}
        >
          <SubmitButton isDisabled={isDisabled}>
            {isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
          </SubmitButton>
        </FormulaireFeuilleDeRoute>
      </Drawer>
    </>
  )

  async function ajouterUneFeuilleDeRoute(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const [nom, membre, perimetre, contratPreexistant] = form.values() as FormDataIterator<string>
    const messages = await ajouterUneFeuilleDeRouteAction({
      contratPreexistant,
      nom,
      path: pathname,
      perimetre,
      uidGouvernance,
      uidMembre: membre,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajoutée', title: 'Feuille de route ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    setIsDrawerOpen(false);
    (event.target as HTMLFormElement).reset()
    window.dsfr(drawerRef.current).modal.conceal()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  contratPreexistant: FeuillesDeRouteViewModel['formulaire']['contratPreexistant']
  membres: FeuillesDeRouteViewModel['formulaire']['membres']
  perimetres: FeuillesDeRouteViewModel['formulaire']['perimetres']
  uidGouvernance: string
}>
