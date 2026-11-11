'use client'

import { Accordion } from '@codegouvfr/react-dsfr/Accordion'
import { ReactElement } from 'react'

// Alternative textuelle d'un graphique (RGAA 1.6) : ses données dans un tableau DSFR,
// dans un accordéon fermé par défaut placé sous le graphique, lui-même masqué aux aides techniques.
// La première colonne porte l'en-tête de chaque ligne ; les suivantes, des nombres alignés à droite.
export default function DonneesEnTableau({ caption, className, enTetes, lignes, niveauTitre }: Props): ReactElement {
  return (
    <Accordion className={className} label="Afficher les données sous forme de tableau" titleAs={niveauTitre}>
      <div className="fr-table fr-table--sm fr-mb-0">
        <div className="fr-table__wrapper">
          <div className="fr-table__container">
            <div className="fr-table__content">
              <table>
                <caption>{caption}</caption>
                <thead>
                  <tr>
                    {enTetes.map((enTete, index) => (
                      <th className={index === 0 ? undefined : 'fr-cell--right'} key={enTete} scope="col">
                        {enTete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignes.map(([enTeteDeLigne, ...valeurs]) => (
                    <tr key={enTeteDeLigne}>
                      <th scope="row">{enTeteDeLigne}</th>
                      {valeurs.map((valeur, index) => (
                        <td className="fr-cell--right" key={enTetes[index + 1]}>
                          {valeur}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Accordion>
  )
}

type Props = Readonly<{
  caption: string
  className?: string
  enTetes: ReadonlyArray<string>
  lignes: ReadonlyArray<ReadonlyArray<string>>
  niveauTitre: 'h3' | 'h4' | 'h5' | 'h6'
}>
