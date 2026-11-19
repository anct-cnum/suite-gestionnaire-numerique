import { Metadata } from 'next'
import { forbidden, notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import SaisieManuelle from '@/components/mesure-impact/SaisieManuelle/SaisieManuelle'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { PrismaReponseLoader } from '@/gateways/mesure-impact/PrismaReponseLoader'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { RecupererVotreCampagne } from '@/use-cases/mesure-impact/RecupererVotreCampagne'

// Pas de titre ici : chaque écran de la saisie donne le sien
export const metadata: Metadata = {}

export default async function SaisieManuelleController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const { identifiantPublic } = await params
  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const campagne = await new RecupererVotreCampagne(
    new PrismaCampagneLoader(),
    new PrismaReponseLoader(),
    new Date()
  ).handle({ identifiantPublic, structureId: structureDeLaMesureDImpact(utilisateur) })
  if (campagne === null) {
    notFound()
  }
  if (campagne === 'accesRefuse') {
    forbidden()
  }

  return (
    <div className="fr-container fr-my-4w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
          <SaisieManuelle
            viewModel={{
              identifiantPublic,
              lienCampagne: `/mesure-impact/${identifiantPublic}`,
              questionnaireVersion: campagne.questionnaireVersion,
            }}
          />
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  params: Promise<{ identifiantPublic: string }>
}>
