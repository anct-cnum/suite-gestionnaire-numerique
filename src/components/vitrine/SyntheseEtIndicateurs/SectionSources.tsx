import { ReactElement } from 'react'

import BarreLogosPartenaires from '../BarreLogosPartenaires/BarreLogosPartenaires'

export default function SectionSources(): ReactElement {
  return (
    <div
      className="background-blue-france fr-p-4w"
      style={{ borderRadius: '8px', textAlign: 'center' }}
    >
      <h2 className="fr-h6 color-blue-france fr-mb-3w">
        Sources et données utilisées
      </h2>
      <BarreLogosPartenaires className="fr-mb-3w" />
      <p
        className="fr-text--sm fr-mb-3w"
        style={{ margin: '0 auto', maxWidth: '720px' }}
      >
        <strong>
          Mon Inclusion Numérique
        </strong>
        {' '}
        utilise et agrège plusieurs sources de données issues de plusieurs outils
        des lieux d&apos;inclusion numérique : La Coop de la médiation, La Cartographie Nationale,
        Aidants Connect, La Mednum, France Services, …
      </p>
    </div>
  )
}
