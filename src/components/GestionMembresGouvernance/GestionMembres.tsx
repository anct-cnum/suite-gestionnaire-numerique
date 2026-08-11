'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, ReactElement, useContext, useId, useState } from 'react'

import PageTitle from '../shared/PageTitle/PageTitle'
import Badge from '@/components/shared/Badge/Badge'
import { clientContext } from '@/components/shared/ClientContext'
import Menu from '@/components/shared/Menu/Menu'
import MenuItem, { MenuItemProps } from '@/components/shared/Menu/MenuItem'
import ConfirmationModal from '@/components/shared/Modal/ConfirmationModal'
import { Notification } from '@/components/shared/Notification/Notification'
import Select from '@/components/shared/Select/Select'
import Table from '@/components/shared/Table/Table'
import { MembresViewModel, MembreViewModel } from '@/presenters/membresPresenter'

export default function GestionMembres({ membresViewModel, peutGererGouvernance }: Props): ReactElement {
  const selectRoleId = useId()
  const selectTypologieId = useId()

  const router = useRouter()
  const searchParams = useSearchParams()
  const statutSelectionne: StatutSelectionnable = searchParams.get('statut') === 'candidat' ? 'candidat' : 'confirme'
  const roleSelectionne = searchParams.get('role') ?? toutRole
  const typologieSelectionnee = searchParams.get('typologie') ?? touteTypologie
  const [memberToDelete, setMemberToDelete] = useState<MembreViewModel>()
  const [memberToRemoveCoPorteur, setMemberToRemoveCoPorteur] = useState<MembreViewModel>()

  const {
    accepterUnMembreAction,
    definirUnCoPorteurAction,
    pathname,
    retirerUnCoPorteurAction,
    supprimerUnMembreOuCandidatAction,
  } = useContext(clientContext)

  const membresByStatut: Readonly<Record<StatutSelectionnable, ReadonlyArray<MembreViewModel>>> = {
    candidat: membresViewModel.candidats,
    confirme: membresViewModel.membres,
  }

  function getMenuMembreCoPorteur(membre: MembreViewModel): Array<ReactElement<MenuItemProps, typeof MenuItem>> {
    return [
      <MenuItem
        iconClass="fr-icon-user-line"
        key={`ajout-${membre.uid}`}
        label="Retirer le rôle de coporteur"
        onClick={() => {
          setMemberToRemoveCoPorteur(membre)
        }}
      />,
      <MenuItem
        iconClass="fr-icon-delete-line"
        key={`delete-${membre.uid}`}
        label="Retirer ce membre"
        onClick={() => {
          setMemberToDelete(membre)
        }}
      />,
    ]
  }

  function getMenuMembreNonCoPorteur(membre: MembreViewModel): Array<ReactElement<MenuItemProps, typeof MenuItem>> {
    return [
      <MenuItem
        iconClass="fr-icon-user-star-line"
        key={`ajout-${membre.uid}`}
        label="Définir comme coporteur"
        onClick={() => {
          void definirUnCoPorteur(membre)
        }}
      />,
      <MenuItem
        iconClass="fr-icon-delete-line"
        key={`delete-${membre.uid}`}
        label="Retirer ce membre"
        onClick={() => {
          setMemberToDelete(membre)
        }}
      />,
    ]
  }

  function getMenuCandidat(membre: MembreViewModel): Array<ReactElement<MenuItemProps, typeof MenuItem>> {
    return [
      <MenuItem
        iconClass="fr-icon-add-line"
        key={`ajout-${membre.uid}`}
        label="Ajouter à la gouvernance"
        onClick={() => {
          void ajouterUnMembre(membre)
        }}
      />,
      <MenuItem
        iconClass="fr-icon-delete-line"
        key={`delete-${membre.uid}`}
        label="Retirer ce candidat"
        onClick={() => {
          setMemberToDelete(membre)
        }}
      />,
    ]
  }

  function getMenu(membre: MembreViewModel): null | ReactElement {
    if (!peutGererGouvernance) {
      return (
        <td style={{ verticalAlign: 'middle' }}>
          {membre.structureId === undefined ? null : (
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                aria-label="Voir la fiche structure"
                className="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-eye-line"
                onClick={() => {
                  router.push(membre.link)
                }}
                type="button"
              />
            </div>
          )}
        </td>
      )
    }
    let menuItem
    if (statutSelectionne === 'candidat') {
      menuItem = getMenuCandidat(membre)
    } else if (membre.roles.some((role) => role.nom === 'Co-porteur')) {
      menuItem = getMenuMembreCoPorteur(membre)
    } else {
      menuItem = getMenuMembreNonCoPorteur(membre)
    }
    return (
      <td style={{ verticalAlign: 'middle' }}>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
          }}
        >
          <Menu items={menuItem} label="Actions" />
          {membre.structureId === undefined ? null : (
            <button
              aria-label="Voir la fiche structure"
              className="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-eye-line"
              onClick={() => {
                router.push(membre.link)
              }}
              type="button"
            />
          )}
        </div>
      </td>
    )
  }

  function getEnTetes(): Array<string> {
    return ['Structure', 'Contacts', 'Rôles', '']
  }

  return (
    <>
      <div className="fr-grid-row space-between fr-grid-row--middle">
        <PageTitle>
          {peutGererGouvernance ? 'Gérer' : 'Voir'} les membres · {membresViewModel.departement}
        </PageTitle>
        {peutGererGouvernance ? (
          <button
            className="fr-btn fr-btn--primary fr-btn--icon-left fr-icon-add-line fr-mt-4v"
            onClick={() => {
              const ajouterPath = `${pathname}/ajouter`
              router.push(ajouterPath)
            }}
            type="button"
          >
            Ajouter un candidat
          </button>
        ) : null}
      </div>
      <div className="fr-tabs fr-tabs__list fr-pb-0">
        <ul className="fr-nav__list">
          {[['confirme', 'Membres'] as const, ['candidat', 'Candidats'] as const].map(([statut, libelle]) => (
            <li className="fr-nav__item" key={statut}>
              <button
                aria-current={isSelectionne(statut)}
                className="fr-nav__link fr-nav__link"
                onClick={() => {
                  setStatut(statut)
                }}
                role="tab"
                type="button"
              >
                {libelle} ·{membresByStatut[statut].length}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="fr-grid-row space-between fr-mt-4w fr-grid-row--middle">
        <div className="fr-grid-row fr-grid-row--middle">
          <div className="fr-pr-1w fr-mt-1w">Filtres :</div>
          <div className="fr-mr-1w" style={{ minWidth: '11rem' }}>
            <Select
              id={selectRoleId}
              onChange={(option) => {
                setFiltreRole(option?.value ?? toutRole)
              }}
              options={[
                { label: 'Rôles', value: toutRole },
                ...membresViewModel.roles
                  .filter((role) => role.value !== 'observateur')
                  .map((role) => ({ label: role.label, value: role.value })),
              ]}
              value={roleSelectionne}
            >
              <span className="fr-sr-only">Filtrer par rôle</span>
            </Select>
          </div>
          <div style={{ minWidth: '11rem' }}>
            <Select
              id={selectTypologieId}
              onChange={(option) => {
                setFiltreTypologie(option?.value ?? touteTypologie)
              }}
              options={[
                { label: 'Typologie', value: touteTypologie },
                ...membresViewModel.typologies.map((typologie) => ({
                  label: typologie.label,
                  value: typologie.value,
                })),
              ]}
              value={typologieSelectionnee}
            >
              <span className="fr-sr-only">Filtrer par typologie</span>
            </Select>
          </div>
        </div>
        <button
          className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line"
          onClick={() => {
            const params = new URLSearchParams({
              codeDepartement: membresViewModel.uidGouvernance,
              statut: statutSelectionne,
            })
            if (roleSelectionne !== toutRole) {
              params.set('role', roleSelectionne)
            }
            if (typologieSelectionnee !== touteTypologie) {
              params.set('typologie', typologieSelectionnee)
            }
            window.open(`/api/export/contacts-membres-csv?${params.toString()}`)
          }}
          type="button"
        >
          Exporter les contacts
        </button>
      </div>
      <Table enTetes={getEnTetes()} titre="Membres">
        {membresByStatut[statutSelectionne].map((membre, index) => (
          <tr data-row-key={index} key={membre.uid}>
            <td
              style={{
                maxWidth: '50ch',
                minHeight: '6em',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              tabIndex={0}
            >
              <button
                onClick={() => {
                  router.push(membre.link)
                }}
                style={{
                  height: '100%',
                  textAlign: 'left',
                  width: '100%',
                }}
                type="button"
              >
                <p className="fr-text--sm fr-text--bold fr-text-action-high--grey">{membre.nom}</p>
                <p className="fr-text--sm fr-text-mention--grey">{membre.typologie.simple.value}</p>
              </button>
            </td>

            <td>
              <button
                className="fr-link fr-text--sm"
                onClick={() => {
                  router.push(membre.structureId === undefined ? membre.link : `${membre.link}#contact`)
                }}
                type="button"
              >
                {membre.nombreContacts} {membre.nombreContacts <= 1 ? 'contact' : 'contacts'}
              </button>
            </td>
            <td>
              <div
                className="fr-container"
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexWrap: 'nowrap',
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              >
                {membre.roles
                  .filter((role) => role.nom !== 'Observateur')
                  .map((role) => (
                    <Fragment key={role.color}>
                      <Badge color={role.color}>{role.nom}</Badge>{' '}
                    </Fragment>
                  ))}
              </div>
            </td>
            {getMenu(membre)}
          </tr>
        ))}
      </Table>

      <ConfirmationModal
        confirmLabel="Supprimer"
        confirmVariant="error"
        id="modal-supprimer-membre"
        isOpen={Boolean(memberToDelete)}
        onCancel={() => {
          setMemberToDelete(undefined)
        }}
        onConfirm={() => {
          if (memberToDelete) {
            void supprimerUnMembreOuCandidat(memberToDelete).then(() => {
              setMemberToDelete(undefined)
            })
          }
        }}
        title={`Retirer ${memberToDelete?.nom ?? ''} des membres de la gouvernance ?`}
      >
        <p>
          En cliquant sur confirmer, tous les utilisateurs de la structure perdront leur accès à leur espace de gestion
          sur Mon Inclusion Numérique.
        </p>
        <p>
          Si vous souhaitez modifier le contact référent de la structure, merci de vous rapprocher du support via
          l&apos;adresse électronique :{' '}
          <a href="mailto:moninclusionnumerique@anct.gouv.fr">moninclusionnumerique@anct.gouv.fr</a>
        </p>
      </ConfirmationModal>

      <ConfirmationModal
        confirmLabel="Confirmer"
        confirmVariant="error"
        id="modal-retirer-coporteur"
        isOpen={Boolean(memberToRemoveCoPorteur)}
        onCancel={() => {
          setMemberToRemoveCoPorteur(undefined)
        }}
        onConfirm={() => {
          if (memberToRemoveCoPorteur) {
            void retirerUnCoPorteur(memberToRemoveCoPorteur).then(() => {
              setMemberToRemoveCoPorteur(undefined)
            })
          }
        }}
        title={`Retirer ${memberToRemoveCoPorteur?.nom ?? ''} des membres coporteur de la gouvernance ?`}
      >
        <p>
          En cliquant sur confirmer, les utilisateurs de la structure ne pourront plus éditer les données de votre
          gouvernance.
        </p>
      </ConfirmationModal>
    </>
  )

  function isSelectionne(statut: StatutSelectionnable): 'page' | false {
    return statut === statutSelectionne ? 'page' : false
  }

  function naviguerAvecFiltres(modifierParams: (params: URLSearchParams) => void): void {
    const params = new URLSearchParams(searchParams)
    modifierParams(params)
    const queryString = params.toString()
    router.push(queryString === '' ? pathname : `${pathname}?${queryString}`)
  }

  function setStatut(statut: StatutSelectionnable): void {
    naviguerAvecFiltres((params) => {
      params.set('statut', statut)
    })
  }

  function setFiltreRole(role: string): void {
    naviguerAvecFiltres((params) => {
      if (role === toutRole) {
        params.delete('role')
      } else {
        params.set('role', role)
      }
    })
  }

  function setFiltreTypologie(typologie: string): void {
    naviguerAvecFiltres((params) => {
      if (typologie === touteTypologie) {
        params.delete('typologie')
      } else {
        params.set('typologie', typologie)
      }
    })
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
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
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
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
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
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
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
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
    }
  }
}

const toutRole = 'toutRole'
const touteTypologie = 'touteTypologie'

type Props = Readonly<{
  membresViewModel: MembresViewModel
  peutGererGouvernance: boolean
}>

type StatutSelectionnable = 'candidat' | 'confirme'
