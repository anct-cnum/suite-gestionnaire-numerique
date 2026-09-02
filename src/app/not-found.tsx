import { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ReactElement } from 'react'

import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import PageTitle from '@/components/shared/PageTitle/PageTitle'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import EnTeteVitrine from '@/components/vitrine/EnTeteVitrine/EnTeteVitrine'

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
      </main>
      <PiedDePage />
    </>
  )
}

function NotFoundMin(): ReactElement {
  return (
    <div className="fr-container">
      <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
        <div className="fr-py-0 fr-col-12 fr-col-md-6">
          <PageTitle>Page non trouvée</PageTitle>
          <p className="fr-text--sm fr-mb-3w">Erreur 404</p>
          <p className="fr-text--lead fr-mb-3w">
            La page que vous cherchez est introuvable. Excusez-nous pour la gène occasionnée.
          </p>
          <p className="fr-text--sm fr-mb-5w">
            Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est correcte. La page n’est peut-être
            plus disponible.
            <br />
            Dans ce cas, pour continuer votre visite vous pouvez consulter notre page d’accueil, ou effectuer une
            recherche avec notre moteur de recherche en haut de page.
            <br />
            Sinon contactez-nous pour que l’on puisse vous rediriger vers la bonne information.
          </p>
          <ul className="fr-btns-group fr-btns-group--inline-md">
            <li>
              <Link className="fr-btn" href="/tableau-de-bord">
                Page d’accueil
              </Link>
            </li>
            <li>
              <ExternalLink
                className="fr-btn fr-btn--secondary"
                href="https://aide.conseiller-numerique.gouv.fr/fr/"
                title="Contactez-nous"
              >
                Contactez-nous
              </ExternalLink>
            </li>
          </ul>
        </div>
        <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
          <svg
            aria-hidden="true"
            className="fr-responsive-img fr-artwork"
            height="200"
            viewBox="0 0 160 200"
            width="160"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use className="fr-artwork-motif" href={`${process.env.NEXT_PUBLIC_HOST}/pictos/ovoid.svg#artwork-motif`} />
            <use
              className="fr-artwork-background"
              href={`${process.env.NEXT_PUBLIC_HOST}/pictos/ovoid.svg#artwork-background`}
            />
            <g transform="translate(40, 60)">
              <use
                className="fr-artwork-decorative"
                href={`${process.env.NEXT_PUBLIC_HOST}/pictos/technical-error.svg#artwork-decorative`}
              />
              <use
                className="fr-artwork-minor"
                href={`${process.env.NEXT_PUBLIC_HOST}/pictos/technical-error.svg#artwork-minor`}
              />
              <use
                className="fr-artwork-major"
                href={`${process.env.NEXT_PUBLIC_HOST}/pictos/technical-error.svg#artwork-major`}
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
