'use client'

import { ReactElement } from 'react'

import styles from './NoticeInformation.module.css'

// Bandeau d'information « Notes » de la maquette : le DSFR ne couvre pas ce rendu (fr-notice affiche titre et
// description sur la même ligne en desktop), d'où le module CSS construit sur les variables DSFR.
export default function NoticeInformation({ viewModel }: Props): ReactElement {
  return (
    <div className={`fr-mb-4w ${styles.notice}`}>
      <span aria-hidden="true" className={`fr-icon-info-fill ${styles.icone}`} />
      <div>
        {viewModel.titre === undefined ? null : <p className="fr-text--sm fr-text--bold fr-mb-0">{viewModel.titre}</p>}
        <p className="fr-text--sm fr-mb-0">{viewModel.description}</p>
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: Readonly<{
    description: string
    titre?: string
  }>
}>
