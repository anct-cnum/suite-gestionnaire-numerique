import { ReactElement } from 'react'

export default function ResumeMembreVide(): ReactElement {
  return (
    <p>
      <span className="fr-display--sm">
        0
      </span>
      {' '}
      <span className="fr-text--lead">
        membre
        {' '}
        <br />
        de la gouvernance
      </span>
    </p>
  )
}
