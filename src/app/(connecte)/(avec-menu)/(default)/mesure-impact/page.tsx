import { Metadata } from 'next'
import { forbidden, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import MesCampagnes from '@/components/mesure-impact/MesCampagnes/MesCampagnes'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { RecupererLesCampagnesDeLaStructure } from '@/use-cases/mesure-impact/RecupererLesCampagnesDeLaStructure'

export const metadata: Metadata = {
  title: 'Mesure d’impact',
}

export default async function MesureImpactController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const campagnes = await new RecupererLesCampagnesDeLaStructure(new PrismaCampagneLoader()).handle({
    structureId: structureDeLaMesureDImpact(utilisateur),
  })
  if (campagnes.length === 0) {
    forbidden()
  }

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Accueil' }, { label: 'Mesure d’impact' }]} />
      <MesCampagnes campagnes={campagnes} />
    </>
  )
}
