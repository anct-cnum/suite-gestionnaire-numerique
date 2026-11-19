import Link from 'next/link'
import { ReactElement } from 'react'

import DocumentVide from '../../shared/DocumentVide/DocumentVide'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

/**
 * Document déposé par le territoire, proposé en téléchargement sur la vitrine (RGAA 13.3) :
 * format et poids sur le lien, source du document et réserve sur son accessibilité.
 * OuvrirPdf reste réservé à l'espace connecté (boutons Modifier et Supprimer).
 */
export default function DocumentFeuilleDeRouteVitrine({ nomFeuilleDeRoute, pieceJointe }: Props): ReactElement {
  return (
    // Pas de zone nommée : le bloc est déjà dans la zone de sa feuille de route, et deux zones
    // « Document de la feuille de route » sur une même page ne seraient pas distinguables
    <div className="fr-mb-4w grey-border border-radius fr-p-2w fr-p-md-4w fr-mt-3w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md">
          <h3 className="fr-h6 color-blue-france fr-mb-1v">Document de la feuille de route</h3>
          <p className="fr-hint-text fr-mb-2w">{pieceJointe.source}</p>
          <p className="fr-mb-2w">
            <a className="fr-link fr-link--download" download href={pieceJointe.href}>
              {`Télécharger la feuille de route « ${nomFeuilleDeRoute} »`}
              <span className="fr-link__detail">{pieceJointe.detail}</span>
            </a>
          </p>
          <div className="fr-highlight fr-ml-0 fr-mb-0">
            <p className="fr-text--sm fr-mb-0">
              L’accessibilité de ce document, rédigé par le territoire, n’est pas garantie.{' '}
              <DemandeDeVersionAccessible />
            </p>
          </div>
        </div>
        <div className="fr-col-md-2 fr-hidden fr-unhidden-md">
          <DocumentVide />
        </div>
      </div>
    </div>
  )
}

/**
 * PROVISOIRE (#2255) : le contact pour demander une version accessible n'est pas encore tranché par l'équipe produit.
 * En attendant, on renvoie vers la déclaration d'accessibilité, qui donne le contact. Seul endroit à modifier.
 */
function DemandeDeVersionAccessible(): ReactElement {
  return (
    <>
      Pour en obtenir une version accessible, utilisez le contact indiqué dans la{' '}
      <Link href="/accessibilite">déclaration d’accessibilité</Link>.
    </>
  )
}

type Props = Readonly<{
  nomFeuilleDeRoute: string
  pieceJointe: NonNullable<FeuilleDeRouteViewModel['pieceJointe']>
}>
