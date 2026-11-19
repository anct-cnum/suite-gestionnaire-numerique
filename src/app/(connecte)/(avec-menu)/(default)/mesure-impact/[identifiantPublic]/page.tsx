import { Metadata } from 'next'
import { forbidden, notFound, redirect } from 'next/navigation'
import { toDataURL } from 'qrcode'
import { ReactElement } from 'react'

import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import VotreCampagne from '@/components/mesure-impact/VotreCampagne/VotreCampagne'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { PrismaReponseLoader } from '@/gateways/mesure-impact/PrismaReponseLoader'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { votreCampagnePresenter } from '@/presenters/mesure-impact/votreCampagnePresenter'
import { adresseDuQuestionnaire } from '@/shared/adresseDuQuestionnaire'
import { RecupererVotreCampagne } from '@/use-cases/mesure-impact/RecupererVotreCampagne'

export const metadata: Metadata = {
  title: 'Votre campagne – Mesure d’impact',
}

export default async function VotreCampagneController({ params }: Props): Promise<ReactElement> {
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

  const adresse = adresseDuQuestionnaire(process.env.NEXT_PUBLIC_HOST ?? '', identifiantPublic)
  const qrCode = await toDataURL(adresse, { errorCorrectionLevel: 'M', margin: 2, width: 512 })
  const viewModel = votreCampagnePresenter(campagne, { adresseDuQuestionnaire: adresse, qrCode })

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Accueil' },
          { href: '/mesure-impact', label: 'Mesure d’impact' },
          { label: viewModel.titreFilAriane },
        ]}
      />
      <VotreCampagne viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<{ identifiantPublic: string }>
}>
