'use client'

import { Fragment, ReactElement, useId, useState } from 'react'

import styles from './Membres.module.css'
import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'
import { MembreViewModel, MesMembresViewModel } from '@/presenters/mesMembresPresenter'

export default function Membres({ membresViewModel }: Props): ReactElement {
  const selectRoleId = useId()
  const selectTypologieId = useId()
  const [statutSelectionne, setStatutSelectionne] = useState<StatutSelectionnable>('confirme')
  const [roleSelectionne, setRoleSelectionne] = useState(tousLesRoles)
  const [typologieSelectionnee, setTypologieSelectionnee] = useState(toutesLesTypologies)
  const [membres, setMembres] = useState(membresViewModel.membres)
  const membresByStatut: Readonly<Record<StatutSelectionnable, ReadonlyArray<MembreViewModel>>> = {
    candidat: membresViewModel.candidats,
    confirme: membresViewModel.membres,
    suggere: membresViewModel.suggeres,
  }

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
          {[
            ['confirme', 'Membres'] as const,
            ['suggere', 'Suggestions'] as const,
            ['candidat', 'Candidats'] as const,
          ].map(([statut, libelle]) => (
            <li
              className="fr-nav__item"
              key="statut"
            >
              <button
                aria-current={isSelectionne(statut)}
                className="fr-nav__link fr-nav__link"
                onClick={() => {
                  setStatutSelectionne(statut)
                  setMembres(membresByStatut[statut])
                }}
                role="tab"
                type="button"
              >
                {libelle}
                {' '}
                ·
                {' '}
                {membresByStatut[statut].length}
              </button>
            </li>
          ))}
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
              defaultValue={tousLesRoles}
              id={selectRoleId}
              onChange={(event) => {
                setRoleSelectionne(event.target.value)
                setMembres(filtrerMembres(event.target.value, typologieSelectionnee))
              }}
            >
              <option
                value={tousLesRoles}
              >
                Rôles
              </option>
              {membresViewModel.roles.map((role) => (
                <option
                  key={role.color}
                  value={role.nom}
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
              defaultValue={toutesLesTypologies}
              id={selectTypologieId}
              onChange={(event) => {
                setTypologieSelectionnee(event.target.value)
                setMembres(filtrerMembres(roleSelectionne, event.target.value))
              }}
            >
              <option
                value={toutesLesTypologies}
              >
                Typologie
              </option>
              {membresViewModel.typologies.map((typologie) => (
                <option
                  key={typologie.replace(/\s/, '-')}
                  value={typologie}
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
        {membres.map((membre, index) => (
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

  function isSelectionne(statut: StatutSelectionnable): 'page' | false {
    return statut === statutSelectionne ? 'page' : false
  }

  function filtrerMembres(role: string, typologie: string): ReadonlyArray<MembreViewModel> {
    const membres = membresByStatut[statutSelectionne]
    return membres.values()
      .filter(({ roles }) => role === tousLesRoles ? true : roles.map(({ nom }) => nom).includes(role))
      .filter((membre) => typologie === toutesLesTypologies ? true : typologie === membre.typologie)
      .toArray()
  }
}

const tousLesRoles = ''
const toutesLesTypologies = ''

type Props = Readonly<{
  membresViewModel: MesMembresViewModel
}>

type StatutSelectionnable = 'confirme' | 'candidat' | 'suggere'
