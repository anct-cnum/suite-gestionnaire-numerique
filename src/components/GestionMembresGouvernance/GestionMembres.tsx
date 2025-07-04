'use client'

import Link from 'next/link'
import { Fragment, ReactElement, useEffect, useId, useState } from 'react'

import AjouterUnMembre from './AjouterUnMembre'
import styles from './GestionMembres.module.css'
import Drawer from '../shared/Drawer/Drawer'
import Icon from '../shared/Icon/Icon'
import PageTitle from '../shared/PageTitle/PageTitle'
import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'
import { MembresViewModel, MembreViewModel } from '@/presenters/membresPresenter'
import { alphaAsc } from '@/shared/lang'

export default function GestionMembres({ membresViewModel }: Props): ReactElement {
  const selectRoleId = useId()
  const selectTypologieId = useId()
  const labelId = useId()
  const drawerId = 'drawerGererLesMembresId'

  const [membresView, setMembresView] = useState<MembresView>({
    membres: membresViewModel.membres,
    roleSelectionne: toutRole,
    statutSelectionne: 'confirme',
    typologieSelectionnee: touteTypologie,
  })
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Ce code n'est pas testé
  // Cela met à jour la liste des membres après avoir accepté un candidat ou suggéré
  useEffect(() => {
    setMembresView({
      membres: membresViewModel.membres,
      roleSelectionne: toutRole,
      statutSelectionne: 'confirme',
      typologieSelectionnee: touteTypologie,
    })
  }, [membresViewModel.membres])

  const candidats = membresViewModel.candidats
    .toSorted(alphaAsc('nom'))

  const membresByStatut: Readonly<Record<StatutSelectionnable, ReadonlyArray<MembreViewModel>>> = {
    candidat: membresViewModel.candidats,
    confirme: membresViewModel.membres,
  }

  return (
    <>
      <div className="fr-grid-row space-between fr-grid-row--middle">
        <PageTitle>
          Gérer les membres ·
          {' '}
          {membresViewModel.departement}
        </PageTitle>
        <button
          aria-controls={drawerId}
          className="fr-btn fr-btn--primary fr-btn--icon-left fr-icon-add-line fr-mt-4v"
          data-fr-opened="false"
          onClick={() => {
            setIsDrawerOpen(true)
          }}
          type="button"
        >
          Ajouter un membre
        </button>
      </div>
      <div className="fr-tabs fr-tabs__list fr-pb-0">
        <ul className="fr-nav__list">
          {[
            ['confirme', 'Membres'] as const,
            ['candidat', 'Candidats'] as const,
          ].map(([statut, libelle]) => (
            <li
              className="fr-nav__item"
              key={statut}
            >
              <button
                aria-current={isSelectionne(statut)}
                className="fr-nav__link fr-nav__link"
                onClick={() => {
                  setStatut(statut)
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
      <div className="fr-grid-row space-between fr-mt-4w">
        <div className="fr-grid-row fr-grid-row--middle">
          <div className={styles['label-filtres']}>
            Filtres :
          </div>
          <div className={`fr-tag fr-accordion__btn ${styles.selecteur} fr-mr-1w`}>
            <label
              className="fr-sr-only"
              htmlFor={selectRoleId}
            >
              Filtrer par rôle
            </label>
            <select
              className="fr-tag--sm"
              defaultValue={toutRole}
              id={selectRoleId}
              onChange={(event) => {
                setFiltreRole(event.target.value)
              }}
            >
              <option
                value={toutRole}
              >
                Rôles
              </option>
              {membresViewModel.roles
                .filter(role => role.nom !== 'Observateur' )
                .map((role) => (
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
              defaultValue={touteTypologie}
              id={selectTypologieId}
              onChange={(event) => {
                setFiltreTypologie(event.target.value)
              }}
            >
              <option
                value={touteTypologie}
              >
                Typologie
              </option>
              {membresViewModel.typologies.map((typologie) => (
                <option
                  key={typologie.value.replace(/\s/, '-')}
                  value={typologie.value}
                >
                  {typologie.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="fr-mb-2w fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line"
          style={{ display: 'none' }}
          type="button"
        >
          Exporter
        </button>
      </div>
      <Table
        enTetes={['Structure', 'Contact référent', 'Rôles']} //, 'Action'
        titre="Membres"
      >
        {membresView.membres.map((membre, index) => (
          <tr
            data-row-key={index}
            key={membre.uid}
          >
            <td>
              <Link
                className="primary fr-px-0 no-hover d-block"
                href={membre.link}
              >
                <p className="fr-text--sm fr-text--bold fr-text-action-high--grey">
                  {membre.nom}
                </p>
              </Link>
              <p className="fr-text--sm fr-text-mention--grey" >
                {membre.typologie.simple.value}
              </p>
            </td>
            <td>
              <p className="fr-text--sm fr-text-mention--grey">
                {membre.contactReferent.intituleCourt}
              </p>
            </td>
            <td>
              {membre.roles
                .filter(role => role.nom !== 'Observateur' )
                .map((role) => (
                  <Fragment key={role.color}>
                    <Badge color={role.color}>
                      {role.nom}
                    </Badge>
                    {' '}
                  </Fragment>
                ))}
            </td>
            <td
              className="fr-cell--center"
              style={{ display : 'none' }}
            >
              <button
                className="fr-btn fr-btn--tertiary color-red"
                disabled={!membre.isDeletable}
                title="Supprimer"
                type="button"
              >
                <Icon icon="delete-line" />
              </button>
            </td>
          </tr>
        ))}
      </Table>
      <Drawer
        boutonFermeture="Fermer l’ajout d’un membre"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <AjouterUnMembre
          candidats={candidats}
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerId}
          labelId={labelId}
          uidGouvernance={membresViewModel.uidGouvernance}
        />
      </Drawer>
    </>
  )

  function isSelectionne(statut: StatutSelectionnable): 'page' | false {
    return statut === membresView.statutSelectionne ? 'page' : false
  }

  function setStatut(statut: StatutSelectionnable): void {
    setMembresView({
      ...membresView,
      membres: membresByStatut[statut],
      statutSelectionne: statut,
    })
  }

  function setFiltreRole(roleSelectionne: string): void {
    setMembresView({
      ...membresView,
      membres: filtrerMembres(roleSelectionne, membresView.typologieSelectionnee),
      roleSelectionne,
    })
  }

  function setFiltreTypologie(typologieSelectionnee: string): void {
    setMembresView({
      ...membresView,
      membres: filtrerMembres(membresView.roleSelectionne, typologieSelectionnee),
      typologieSelectionnee,
    })
  }

  function filtrerMembres(role: string, typologie: string): ReadonlyArray<MembreViewModel> {
    const membres = membresByStatut[membresView.statutSelectionne]
    return membres.values()
      .filter(({ roles }) => role === toutRole ? true : roles.map(({ nom }) => nom).includes(role))
      .filter((membre) => typologie === touteTypologie ? true : typologie === membre.typologie.simple.value)
      .toArray()
  }
}

const toutRole = 'toutRole'
const touteTypologie = 'touteTypologie'

type Props = Readonly<{
  membresViewModel: MembresViewModel
}>

type StatutSelectionnable = 'candidat' | 'confirme'

type MembresView = Readonly<{
  membres: ReadonlyArray<MembreViewModel>
  roleSelectionne: string
  statutSelectionne: StatutSelectionnable
  typologieSelectionnee: string
}>
