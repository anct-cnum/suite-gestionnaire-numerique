'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import AjouterUnCoFinancement from './AjouterUnCoFinancement'
import { FormulaireAction } from './FormulaireAction'
import Drawer from '../shared/Drawer/Drawer'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel } from '@/presenters/actionPresenter'

export default function AjouterUneAction({ action, date, uidFeuilleDeRoute }: Props): ReactElement {
  const { ajouterUneActionAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [cofinancements, setCofinancements] = useState(action.budgetPrevisionnel)
  const { gouvernanceViewModel } = useContext(gouvernanceContext)
  const coporteurs = gouvernanceViewModel.sectionMembres.coporteurs

  return (
    <>
      <title>
        Ajouter une action à la feuille de route
      </title>
      <FormulaireAction
        action={action}
        cofinancements={cofinancements}
        date={date}
        drawerId="ajouter-un-cofinancement"
        label="Ajouter une action à la feuille de route"
        setIsDrawerOpen={setIsDrawerOpen}
        supprimerUnCofinancement={supprimerUnCofinancement}
        validerFormulaire={creerUneAction}

      >
        <SubmitButton
          className="fr-col-11 fr-mb-5w d-block"
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Ajout en cours...' : 'Valider et envoyer'}
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
      >
        <AjouterUnCoFinancement
          coporteurs={coporteurs}
          label="Ajouter un co-financement"
          labelId="ajouter-un-cofinancement-label"
          onSubmit={ajouterCofinancement}
        />
      </Drawer>
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
      budgetPrevisionnel: cofinancements,
      contexte: contexteContenu,
      description: descriptionContenu,
      destinataires: form.getAll('porteurs') as Array<string>,
      feuilleDeRoute: uidFeuilleDeRoute,
      gouvernance : gouvernanceViewModel.uid,
      nom: form.get('nom') as string,
      path: pathname,
      porteurs: form.getAll('beneficiaires') as Array<string>,
    })
    
    if ((messages as Array<string>).includes('OK')) {
      Notification('success', { description: 'ajoutée', title: 'Action ' })
    } else {
      Notification('error', { description: (messages as Array<string>).join(', '), title: 'Erreur : ' })
    }
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }

  function ajouterCofinancement(coFinanceur: string, montant: string): void {
    setCofinancements([...cofinancements, { coFinanceur, montant: `${montant} €` }])
    setIsDrawerOpen(false)
  }

  function supprimerUnCofinancement(index: number): void {
    const filteredCofinancements = cofinancements.filter((_, indexToRemove) => indexToRemove !== index)
    setCofinancements(filteredCofinancements)
  }
}

type Props = Readonly<{
  action: ActionViewModel
  date: Date
  uidFeuilleDeRoute: string
}>
