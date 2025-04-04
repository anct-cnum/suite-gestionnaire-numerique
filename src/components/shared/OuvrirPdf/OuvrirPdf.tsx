import { ReactElement } from 'react'

import DocumentVide from '../DocumentVide/DocumentVide'
import ExternalLink from '../ExternalLink/ExternalLink'
import { isNullishOrEmpty } from '@/shared/lang'

export default function OuvrirPdf({ href, metadonnee, nom }: Props): ReactElement {
  return (
    <div className="fr-grid-row space-between">
      <div>
        <header>
          <h2
            className="fr-h6 color-blue-france fr-mb-0"
            id="document"
          >
            {nom}
          </h2>
          {isNullishOrEmpty(metadonnee) ?
            null :
            <span className="fr-hint-text">
              {metadonnee}
            </span>}
        </header>
        <div className="fr-upload-group" />
        <ExternalLink
          className="fr-btn fr-btn--secondary fr-mt-2w"
          href={href}
          title="Ouvrir le pdf"
        >
          Ouvrir le pdf
        </ExternalLink>
      </div>
      <div>
        <DocumentVide />
      </div>
    </div>
  )
}

type Props = Readonly<{
  href: string
  metadonnee?: string
  nom: string
}>
