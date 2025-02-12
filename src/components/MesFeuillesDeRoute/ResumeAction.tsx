import { ReactElement } from 'react'

export default function ResumeAction(): ReactElement {
  return (
    <div className='fr-container fr-p-0'>
      <div className='fr-grid-row'>
        <div className='fr-col-1'>
          <span
            aria-hidden="true"
            className="fr-icon-flashlight-line color-blue-france"
          />
        </div>
        <div className='fr-col-8'>
          <p className='fr-text--bold color-blue-france fr-mb-1w'>
            Structurer une filière de reconditionnement locale
          </p>
          <a
            className='fr-tag fr-tag--sm'
            href='/'
          >

            CC des Monts du Lyonnais

          </a>
        </div>
        <div
          className='fr-col-3 right'
        >
          <p className='fr-badge fr-badge--success fr-badge--sm'>
            Subvention acceptée
          </p>
        </div>
      </div>
      <hr className='fr-mt-2w' />
    </div>
  )
}

