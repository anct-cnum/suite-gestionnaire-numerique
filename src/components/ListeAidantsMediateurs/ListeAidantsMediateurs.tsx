'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import ListeAidantsMediateurInfos from './ListeAidantsMediateurInfos'
import Badge from '../shared/Badge/Badge'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { ListeAidantsMediateursViewModel } from '@/presenters/listeAidantsMediateursPresenter'

export default function ListeAidantsMediateurs({
  listeAidantsMediateursViewModel,
  totalBeneficiairesPromise,
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

  function getAidantIcons(labelisations: Array<'aidants connect' | 'conseiller numérique'>): Array<{ alt: string; src: string }> {
    const icons: Array<{ alt: string; src: string }> = []
    
    if (labelisations.includes('conseiller numérique')) {
      icons.push({ alt: 'Conseiller numérique', src: '/conum.svg' })
    }

    if (labelisations.includes('aidants connect')) {
      icons.push({ alt: 'Aidant numérique', src: '/aidant-numerique.svg' })
    }

    return icons
  }

  return (
    <>
      <div className="fr-grid-row">
        <PageTitle>
          <TitleIcon icon="group-line" />
          Suivi aidants et médiateurs
        </PageTitle>
      </div>
      <>
        <ListeAidantsMediateurInfos
          totalBeneficiairesPromise={totalBeneficiairesPromise}
          viewModel={{
            totalAccompagnements: viewModel.totalAccompagnements,
            totalActeursNumerique: viewModel.totalActeursNumerique,
            totalConseillersNumerique: viewModel.totalConseillersNumerique,
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
            <tr
              key={aidant.id}
              style={{ height: '4rem' }}
            >
              <td>
                <div className="fr-grid-row fr-text--bold fr-grid-row--middle">
                  {aidant.nom}
                  {' '}
                  {aidant.prenom}
                  {getAidantIcons(aidant.labelisations).map((icon) => (
                    <img
                      alt={icon.alt}
                      className="fr-ml-1w"
                      height={24}
                      key={`${aidant.id}-${icon.src}`}
                      src={icon.src}
                      width={24}
                    />
                  ))}
                </div>
              </td>
              <td>
                <div className="fr-grid-row fr-grid-row--gutters fr-text--sm ">
                  {aidant.role.map((roleItem) => (
                    <Badge
                      color={roleItem === 'Coordinateur' ? 'info' : 'grey'}
                      key={`${aidant.id}-role-${roleItem}`}
                      small={true}
                    >
                      {roleItem}
                    </Badge>
                  ))}
                </div>
              </td>
              <td>
                {aidant.labelisations.length > 0 ? (
                  <div className="fr-grid-row fr-grid-row--gutters">
                    {aidant.labelisations.map((labelisation) => (
                      <div
                        className="fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v"
                        key={`${aidant.id}-labelisation-${labelisation}`}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border-default-grey)',
                          color: 'var(--text-default-grey)' }}
                      >
                        {labelisation}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>
                    -
                  </span>
                )}
              </td>
              <td>
                {typeof aidant.formations === 'object' && aidant.formations.length > 0 ? (
                  <div className="fr-grid-row fr-grid-row--gutters">
                    {aidant.formations.map((form) => (
                      <div
                        className="fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v"
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
                ) : (
                  <span>
                    -
                  </span>
                )}
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
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
}>
