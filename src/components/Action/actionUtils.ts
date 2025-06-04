import { redirect } from 'next/navigation'
import { FormEvent } from 'react'

import { Notification } from '@/components/shared/Notification/Notification'
import { DemandeDeSubvention } from '@/presenters/actionPresenter'
import { feuilleDeRouteLink } from '@/presenters/shared/link'

export function handleActionSubmit(
  event: FormEvent<HTMLFormElement>,
  contexteContenu: string,
  descriptionContenu: string,
  coFinancements: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>,
  demandeDeSubvention: DemandeDeSubvention | undefined,
  form: FormData,
  baseData: ActionBaseData,
  uid?: string
): ActionData | ActionDataWithUid {
  event.preventDefault()
  
  const data: ActionData = {
    anneeDeDebut: form.get('anneeDeDebut') as string,
    anneeDeFin: form.get('anneeDeFin') as string,
    besoins: form.getAll('besoins') as Array<string>,
    budgetGlobal: Number(form.get('budgetGlobal')),
    coFinancements,
    contexte: contexteContenu,
    demandeDeSubvention,
    description: descriptionContenu,
    destinataires: form.getAll('beneficiaires') as Array<string>,
    feuilleDeRoute: baseData.feuilleDeRoute,
    gouvernance: baseData.gouvernance,
    nom: form.get('nom') as string,
    path: baseData.path,
    porteurs: form.getAll('porteurs') as Array<string>,
    
  }

  if(uid !== undefined) {
    return { ...data, uid }
  }
  return data
}

export function handleActionResponse(
  messages: ActionResult,
  gouvernanceUid: string,
  uidFeuilleDeRoute: string,
  isModification: boolean
): void {
  const isOk = Array.isArray(messages) ? messages.includes('OK') : messages === 'OK'
  if (isOk) {
    Notification('success', { 
      description: isModification ? 'modifiée' : 'ajoutée', 
      title: 'Action ', 
    })
    redirect(feuilleDeRouteLink(gouvernanceUid, uidFeuilleDeRoute))
  } else {
    const errorMessage = Array.isArray(messages) ? messages.join(', ') : String(messages)
    Notification('error', { 
      description: errorMessage, 
      title: 'Erreur : ', 
    })
  }
}

export type ActionDataWithUid = { uid: string } & ActionData

type ActionData = {
  anneeDeDebut: string
  anneeDeFin: string
  besoins: ReadonlyArray<string>
  budgetGlobal: number
  coFinancements: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  contexte: string
  demandeDeSubvention: DemandeDeSubvention | undefined
  description: string
  destinataires: ReadonlyArray<string>
  feuilleDeRoute: string
  gouvernance: string
  nom: string
  path: string
  porteurs: ReadonlyArray<string>
  uid?: string
}

type ActionResult = ReadonlyArray<string> | string

type ActionBaseData = {
  feuilleDeRoute: string
  gouvernance: string
  path: string
} 