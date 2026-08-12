import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import LabellisationEtape2 from '@/components/Label/LabellisationEtape2'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureLabelLoader } from '@/gateways/PrismaStructureLabelLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { labellisationEtape2Presenter } from '@/presenters/labellisationPresenter'
import { estLabelConumActif } from '@/use-cases/commands/AttesterLabellisationStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Attestation sur l’honneur',
}

export default async function AttestationController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion-label')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  const readModel = await new PrismaStructureLabelLoader().get(contexte.idStructure())

  // Une structure déjà labellisée ne peut pas refaire la démarche tant que son label est actif.
  if (estLabelConumActif(readModel.derniereAttestation, new Date())) {
    redirect('/tableau-de-bord')
  }

  // L'étape 2 requiert au moins un contact renseigné à l'étape 1.
  if (readModel.contacts.length === 0) {
    redirect('/label')
  }

  const viewModel = labellisationEtape2Presenter(readModel)

  return <LabellisationEtape2 viewModel={viewModel} />
}
