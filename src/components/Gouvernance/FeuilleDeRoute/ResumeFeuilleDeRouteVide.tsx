import { ReactElement } from 'react'

export default function ResumeFeuilleDeRouteVide(): ReactElement {
  return (
    <p>
      <span className="fr-display--sm">
        0
      </span>
      {' '}
      <span className="fr-text--lead">
        feuille de route
        {' '}
        <br />
        territoriale
      </span>
    </p>
  )
}
