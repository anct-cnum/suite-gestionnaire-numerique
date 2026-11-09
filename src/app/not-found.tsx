import { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ReactElement } from 'react'

import Dsfr from '@/app/Dsfr'
import ClientContext from '@/components/shared/ClientContext'
import DateProvider from '@/components/shared/DateProvider'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement, { menuPrincipalVitrine } from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import EnTeteVitrine from '@/components/vitrine/EnTeteVitrine/EnTeteVitrine'
import { Roles } from '@/domain/Role'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { createSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'
import { estSiteVitrine } from '@/shared/estSiteVitrine'
import config from '@/use-cases/config.json'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export async function generateMetadata(): Promise<Metadata> {
  return metadataPageNonTrouvee((await headers()).get('host') ?? '')
}

export function metadataPageNonTrouvee(hostname: string): Metadata {
  return {
    title: estSiteVitrine(hostname) ? 'Page non trouvée - Inclusion Numérique' : 'Page non trouvée',
  }
}

export default async function NotFound(): Promise<ReactElement> {
  const hostname = (await headers()).get('host') ?? ''

  if (estSiteVitrine(hostname)) {
    return <NotFoundVitrine />
  }
  return <NotFoundMin />
}

function NotFoundVitrine(): ReactElement {
  return (
    <>
      <LienEvitement menu={menuPrincipalVitrine} />
      <EnTeteVitrine />
      <main className="fr-container--fluid" id="content">
        <Erreur404 />
      </main>
      <PiedDePage vitrine />
      <Dsfr />
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
            <Dsfr />
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
      <Dsfr />
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
