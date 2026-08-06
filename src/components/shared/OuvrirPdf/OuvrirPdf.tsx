'use client'

import { ChangeEvent, ReactElement, useRef } from 'react'

import styles from './OuvrirPdf.module.css'
import DocumentVide from '../DocumentVide/DocumentVide'
import ExternalLink from '../ExternalLink/ExternalLink'
import Icon from '../Icon/Icon'
import { isNullishOrEmpty } from '@/shared/lang'

export default function OuvrirPdf({
  href,
  isReplacing = false,
  metadonnee,
  nom,
  onDelete,
  onReplace,
}: Props): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header>
          <h2 className={`fr-h6 color-blue-france fr-mb-0 ${styles.fileName}`} id="document">
            {nom}
          </h2>
          {isNullishOrEmpty(metadonnee) ? null : <span className="fr-hint-text">{metadonnee}</span>}
        </header>
        <div className="fr-upload-group" />
        <ul className="fr-btns-group fr-btns-group--inline-sm fr-mt-2w">
          <li>
            <ExternalLink className="fr-btn fr-btn--secondary" href={href} title="Ouvrir le pdf">
              Ouvrir le pdf
            </ExternalLink>
          </li>
          {onReplace ? (
            <li>
              <button
                className="fr-btn fr-btn--tertiary"
                disabled={isReplacing}
                onClick={() => {
                  inputRef.current?.click()
                }}
                type="button"
              >
                {isReplacing ? 'Remplacement en cours...' : 'Remplacer'}
              </button>
              <input
                accept=".pdf"
                aria-label={`Remplacer ${nom}`}
                className="fr-sr-only"
                onChange={(event) => {
                  void onReplace(event)
                }}
                ref={inputRef}
                type="file"
              />
            </li>
          ) : null}
          {onDelete ? (
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
          ) : null}
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
  isReplacing?: boolean
  metadonnee?: string
  nom: string
  onDelete?(): void
  onReplace?(event: ChangeEvent<HTMLInputElement>): Promise<void>
}>
