import { ReactElement } from 'react'

import styles from './OuvrirPdf.module.css'
import DocumentVide from '../DocumentVide/DocumentVide'
import ExternalLink from '../ExternalLink/ExternalLink'
import Icon from '../Icon/Icon'
import { isNullishOrEmpty } from '@/shared/lang'

export default function OuvrirPdf({ href, metadonnee, nom, onDelete }: Props): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header>
          <h2
            className={`fr-h6 color-blue-france fr-mb-0 ${styles.fileName}`}
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
        <ul className="fr-btns-group fr-btns-group--inline-sm fr-mt-2w">
          <li>
            <ExternalLink
              className="fr-btn fr-btn--secondary"
              href={href}
              title="Ouvrir le pdf"
            >
              Ouvrir le pdf
            </ExternalLink>
          </li>
          {
            onDelete ?
              <li>
                <button
                  className="fr-btn fr-btn--tertiary color-red fr-ml-0"
                  onClick={onDelete}
                  title={`Supprimer ${nom}`}
                  type="button"
                >
                  <Icon icon="delete-line" />
                </button>
              </li>
              : null
          }
        </ul>
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
  onDelete?(): Promise<void>
}>
