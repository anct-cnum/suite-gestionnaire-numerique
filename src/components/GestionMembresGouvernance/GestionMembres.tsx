'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, ReactElement, useContext, useEffect, useId, useState } from 'react'

import styles from './GestionMembres.module.css'
import PageTitle from '../shared/PageTitle/PageTitle'
import Badge from '@/components/shared/Badge/Badge'
import { clientContext } from '@/components/shared/ClientContext'
import { gouvernanceContext } from '@/components/shared/GouvernanceContext'
import Menu from '@/components/shared/Menu/Menu'
import MenuItem, { MenuItemProps } from '@/components/shared/Menu/MenuItem'
import { Notification } from '@/components/shared/Notification/Notification'
import Table from '@/components/shared/Table/Table'
import { MembresViewModel, MembreViewModel } from '@/presenters/membresPresenter'

export default function GestionMembres({ membresViewModel }: Props): ReactElement {
  const selectRoleId = useId()
  const selectTypologieId = useId()

  const router = useRouter()
  const searchParams = useSearchParams()
  const statutInitial = searchParams.get('statut') === 'candidat' ? 'candidat' : 'confirme'

  useEffect(() => {
    if (searchParams.get('statut') === null) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('statut', 'confirme')
      router.replace(newUrl.pathname + newUrl.search)
    }
  }, [searchParams, router])

  const {
    accepterUnMembreAction,
    definirUnCoPorteurAction ,
    pathname,
    retirerUnCoPorteurAction,
    sessionUtilisateurViewModel,
    supprimerUnMembreOuCandidatAction,
  } = useContext(clientContext)

  const membresByStatut: Readonly<Record<StatutSelectionnable, ReadonlyArray<MembreViewModel>>> = {
    candidat: membresViewModel.candidats,
    confirme: membresViewModel.membres,
  }

  const [membresView, setMembresView] = useState<MembresView>({
    membres: membresByStatut[statutInitial],
    roleSelectionne: toutRole,
    statutSelectionne: statutInitial,
    typologieSelectionnee: touteTypologie,
  })
  const { gouvernanceViewModel } = useContext(gouvernanceContext)
  useEffect(() => {
    setMembresView({
      membres: membresByStatut[statutInitial],
      roleSelectionne: toutRole,
      statutSelectionne: statutInitial,
      typologieSelectionnee: touteTypologie,
    })
  }, [membresViewModel.membres, statutInitial])

  function estUnePrefecture(membre: MembreViewModel): boolean {
    return membre.typologie.simple.value === 'Préfecture départementale'
  }

  function getMenuMembreCoPorteur(membre: MembreViewModel):  Array<ReactElement<MenuItemProps, typeof MenuItem>> {
    return [
      <MenuItem
        iconClass="fr-icon-user-line"
        key={`ajout-${membre.uid}`}
        label="Retirer le rôle de coporteur"
        onClick={async () => {
          await retirerUnCoPorteur(membre)
        }}
      />,
      <MenuItem
        iconClass="fr-icon-delete-line"
        key={`delete-${membre.uid}`}
        label="Retirer ce membre"
        onClick={async () => {
          await supprimerUnMembreOuCandidat(membre)
        }}
      />,
    ]
  }

  function getMenuMembreNonCoPorteur(membre: MembreViewModel):  Array<ReactElement<MenuItemProps, typeof MenuItem>> {
    return [
      <MenuItem
        iconClass="fr-icon-user-star-line"
        key={`ajout-${membre.uid}`}
        label="Définir comme coporteur"
        onClick={async () => {
          await definirUnCoPorteur(membre)
        }}
      />,
      <MenuItem
        iconClass="fr-icon-delete-line"
        key={`delete-${membre.uid}`}
        label="Retirer ce membre"
        onClick={async () => {
          await supprimerUnMembreOuCandidat(membre)
        }}
      />,
    ]
  }

  function getMenuCandidat(membre: MembreViewModel):  Array<ReactElement<MenuItemProps, typeof MenuItem>>{
    return [
      <MenuItem
        iconClass="fr-icon-add-line"
        key={`ajout-${membre.uid}`}
        label="Ajouter à la gouvernance"
        onClick={async () => {
          await ajouterUnMembre(membre)
        }}
      />,
      <MenuItem
        iconClass="fr-icon-delete-line"
        key={`delete-${membre.uid}`}
        label="Retirer ce candidat"
        onClick={async () => {
          await supprimerUnMembreOuCandidat(membre)
        }}
      />,
    ]
  }

  function estDansLaMemeStructure(membre: MembreViewModel): boolean{
    return membre.structureId !== undefined && membre.structureId === sessionUtilisateurViewModel.structureId
  }

  function getMenu(membre: MembreViewModel): null | ReactElement {
    if(!gouvernanceViewModel.peutGererGouvernance ||
      estDansLaMemeStructure(membre) ||
      estUnePrefecture(membre)
    ){
      return null
    }
    let menuItem
    if(membresView.statutSelectionne === 'candidat')
    {
      menuItem =  getMenuCandidat(membre)
    }
    else if(membre.roles.some((role) => role.nom === 'Co-porteur'))
    {
      menuItem =  getMenuMembreCoPorteur(membre)
    }
    else {
      menuItem = getMenuMembreNonCoPorteur(membre)
    }
    return  (
      <td>
        <Menu
          items={menuItem}
        />
      </td>
    )
  }

  function getEnTetes() : Array<string>{
    const enTetes: Array<string> = ['Structure', 'Contact référent', 'Rôles']
    if(gouvernanceViewModel.peutGererGouvernance)
    {return enTetes.concat([''])}
    return  enTetes
  }

  return (
    <>
      <div className="fr-grid-row space-between fr-grid-row--middle">
        <PageTitle>
          Gérer les membres ·
          {' '}
          {membresViewModel.departement}
        </PageTitle>
        {
          gouvernanceViewModel.peutGererGouvernance ?
            <button
              className="fr-btn fr-btn--primary fr-btn--icon-left fr-icon-add-line fr-mt-4v"
              onClick={() => {
                const ajouterPath = `${pathname}/ajouter`
                router.push(ajouterPath)
              }}
              type="button"
            >
              Ajouter un candidat
            </button>: null
        }
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
          <div className="fr-pr-1w">
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

      </div>
      <Table
        enTetes={getEnTetes()}
        titre="Membres"
      >
        {membresView.membres.map((membre, index) => (
          <tr
            data-row-key={index}
            key={membre.uid}
          >
            <td
              style={{ maxWidth: '50ch' ,
                minHeight: '6em',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordWrap: 'break-word' }}
              tabIndex={0}
            >
              <button
                onClick={() => { router.push(membre.link) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    router.push(membre.link)
                  }
                }}
                style={{
                  height: '100%',
                  textAlign: 'left',
                  width: '100%',
                }}
                type="button"
              >
                <p className="fr-text--sm fr-text--bold fr-text-action-high--grey">
                  {membre.nom}
                </p>
                <p className="fr-text--sm fr-text-mention--grey">
                  {membre.typologie.simple.value}
                </p>
              </button>
            </td>

            <td>
              <p className="fr-text--sm fr-text--bold fr-text-mention--grey">
                {membre.contactReferent.intituleCourt}
              </p>
              <p className="fr-text--sm fr-text-mention--grey">
                {membre.contactReferent.email}
              </p>
            </td>
            <td>
              <div
                className="fr-container"
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexWrap: 'nowrap',
                  paddingLeft: 0,
                  paddingRight:0,
                }}
              >
                {membre.roles
                  .filter(role => role.nom !== 'Observateur')
                  .map((role) => (
                    <Fragment key={role.color}>
                      <Badge color={role.color}>
                        {role.nom}
                      </Badge>
                      {' '}
                    </Fragment>
                  ))}
              </div>
            </td>
            {getMenu(membre)}
          </tr>
        ))}
      </Table>

    </>
  )

  function isSelectionne(statut: StatutSelectionnable): 'page' | false {
    return statut === membresView.statutSelectionne ? 'page' : false
  }

  function setStatut(statut: StatutSelectionnable): void {
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('statut', statut)
    router.replace(newUrl.pathname + newUrl.search)

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

  async function ajouterUnMembre(membre: MembreViewModel): Promise<void> {
    const messages = await accepterUnMembreAction({
      path: pathname,
      uidGouvernance: membresViewModel.uidGouvernance,
      uidMembrePotentiel: membre.uid,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'ajouté', title: 'Membre' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
  }

  async function definirUnCoPorteur(membre: MembreViewModel): Promise<void> {
    const messages = await definirUnCoPorteurAction({
      path: pathname,
      uidGouvernance: membresViewModel.uidGouvernance,
      uidMembre: membre.uid,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'Défini', title: 'Rôle coporteur' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
  }

  async function retirerUnCoPorteur(membre: MembreViewModel): Promise<void> {
    const messages = await retirerUnCoPorteurAction({
      path: pathname,
      uidGouvernance: membresViewModel.uidGouvernance,
      uidMembre: membre.uid,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'Retiré', title: 'Rôle coporteur' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
  }

  async function supprimerUnMembreOuCandidat(membre: MembreViewModel): Promise<void> {
    const messages = await supprimerUnMembreOuCandidatAction({
      path: pathname,
      uidGouvernance: membresViewModel.uidGouvernance,
      uidMembre: membre.uid,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'Membre' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
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
