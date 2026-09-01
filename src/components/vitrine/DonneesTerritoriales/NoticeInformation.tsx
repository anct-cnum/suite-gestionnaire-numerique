'use client'

import { ReactElement } from 'react'

export default function NoticeInformation({ viewModel }: Props): ReactElement {
  return (
    <div className="fr-notice fr-notice--info fr-mb-4w">
      <div className="fr-container">
        <div className="fr-notice__body">
          <p>
            <span className="fr-notice__title">{viewModel.titre}</span>
            <span className="fr-notice__desc">{viewModel.description}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: Readonly<{
    description: string
    titre: string
  }>
}>
