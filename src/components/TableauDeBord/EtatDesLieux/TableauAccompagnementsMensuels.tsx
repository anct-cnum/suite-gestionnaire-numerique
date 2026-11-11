import { ReactElement } from 'react'

import { MoisAccompagnementsViewModel } from '@/presenters/tableauDeBord/accompagnementsMensuelsPresenter'

export default function TableauAccompagnementsMensuels({ mois }: Props): ReactElement {
  return (
    <div className="fr-table fr-table--sm fr-table--multiline fr-mb-0">
      <div className="fr-table__wrapper">
        <div className="fr-table__container">
          <div className="fr-table__content">
            <table>
              <caption>Accompagnements des 6 derniers mois</caption>
              <thead>
                <tr>
                  <th scope="col">Mois</th>
                  <th scope="col">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {mois.map((ligne) => (
                  <tr key={ligne.libelleComplet}>
                    <th scope="row">{ligne.libelleComplet}</th>
                    <td>{ligne.nombreAffiche}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  mois: ReadonlyArray<MoisAccompagnementsViewModel>
}>
