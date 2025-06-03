'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import Drawer from '../shared/Drawer/Drawer'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'
import { isOk } from '@/shared/lang'

export default function ModifierUneAction({ action }: Props): ReactElement {
  const { modifierUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [demandeDeSubvention, setDemandeDeSubvention] = useState(action.demandeDeSubvention)

  return (
    <>
      <title>
        {`Modifier l'action ${action.nom}`}
      </title>
      <FormulaireAction
        action={action}
        ajouterDemandeDeSubvention={ajouterDemandeDeSubvention}
        demandeDeSubvention={demandeDeSubvention}
        label="Modifier une action"
        validerFormulaire={modifierAction}
      >
        <SubmitButton
          className="fr-col-11 fr-mb-5w d-block"
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Modification en cours...' : 'Valider et envoyer'}
        </SubmitButton>
      </FormulaireAction>
      <Drawer
        boutonFermeture="Fermer"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id="ajouter-un-cofinancement"
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId="ajouter-un-cofinancement-label"
      />
    </>
  )

  async function modifierAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string,
    coFinancements : Array<{
      coFinanceur: string
      montant: string
    }>
  ): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    console.log('BLUUUUUUUUUUUUUUUUUUUuu')
    const form = new FormData(event.currentTarget)
    console.log(form.getAll('besoins'))
    const result = await modifierUneActionAction({
      anneeDeDebut: form.get('anneeDeDebut') as string,
      anneeDeFin: form.get('anneeDeFin') as string,
      besoins: form.getAll('besoins') as Array<string>,
      budgetGlobal: Number(form.get('budgetGlobal')),
      contexte: contexteContenu,
      description: descriptionContenu,
      feuilleDeRoute: action.urlFeuilleDeRoute.split('/').pop() ?? '',
      gouvernance: action.urlGestionMembresGouvernance.split('/').pop() ?? '',
      nom: form.get('nom') as string,
      path: window.location.pathname,
      porteurs: action.porteurs.map((porteur) => porteur.id),
      uid: action.uid,
    })
    if (isOk(result)) {
      Notification('success', { description: 'modifiée', title: 'Action ' })
    } else {
      const errorMessage = (result as ReadonlyArray<string>).join(', ')
      Notification('error', { description: errorMessage, title: 'Erreur : ' })
    }
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }

  function ajouterDemandeDeSubvention(demandeDeSubvention: DemandeDeSubvention): void {
    setDemandeDeSubvention(demandeDeSubvention)
  }
}

type Props = Readonly<{
  action: ActionViewModel
}>
