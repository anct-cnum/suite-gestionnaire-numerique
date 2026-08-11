import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement, Suspense } from 'react'
import { ToastContainer } from 'react-toastify'

import EnTeteLabel from '@/components/Label/EnTeteLabel'
import DateProvider from '@/components/shared/DateProvider'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion-label')
  }
  let utilisateur: UnUtilisateurReadModel
  try {
    utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  } catch {
    redirect('/api/auth/signout?callbackUrl=/connexion-label')
  }

  // Parcours réservé au gestionnaire bêta-testeur d'une structure éligible au label.
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('gestionnaire_structure') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }
  const estEligible = await new PrismaEligibiliteLabelConumLoader().estEligible(contexte.idStructure())
  if (!estEligible) {
    redirect('/tableau-de-bord')
  }

  return (
    <DateProvider>
      <LienEvitement />
      <ToastContainer aria-label="Notifications" style={{ width: '30rem' }} />
      <EnTeteLabel />
      <main className="fr-container--fluid fr-mx-5w" id="content">
        <Suspense fallback={<SpinnerSimple text="Chargement..." />}>{children}</Suspense>
      </main>
      <PiedDePage />
    </DateProvider>
  )
}
