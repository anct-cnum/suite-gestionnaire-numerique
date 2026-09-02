import { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ReactElement } from 'react'

import ClientContext from '@/components/shared/ClientContext'
import DateProvider from '@/components/shared/DateProvider'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import EnTeteVitrine from '@/components/vitrine/EnTeteVitrine/EnTeteVitrine'
import { Roles } from '@/domain/Role'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { createSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'
import config from '@/use-cases/config.json'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Page non trouvée',
}

export default async function NotFound(): Promise<ReactElement> {
  const hostname = (await headers()).get('host') ?? ''
  const isVitrineDomain =
    hostname.startsWith('inclusion-numerique.anct.gouv.fr') &&
    !hostname.startsWith('min.inclusion-numerique.anct.gouv.fr')
  const isVitrineMode = process.env.SITE_MODE === 'vitrine'

  if (isVitrineDomain || isVitrineMode) {
    return <NotFoundVitrine />
  }
  return <NotFoundMin />
}

function NotFoundVitrine(): ReactElement {
  return (
    <>
      <LienEvitement />
      <EnTeteVitrine />
      <main className="fr-container--fluid" id="content">
        <Erreur404 />
      </main>
      <PiedDePage />
    </>
  )
}

async function NotFoundMin(): Promise<ReactElement> {
  const session = await getSession()
  if (session) {
    try {
      const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
      const territoire = await new RecupererTerritoireUtilisateur(new PrismaMembreLoader()).handle(utilisateur)
      const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(utilisateur, territoire)
      return (
        <DateProvider>
          <ClientContext
            roles={Roles}
            sessionUtilisateurViewModel={sessionUtilisateurViewModel}
            utilisateursParPage={config.utilisateursParPage}
          >
            <LienEvitement />
            <EnTete />
            <main className="fr-container--fluid" id="content">
              <Erreur404 />
            </main>
            <PiedDePage />
          </ClientContext>
        </DateProvider>
      )
    } catch {
      // Utilisateur introuvable : affichage sans en-tête
    }
  }
  return (
    <>
      <main className="fr-container--fluid" id="content">
        <Erreur404 />
      </main>
      <PiedDePage />
    </>
  )
}

function Erreur404(): ReactElement {
  return (
    <div className="fr-container fr-pt-8w fr-pb-10w center">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-8 fr-col-md-4">
          <img alt="" className="fr-responsive-img" src="/vitrine/illustration-404.png" />
        </div>
      </div>
      <h1 className="color-blue-france fr-mt-4w fr-mb-2w">Désolé, cette page n’est plus disponible</h1>
      <p className="color-grey fr-text--lg fr-mb-2w">Elle a peut-être été déplacée ou supprimée.</p>
      <Link
        className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-left fr-icon-arrow-left-s-line"
        href="/"
      >
        Retour à l’accueil
      </Link>
    </div>
  )
}
