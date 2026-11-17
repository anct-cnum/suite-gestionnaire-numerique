import Link from 'next/link'
import { ReactElement } from 'react'

// Entrée de l'espace Mesure d'impact : les campagnes que porte la structure
export default function MesCampagnes({ campagnes }: Props): ReactElement {
  return (
    <>
      <h1 className="fr-h2">Mesure d’impact</h1>
      <p className="fr-text--lead">
        Mesurez ce que les accompagnements au numérique changent pour les personnes accompagnées de votre territoire.
      </p>
      <ul className="fr-grid-row fr-grid-row--gutters fr-raw-list">
        {campagnes.map(({ identifiantPublic, libelleTerritoire, nom }) => (
          <li className="fr-col-12 fr-col-md-6" key={identifiantPublic}>
            <div className="fr-card fr-enlarge-link">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <h2 className="fr-card__title">
                    <Link href={`/mesure-impact/${identifiantPublic}`}>{nom}</Link>
                  </h2>
                  <p className="fr-card__desc">{libelleTerritoire}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

type Props = Readonly<{
  campagnes: ReadonlyArray<Readonly<{ identifiantPublic: string; libelleTerritoire: string; nom: string }>>
}>
