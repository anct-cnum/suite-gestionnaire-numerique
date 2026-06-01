'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import Table from '../shared/Table/Table'
import { GroupeDoublonViewModel, StructuresDoublonsViewModel } from '@/presenters/structuresDoublonsPresenter'

export default function StructuresDoublons({ viewModel }: Props): ReactElement {
  const pluriel = viewModel.total > 1 ? 's' : ''
  const resume =
    viewModel.total === 0
      ? 'Aucun doublon candidat détecté.'
      : `${viewModel.total} groupe${pluriel} de doublons candidats à examiner.`

  return (
    <section>
      <h1>Doublons de structures</h1>
      <p className="fr-text--sm fr-text-mention--grey">{resume}</p>

      {viewModel.total > 0 ? (
        <Table enTetes={['Signal', 'Structures concernées', 'Commune', '']} titre="Doublons de structures">
          {viewModel.groupes.map((groupe) => (
            <LigneGroupe groupe={groupe} key={groupe.cle} />
          ))}
        </Table>
      ) : null}
    </section>
  )
}

function LigneGroupe({ groupe }: Readonly<{ groupe: GroupeDoublonViewModel }>): ReactElement {
  return (
    <tr>
      <td>
        <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--info">{groupe.signalLibelle}</span>
        {groupe.badges.map((badge) => (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--warning fr-ml-1w" key={badge}>
            {badge}
          </span>
        ))}
      </td>
      <td>
        <ul className="fr-raw-list">
          {groupe.structures.map((structure) => (
            <li key={structure.id}>
              <span className="fr-text--bold">{structure.denomination}</span>{' '}
              <span className="fr-text--xs fr-text-mention--grey">
                ({structure.identifiant} · {structure.nbRattachements} rattachement
                {structure.nbRattachements > 1 ? 's' : ''})
              </span>
            </li>
          ))}
        </ul>
      </td>
      <td>{groupe.commune}</td>
      <td>
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm"
          href={`/structures-doublons/comparer?ids=${groupe.idsParam}`}
        >
          Examiner
        </Link>
      </td>
    </tr>
  )
}

type Props = Readonly<{
  viewModel: StructuresDoublonsViewModel
}>
