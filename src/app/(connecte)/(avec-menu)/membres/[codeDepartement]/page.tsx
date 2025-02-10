import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MesMembres from '@/components/MesMembres/MesMembres'
import { mesMembresPresenter } from '@/presenters/mesMembresPresenter'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (!codeDepartement) {
    notFound()
  }

  const mesMembresReadModel = {
    candidats: [
      {
        adresse: '172 B RTE DE LENS 62223 SAINTE-CATHERINE',
        contactReferent: {
          email: 'eric.dupont@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Eric',
        },
        nom: 'Croix Rouge Française',
        roles: [],
        siret: '79227291600034',
        suppressionDuMembreAutorise: false,
        typologie: 'Association',
        uidMembre: 'structure-79227291600034',
      },
    ],
    membres: [],
    roles: [],
    suggeres: [
      {
        adresse: '17 avenue de l’opéra 75000 Paris',
        contactReferent: {
          email: 'eric.durant@example.com',
          fonction: 'Directeur',
          nom: 'Durant',
          prenom: 'Eric',
        },
        nom: 'La Poste',
        roles: [],
        siret: '99229991601034',
        suppressionDuMembreAutorise: false,
        typologie: 'EPCI',
        uidMembre: 'structure-99229991601034',
      },
    ],
    uidGouvernance: 'gouvernanceFooId',
  }

  // const mesMembresReadModel =
  //   await new RecupererMesMembres(new PrismaMesMembresLoader(prisma.membreRecord))
  //     .handle({ codeDepartement })
  const mesMembresViewModel = mesMembresPresenter(mesMembresReadModel)

  return (
    <MesMembres mesMembresViewModel={mesMembresViewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
