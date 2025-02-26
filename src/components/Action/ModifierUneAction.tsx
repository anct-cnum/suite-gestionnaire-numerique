'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import AjouterUnCoFinancement from './AjouterUnCoFinancement'
import { FormulaireAction } from './FormulaireAction'
import Drawer from '../shared/Drawer/Drawer'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function ModifierUneAction({ action, coporteurs }: Props): ReactElement {
  const { modifierUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [cofinancements, setCofinancements] = useState(action.budgetPrevisionnel)

  return (
    <>
      <FormulaireAction
        action={action}
        cofinancements={cofinancements}
        drawerId="ajouter-un-cofinancement"
        label="Modifier une action"
        setIsDrawerOpen={setIsDrawerOpen}
        supprimerUnCofinancement={supprimerUnCofinancement}
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

  async function modifierAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string
  ): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const messages = await modifierUneActionAction({
      anneeDeDebut: form.get('anneeDeDebut') as string,
      anneeDeFin: form.get('anneeDeFin') as string,
      budgetGlobal: Number(form.get('budgetGlobal')),
      contexte: contexteContenu,
      description: descriptionContenu,
      destinataires: [],
      nom: form.get('nom') as string,
      porteur: '',
      temporalite: form.get('radio-pluriannuelle') as string,
      uid: '',
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Action ' })
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
  function ajouterCofinancement(coFinanceur: string, montant: string): void {
    setCofinancements([...cofinancements, { coFinanceur, montant: `${montant} €` }])
    setIsDrawerOpen(false)
  }

  function supprimerUnCofinancement(index: number): void {
    const filteredCofinancements = cofinancements.filter((_, indexValue) => indexValue !== index)
    setCofinancements(filteredCofinancements)
  }
}

type Props = Readonly<{
  action: ActionViewModel
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
}>
