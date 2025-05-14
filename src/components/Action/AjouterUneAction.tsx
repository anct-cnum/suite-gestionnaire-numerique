'use client'

import { redirect } from 'next/navigation'
import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'
import { feuilleDeRouteLink } from '@/presenters/shared/link'

export default function AjouterUneAction({ action, date, uidFeuilleDeRoute }: Props): ReactElement {
  const { ajouterUneActionAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const [demandeDeSubvention, setDemandeDeSubvention] = useState(action.demandeDeSubvention)
  const { gouvernanceViewModel } = useContext(gouvernanceContext)

  return (
    <>
      <title>
        Ajouter une action à la feuille de route
      </title>
      <FormulaireAction
        action={action}
        ajouterDemandeDeSubvention={ajouterDemandeDeSubvention}
        date={date}
        demandeDeSubvention={demandeDeSubvention}
        label="Ajouter une action à la feuille de route"
        supprimerUneDemandeDeSubvention={supprimerDemandeDeSubvention}
        validerFormulaire={creerUneAction}
      >
        <SubmitButton
          className="fr-col-11 fr-mb-5w d-block"
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Ajout en cours...' : 'Valider et envoyer'}
        </SubmitButton>
      </FormulaireAction>
    </>
  )

  async function creerUneAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string
  ): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const messages = await ajouterUneActionAction({
      anneeDeDebut: form.get('anneeDeDebut') as string,
      anneeDeFin: form.get('anneeDeFin') as string,
      besoins: form.getAll('besoins') as Array<string>,
      budgetGlobal: Number(form.get('budgetGlobal')),
      budgetPrevisionnel: [{ coFinanceur: '', montant: '0' }],
      contexte: contexteContenu,
      demandeDeSubvention,
      description: descriptionContenu,
      destinataires: form.getAll('porteurs') as Array<string>,
      feuilleDeRoute: uidFeuilleDeRoute,
      gouvernance : gouvernanceViewModel.uid,
      nom: form.get('nom') as string,
      path: pathname,
      porteurs: form.getAll('beneficiaires') as Array<string>,
    })
    setIsDisabled(false)
    
    const isOk = (messages as Array<string>).includes('OK')
    if (isOk) {
      Notification('success', { description: 'ajoutée', title: 'Action ' })
      redirect(feuilleDeRouteLink(gouvernanceViewModel.uid, uidFeuilleDeRoute))
    } else {
      Notification('error', { description: (messages as Array<string>).join(', '), title: 'Erreur : ' })
    }
    setIsDisabled(false)
  }

  function ajouterDemandeDeSubvention(demandeDeSubvention: DemandeDeSubvention): void {
    setDemandeDeSubvention(demandeDeSubvention)
  }

  function supprimerDemandeDeSubvention(): void {
    setDemandeDeSubvention(undefined)
  }
}

type Props = Readonly<{
  action: ActionViewModel
  date: Date
  uidFeuilleDeRoute: string
}>
