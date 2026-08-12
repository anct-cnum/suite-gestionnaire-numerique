import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import LabellisationEtape1 from '@/components/Label/LabellisationEtape1'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureLabelLoader } from '@/gateways/PrismaStructureLabelLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { labellisationEtape1Presenter } from '@/presenters/labellisationPresenter'
import { estLabelConumActif } from '@/use-cases/commands/AttesterLabellisationStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Labelliser ma structure',
}

export default async function LabelController(): Promise<ReactElement> {
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

  const viewModel = labellisationEtape1Presenter(readModel)

  return <LabellisationEtape1 viewModel={viewModel} />
}
