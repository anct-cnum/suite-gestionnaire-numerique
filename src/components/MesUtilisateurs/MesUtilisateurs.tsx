'use client'

import Image from 'next/image'
import { ReactElement, useContext, useId, useRef, useState } from 'react'

import DetailsUtilisateur from './DetailsUtilisateur'
import FiltrerMesUtilisateurs from './FiltrerMesUtilisateurs'
import InviterUnUtilisateur from './InviterUnUtilisateur'
import ReinviterUnUtilisateur from './ReinviterUnUtilisateur'
import SupprimerUnUtilisateur from './SupprimerUnUtilisateur'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import Role from '../shared/Role/Role'
import Search from '../shared/Search/Search'
import Statut from '../shared/Statut/Statut'
import Table from '../shared/Table/Table'
import { clientContext } from '@/components/shared/ClientContext'
import { MesUtilisateursViewModel, DetailsUtilisateurViewModel, MonUtilisateur } from '@/presenters/mesUtilisateursPresenter'

export default function MesUtilisateurs(
  { mesUtilisateursViewModel }: Props
): ReactElement {
  const { sessionUtilisateurViewModel, router } = useContext(clientContext)
  // Stryker disable next-line BooleanLiteral
  const [isModaleSuppressionOpen, setIsModaleSuppressionOpen] = useState(false)
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState({ prenomEtNom: '', uid: '' })
  const modalId = 'supprimer-un-utilisateur'
  const drawerInvitationRef = useRef<HTMLDialogElement>(null)
  const drawerRenvoyerInvitationRef = useRef<HTMLDialogElement>(null)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerRenvoyerInvitationOpen, setIsDrawerRenvoyerInvitationOpen] = useState(false)
  const [termesDeRechercheNomOuEmail, setTermesDeRechercheNomOuEmail] = useState('')
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<DetailsUtilisateurViewModel>({
    derniereConnexion: '',
    emailDeContact: '',
    inviteLe: '',
    prenomEtNom: '',
    role: '',
    structure: '',
    telephone: '',
  })
  const [utilisateurEnAttenteSelectionne, setUtilisateurEnAttenteSelectionne] = useState({
    email: '',
    inviteLe: '',
    uid: '',
  })
  const drawerFiltreId = 'drawer-filtre-utilisateurs'
  const labelFiltreId = useId()
  const drawerDetailsId = 'drawer-details-utilisateur'
  const labelDetailsId = useId()
  const drawerInvitationId = 'drawer-invitation'
  const labelInvitationId = useId()
  const drawerRenvoyerInvitationId = 'drawer-renvoyer-invitation'
  const labelRenvoyerInvitationId = useId()

  return (
    <>
      <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
        <PageTitle icon="team-line">
          {sessionUtilisateurViewModel.role.doesItBelongToGroupeAdmin ? 'Gestion de mes utilisateurs' : `Utilisateurs · ${sessionUtilisateurViewModel.role.libelle}`}
        </PageTitle>
        <button
          aria-controls={drawerInvitationId}
          className="fr-btn fr-btn--icon-left fr-icon-add-line"
          data-fr-opened="false"
          onClick={() => {
            setIsDrawerOpen(true)
          }}
          type="button"
        >
          Inviter une personne
        </button>
      </div>
      <Drawer
        boutonFermeture="Fermer l’invitation"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerInvitationId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelInvitationId}
        ref={drawerInvitationRef}
      >
        <InviterUnUtilisateur
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          dialogRef={drawerInvitationRef}
          labelId={labelInvitationId}
          rolesAvecStructure={mesUtilisateursViewModel.rolesAvecStructure}
        />
      </Drawer>
      {
        sessionUtilisateurViewModel.role.doesItBelongToGroupeAdmin ? (
          <>
            <Drawer
              boutonFermeture="Fermer les filtres"
              closeDrawer={() => {
                setIsDrawerOpen(false)
              }}
              id={drawerFiltreId}
              // Stryker disable next-line BooleanLiteral
              isFixedWidth={false}
              isOpen={isDrawerOpen}
              labelId={labelFiltreId}
            >
              <FiltrerMesUtilisateurs
                closeDrawer={() => {
                  setIsDrawerOpen(false)
                }}
                id={drawerFiltreId}
                labelId={labelFiltreId}
                resetSearch={() => {
                  setTermesDeRechercheNomOuEmail('')
                }}
              />
            </Drawer>
            <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
              <Search
                labelBouton="Rechercher"
                placeholder="Rechercher par nom ou adresse électronique"
                rechercher={(event) => {
                  setTermesDeRechercheNomOuEmail(event.target.value)
                }}
                reinitialiserBouton="Reinitialiser"
                reinitialiserLesTermesDeRechercheNomOuEmail={reinitialiserLesTermesDeRechercheNomOuEmail}
                soumettreLaRecherche={soumettreLaRecherche}
                termesDeRechercheNomOuEmail={termesDeRechercheNomOuEmail}
              />
              <div>
                <button
                  aria-controls={drawerFiltreId}
                  className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-filter-line fr-mr-2w"
                  data-fr-opened="false"
                  onClick={() => {
                    setIsDrawerOpen(true)
                  }}
                  type="button"
                >
                  Filtrer
                </button>
                <button
                  className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line"
                  type="button"
                >
                  Exporter
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>
            Gérez l’accès à l’espace de gestion
          </p>
        )
      }
      {
        mesUtilisateursViewModel.totalUtilisateur === 0
          ? (
            <p>
              Aucun utilisateur ne correspond aux filtres sélectionnés.
            </p>
          )
          : (
            <Table
              enTetes={['', 'Utilisateur', 'Adresse électronique', 'Rôle', 'Dernière connexion', 'Statut', 'Action']}
              titre="Mes utilisateurs"
            >
              {mesUtilisateursViewModel.utilisateurs.map((unUtilisateurViewModel, index) => (
                <tr
                  data-row-key={index}
                  id={`table-sm-row-key-${index}`}
                  key={unUtilisateurViewModel.uid}
                >
                  <td className="fr-cell--center">
                    <Image
                      alt=""
                      height={20}
                      src={`${process.env.NEXT_PUBLIC_HOST}/${unUtilisateurViewModel.picto}.svg`}
                      width={20}
                    />
                  </td>
                  <td>
                    <button
                      aria-controls={unUtilisateurViewModel.isActif ? drawerDetailsId : drawerRenvoyerInvitationId}
                      className="primary font-weight-700 fr-px-0 no-hover d-block"
                      data-fr-opened="false"
                      onClick={afficherLeBonDrawer(unUtilisateurViewModel)}
                      type="button"
                    >
                      {unUtilisateurViewModel.prenomEtNom}
                    </button>
                    {unUtilisateurViewModel.structure}
                  </td>
                  <td>
                    {unUtilisateurViewModel.emailDeContact}
                  </td>
                  <td>
                    <Role role={unUtilisateurViewModel.role} />
                  </td>
                  <td>
                    {unUtilisateurViewModel.derniereConnexion}
                  </td>
                  <td>
                    <Statut
                      color={unUtilisateurViewModel.statut.couleur}
                      libelle={unUtilisateurViewModel.statut.libelle}
                    />
                  </td>
                  <td className="fr-cell--center">
                    <button
                      aria-controls={modalId}
                      className="fr-btn fr-btn--tertiary"
                      data-fr-opened="false"
                      disabled={!unUtilisateurViewModel.deleteButton.isDisabled}
                      onClick={() => {
                        setUtilisateurASupprimer(unUtilisateurViewModel)
                        setIsModaleSuppressionOpen(true)
                      }}
                      title="Supprimer"
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className={`fr-icon-delete-line ${unUtilisateurViewModel.deleteButton.color}`}
                      />
                    </button>

                  </td>
                </tr>
              ))}
            </Table>
          )
      }
      {
        mesUtilisateursViewModel.displayPagination ?
          (
            <div className="fr-grid-row fr-grid-row--center">
              <Pagination
                pathname="/mes-utilisateurs"
                totalUtilisateurs={mesUtilisateursViewModel.totalUtilisateur}
              />
            </div>
          ) : null
      }
      <SupprimerUnUtilisateur
        closeModal={() => {
          setIsModaleSuppressionOpen(false)
        }}
        id={modalId}
        isOpen={isModaleSuppressionOpen}
        utilisateurASupprimer={utilisateurASupprimer}
      />
      <Drawer
        boutonFermeture="Fermer les détails"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerDetailsId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelDetailsId}
      >
        <DetailsUtilisateur
          labelId={labelDetailsId}
          utilisateur={utilisateurSelectionne}
        />
      </Drawer>
      <Drawer
        boutonFermeture="Fermer la réinvitation"
        closeDrawer={() => {
          setIsDrawerRenvoyerInvitationOpen(false)
        }}
        id={drawerRenvoyerInvitationId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerRenvoyerInvitationOpen}
        labelId={labelRenvoyerInvitationId}
        ref={drawerRenvoyerInvitationRef}
      >
        <ReinviterUnUtilisateur
          closeDrawer={() => {
            setIsDrawerRenvoyerInvitationOpen(false)
          }}
          drawerId={drawerRenvoyerInvitationId}
          labelId={labelRenvoyerInvitationId}
          utilisateur={utilisateurEnAttenteSelectionne}
        />
      </Drawer>
    </>
  )

  function afficherLeBonDrawer(unUtilisateurViewModel: MonUtilisateur) {
    return () => {
      if (unUtilisateurViewModel.isActif) {
        setUtilisateurSelectionne(unUtilisateurViewModel)
        setIsDrawerOpen(true)
      } else {
        setUtilisateurEnAttenteSelectionne({
          email: unUtilisateurViewModel.emailDeContact,
          inviteLe: unUtilisateurViewModel.inviteLe,
          uid: unUtilisateurViewModel.uid,
        })
        setIsDrawerRenvoyerInvitationOpen(true)
      }
    }
  }

  function soumettreLaRecherche(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const cloneUrlAvecParametres = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)
    cloneUrlAvecParametres.searchParams.delete('page')
    cloneUrlAvecParametres.searchParams.set('prenomOuNomOuEmail', termesDeRechercheNomOuEmail)
    router.push(cloneUrlAvecParametres.toString())
  }

  function reinitialiserLesTermesDeRechercheNomOuEmail(): void {
    setTermesDeRechercheNomOuEmail('')
    const cloneUrlAvecParametres = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)
    cloneUrlAvecParametres.searchParams.delete('prenomOuNomOuEmail')
    router.push(cloneUrlAvecParametres.toString())
  }
}

type Props = Readonly<{
  mesUtilisateursViewModel: MesUtilisateursViewModel
}>
