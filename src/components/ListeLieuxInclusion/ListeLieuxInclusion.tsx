'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import Badge from '../shared/Badge/Badge'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import ListeLieuxInclusionInfo from '@/components/ListeLieuxInclusion/ListeLieuxInclusionInfo'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ListeLieuxInclusionViewModel } from '@/presenters/listeLieuxInclusionPresenter'

export default function ListeLieuxInclusion({
  listeLieuxInclusionViewModel,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  
  if ('type' in listeLieuxInclusionViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>
          {listeLieuxInclusionViewModel.message}
        </p>
      </div>
    )
  }

  const viewModel = listeLieuxInclusionViewModel

  return (
    <>
      {isPageLoading ? (
        <div
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 9999,
          }}
        >
          <SpinnerSimple
            size="large"
            text="Chargement..."
          />
        </div>
      ) : null}
      
      <div className="fr-grid-row">
        <PageTitle>
          <TitleIcon icon="map-pin-2-line" />
          Suivi des lieux d&apos;inclusion numérique
        </PageTitle>
      </div>

      {viewModel.lieux.length === 0 ? (
        <p>
          Aucun lieu d&apos;inclusion numérique trouvé.
        </p>
      ) : (
        <>
          <ListeLieuxInclusionInfo infos={{
            total: viewModel.total,
            totalConseillerNumerique: viewModel.totalConseillerNumerique,
            totalLabellise: viewModel.totalLabellise,
          }}
          />
          <Table
            enTetes={[
              'Lieu',
              'Adresse',
              'Siret',
              'FRR / QPV',
              'Mandats AC',
              'Nb Accompagnements',
              //'Action',
            ]}
            titre="Lieux d'inclusion numérique"
          >
            {viewModel.lieux.map((lieu) => (
              <tr key={lieu.id}>
                <td style={{ maxWidth: '25vw' }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    <strong
                      title={lieu.nom}
                    >
                      {lieu.nom}
                    </strong>
                    <br />
                    <span
                      className="fr-text--sm"
                      title={lieu.typeStructure}
                    >
                      {lieu.typeStructure}
                    </span>
                  </div>
                </td>
                <td style={{ maxWidth: '20vw' }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    {lieu.adresse}
                  </div>
                </td>
                <td>
                  {lieu.siret}
                </td>
                <td>
                  <div className="fr-tags-group">
                    {lieu.tags.map((tag) => (
                      <Badge
                        color={tag.couleur}
                        key={`${lieu.id}-tag-${tag.libelle}`}
                      >
                        {tag.libelle}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="fr-cell--center">
                  {lieu.nbMandatsAC}
                </td>
                <td className="fr-cell--center">
                  {lieu.nbAccompagnements}
                </td>
                <td
                  className="fr-cell--center"
                  style={{ display: 'none' }}
                >
                  <Link
                    className="fr-btn fr-btn--secondary fr-btn--sm"
                    href={`/lieu/${lieu.id}`}
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
                pathname="/liste-lieux-inclusion"
                totalUtilisateurs={viewModel.total}
              />
            </div>
          ) : null}
        </>
      )}
    </>
  )
}

type Props = Readonly<{
  listeLieuxInclusionViewModel: ErrorViewModel | ListeLieuxInclusionViewModel
}>
