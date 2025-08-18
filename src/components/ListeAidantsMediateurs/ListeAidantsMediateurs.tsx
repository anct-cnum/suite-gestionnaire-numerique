'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import ListeAidantsMediateurInfos from './ListeAidantsMediateurInfos'
import Badge from '../shared/Badge/Badge'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { ListeAidantsMediateursViewModel } from '@/presenters/listeAidantsMediateursPresenter'

export default function ListeAidantsMediateurs({
  listeAidantsMediateursViewModel,
}: Props): ReactElement {
  if ('type' in listeAidantsMediateursViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>
          {listeAidantsMediateursViewModel.message}
        </p>
      </div>
    )
  }

  const viewModel = listeAidantsMediateursViewModel

  function getAidantIcon(aidant: string): null | string {
    const isConseillerNumerique =
      aidant.toLowerCase().includes('conseiller')
    if (isConseillerNumerique) {
      return '/conum.svg'
    }

    const isAidantConnect =
      aidant.toLowerCase().includes('aidants')

    if (isAidantConnect) {
      return '/aidant-numerique.svg'
    }

    return null
  }

  return (
    <>
      <div className="fr-grid-row">
        <PageTitle>
          <TitleIcon icon="group-line" />
          Suivi aidants et médiateurs
        </PageTitle>
      </div>
      <AlerteConstruction />
      <>
        <ListeAidantsMediateurInfos
          viewModel={{
            total: viewModel.total,
            totalAccompagnements: viewModel.totalAccompagnements,
            totalAidantsConnect: viewModel.totalAidantsConnect,
            totalBeneficiaires: viewModel.totalBeneficiaires,
            totalConseillers: viewModel.totalConseillers,
            totalMediateurs: viewModel.totalMediateurs,
          }}
        />

        <Table
          enTetes={[
            'Prénom et nom',
            'Rôle',
            'Labelisation / habilitation',
            'Formation',
            'Nb accomp.',
            '',
          ]}
          titre="Aidants et médiateurs numériques"
        >
          {viewModel.aidants.map((aidant) => (
            <tr key={aidant.id}>
              <td>
                <div className="fr-grid-row fr-text--bold fr-grid-row--middle">
                  {aidant.prenom}
                  {' '}
                  {aidant.nom}
                  {getAidantIcon(aidant.labelisation) !== null && (
                    <img
                      alt=""
                      height={16}
                      src={getAidantIcon(aidant.labelisation) ?? ''}
                      width={16}
                    />
                  )}
                </div>
              </td>
              <td>
                <div className="fr-grid-row fr-grid-row--gutters fr-text--sm ">
                  {aidant.role.map((roleItem) => (
                    <Badge
                      color={roleItem === 'Coordinateur' ? 'info' : 'grey'}
                      key={`${aidant.id}-role-${roleItem}`}
                    >
                      {roleItem}
                    </Badge>
                  ))}
                </div>
              </td>
              <td>
                {aidant.labelisation ? (
                  <div
                    className="fr-badge fr-badge--no-icon"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-default-grey)',
                      color: 'var(--text-default-grey)' }}
                  >
                    {aidant.labelisation}
                  </div>
                ) : (
                  <span>
                    -
                  </span>
                )}
              </td>
              <td>
                <div className="fr-grid-row fr-grid-row--gutters">
                  {aidant.formation.map((form) => (
                    <div
                      className="fr-badge fr-badge--no-icon fr-mr-1v"
                      key={`${aidant.id}-formation-${form}`}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-default-grey)',
                        color: 'var(--text-default-grey)' }}
                    >
                      {form}
                    </div>
                  ))}
                </div>
              </td>
              <td className="fr-cell--center">
                {aidant.nbAccompagnements}
              </td>
              <td className="fr-cell--center">
                <Link
                  className="fr-btn fr-btn--secondary fr-btn--sm"
                  href={`/aidant/${aidant.id}`}
                >
                  Détail
                </Link>
              </td>
            </tr>
          ))}
        </Table>

        {viewModel.displayPagination ? (
          <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
            <Pagination
              pathname="/liste-aidants-mediateurs"
              totalUtilisateurs={viewModel.total}
            />
          </div>
        ) : null}
      </>
    </>
  )
}

type Props = Readonly<{
  listeAidantsMediateursViewModel: ErrorViewModel | ListeAidantsMediateursViewModel
}>
