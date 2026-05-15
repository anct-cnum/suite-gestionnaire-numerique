import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import departementsJson from '../../../../../../ressources/departements.json'
import regionsJson from '../../../../../../ressources/regions.json'
import RapportsForm from '@/components/Rapports/RapportsForm'
import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Rapports de situation de l’inclusion numérique',
}

export default async function RapportsController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(await getSessionSub())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif')) {
    redirect('/tableau-de-bord')
  }

  const regions = [...regionsJson].sort((regionA, regionB) => regionA.nom.localeCompare(regionB.nom, 'fr'))
  const departements = [...departementsJson]
    .map((departement) => ({ code: departement.code, nom: departement.nom }))
    .sort((departementA, departementB) => departementA.nom.localeCompare(departementB.nom, 'fr'))

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Rapports' }]} />
      <PageTitle>
        <TitleIcon icon="file-text-line" />
        Rapports de situation de l’inclusion numérique
      </PageTitle>
      <RapportsForm departements={departements} regions={regions} />
    </>
  )
}
