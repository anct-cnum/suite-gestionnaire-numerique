'use client'

import { Fragment, ReactElement, useId } from 'react'

import styles from './Membres.module.css'
import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'
import { MesMembresViewModel } from '@/presenters/mesMembresPresenter'

export default function Membres({ membresViewModel }: Props): ReactElement {
  const selectRoleId = useId()
  const selectTypologieId = useId()

  return (
    <>
      <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
        <h1 className="color-blue-france fr-mt-5w">
          {membresViewModel.titre}
        </h1>
        <button
          className="fr-btn fr-btn--primary fr-btn--icon-left fr-icon-add-line"
          type="button"
        >
          Ajouter un membre
        </button>
      </div>
      <div className="fr-tabs fr-tabs__list fr-pb-0">
        <ul className="fr-nav__list">
          <li className="fr-nav__item">
            <button
              aria-current="page"
              className="fr-nav__link fr-nav__link"
              role="tab"
              type="button"
            >
              Membres
              {' '}
              ·
              {' '}
              {membresViewModel.membres.length}
            </button>
          </li>
          <li className="fr-nav__item">
            <button
              aria-current={false}
              className="fr-nav__link fr-nav__link"
              role="tab"
              type="button"
            >
              Suggestions
              {' '}
              ·
              {' '}
              0
            </button>
          </li>
          <li className="fr-nav__item">
            <button
              aria-current={false}
              className="fr-nav__link fr-nav__link"
              role="tab"
              type="button"
            >
              Candidats
              {' '}
              ·
              {' '}
              0
            </button>
          </li>
        </ul>
      </div>
      <div className="fr-grid-row fr-btns-group--between fr-mt-4w">
        <div className="fr-tags-group">
          <div className={styles['label-filtres']}>
            Filtres :
          </div>
          <div className={`fr-tag fr-accordion__btn ${styles.selecteur}`}>
            <label
              className="fr-sr-only"
              htmlFor={selectRoleId}
            >
              Filtrer par rôle
            </label>
            <select
              className="fr-tag--sm"
              defaultValue=""
              id={selectRoleId}
            >
              <option
                disabled
                value=""
              >
                Rôles
              </option>
              {membresViewModel.roles.map((role, index) => (
                <option
                  key={role.color}
                  value={index}
                >
                  {role.nom}
                </option>
              ))}
            </select>
          </div>
          <div className={`fr-tag fr-accordion__btn color-blue-france ${styles.selecteur}`}>
            <label
              className="fr-sr-only"
              htmlFor={selectTypologieId}
            >
              Filtrer par typologie
            </label>
            <select
              className="fr-tag--sm"
              defaultValue=""
              id={selectTypologieId}
            >
              <option
                disabled
                value=""
              >
                Typologie
              </option>
              {membresViewModel.typologies.map((typologie, index) => (
                <option
                  key={typologie.replace(/\s/, '-')}
                  value={index}
                >
                  {typologie}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="fr-mb-2w fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line"
          type="button"
        >
          Exporter
        </button>
      </div>
      <Table
        enTetes={['Structure', 'Contact référent', 'Rôles', 'Action']}
        titre="Membres"
      >
        {membresViewModel.membres.map((membre, index) => (
          <tr
            data-row-key={index}
            id={`table-sm-row-key-${index}`}
            key={membre.nom}
          >
            <td>
              <div className="font-weight-700">
                {membre.nom}
              </div>
              {membre.typologie}
            </td>
            <td>
              {membre.contactReferent}
            </td>
            <td>
              {membre.roles.map((role) => (
                <Fragment key={role.color}>
                  <Badge color={role.color}>
                    {role.nom}
                  </Badge>
                  {' '}
                </Fragment>
              ))}
            </td>
            <td className="fr-cell--center">
              <button
                className="fr-btn fr-btn--tertiary"
                title="Supprimer"
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="fr-icon-delete-line color-red"
                />
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}

type Props = Readonly<{
  membresViewModel: MesMembresViewModel
}>
