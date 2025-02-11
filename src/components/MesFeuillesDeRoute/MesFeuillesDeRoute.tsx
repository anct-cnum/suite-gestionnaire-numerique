import { ReactElement } from 'react'

import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function MesFeuillesDeRoute({ gouvernanceViewModel }: Props): ReactElement {
  return (
    <>
      <h1
        className="color-blue-france fr-h2"
      >
        Feuilles de route · Rhône
      </h1>
      <button
        className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-add-line"
        type="button"
      >
        Ajouter une feuille de route
      </button>
      <div className='fr-grid-row'>
        <div className='fr-col-4'>
          <p>
            55 000 €
            {' '}
          </p>
          <p>
            {' '}
            Total des subventions de l‘État
          </p>
        </div>
        <div className='fr-col-4'>
          <p>
            90 000 €
            {' '}
          </p>
          <p>
            {' '}
            Total des co-financements
          </p>
        </div>
        <div className='fr-col-4'>
          <p>
            145 000 €
          </p>
          <p>
            Budget total des feuilles de route
          </p>
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  gouvernanceViewModel: GouvernanceViewModel
}>
