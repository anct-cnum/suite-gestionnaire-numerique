'use client'

import Image from 'next/image'
import { ReactElement, useContext, useRef, useState } from 'react'

import DetailsUtilisateur from './DetailsUtilisateur'
import FiltrerMesUtilisateurs from './FiltrerMesUtilisateurs'
import InviterUnUtilisateur from './InviterUnUtilisateur'
import ReinviterUnUtilisateur from './ReinviterUnUtilisateur'
import SupprimerUnUtilisateur from './SupprimerUnUtilisateur'
import Drawer from '../shared/Drawer/Drawer'
import Pagination from '../shared/Pagination/Pagination'
import Rechercher from '../shared/Rechercher/Rechercher'
import Role from '../shared/Role/Role'
import Statut from '../shared/Statut/Statut'
import Tableau from '../shared/Tableau/Tableau'
import Titre from '../shared/Titre/Titre'
import { clientContext } from '@/components/shared/ClientContext'
import { MesUtilisateursViewModel, DetailsUtilisateurViewModel } from '@/presenters/mesUtilisateursPresenter'

export default function MesUtilisateurs(
  { mesUtilisateursViewModel }: MesUtilisateursProps
): ReactElement {
  const { sessionUtilisateurViewModel, utilisateursParPage } = useContext(clientContext)
  // Stryker disable next-line BooleanLiteral
  const [isModaleSuppressionOpen, setIsModaleSuppressionOpen] = useState(false)
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState({ prenomEtNom: '', uid: '' })
  const modalId = 'supprimer-un-utilisateur'
  const drawerInvitationRef = useRef<HTMLDialogElement>(null)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // Stryker disable next-line BooleanLiteral
  const [isDrawerRenvoyerInvitationOpen, setIsDrawerRenvoyerInvitationOpen] = useState(false)
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<DetailsUtilisateurViewModel>({
    derniereConnexion: '',
    email: '',
    inviteLe: '',
    prenomEtNom: '',
    role: '',
    structure: '',
    telephone: '',
  })
  const [utilisateurEnAttenteSelectionne, setUtilisateurEnAttenteSelectionne] = useState({
    email: '',
    inviteLe: '',
  })
  const drawerFiltreId = 'drawer-filtre-utilisateurs'
  const labelFiltreId = 'drawer-filtre-utilisateurs-titre'
  const drawerDetailsId = 'drawer-details-utilisateur'
  const labelDetailsId = 'drawer-details-utilisateur-nom'
  const drawerInvitationId = 'drawer-invitation'
  const labelInvitationId = 'drawer-invitation-titre'
  const drawerRenvoyerInvitationId = 'drawer-renvoyer-invitation'
  const labelRenvoyerInvitationId = 'drawer-renvoyer-invitation-titre'
  return (
    <>
      <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
        <Titre icon="team-line">
          Gestion de mes utilisateurs
        </Titre>
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
        id={drawerInvitationId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelInvitationId}
        ref={drawerInvitationRef}
        setIsOpen={setIsDrawerOpen}
      >
        <InviterUnUtilisateur
          dialogRef={drawerInvitationRef}
          labelId={labelInvitationId}
          setIsOpen={setIsDrawerOpen}
        />
      </Drawer>
      <Drawer
        boutonFermeture="Fermer les filtres"
        id={drawerFiltreId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelFiltreId}
        setIsOpen={setIsDrawerOpen}
      >
        <FiltrerMesUtilisateurs
          id={drawerFiltreId}
          labelId={labelFiltreId}
          setIsOpen={setIsDrawerOpen}
        />
      </Drawer>
      {
        sessionUtilisateurViewModel.role.groupe === 'gestionnaire' ? (
          <p>
            Gérez l’accès à l’espace de gestion
          </p>
        ) : (
          <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
            <Rechercher
              labelBouton="Rechercher"
              placeholder="Rechercher par nom ou adresse électronique"
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
        )
      }
      <Tableau
        enTetes={['', 'Utilisateur', 'Adresse électronique', 'Rôle', 'Dernière connexion', 'Statut', 'Action']}
        titre="Mes utilisateurs"
      >
        {mesUtilisateursViewModel.utilisateurs.map((unUtilisateurViewModel, index) => {
          return (
            <tr
              data-row-key={index}
              id={`table-sm-row-key-${index}`}
              key={unUtilisateurViewModel.uid}
            >
              <td className="fr-cell--center">
                <Image
                  alt=""
                  height={20}
                  src={`${unUtilisateurViewModel.picto}.svg`}
                  width={20}
                />
              </td>
              <td>
                <button
                  aria-controls={unUtilisateurViewModel.statut === 'En attente' ? drawerRenvoyerInvitationId : drawerDetailsId}
                  className="primary font-weight-700 fr-px-0 no-hover d-block"
                  data-fr-opened="false"
                  onClick={() => {
                    if (unUtilisateurViewModel.statut === 'En attente') {
                      setUtilisateurEnAttenteSelectionne({
                        email: unUtilisateurViewModel.email,
                        inviteLe: unUtilisateurViewModel.inviteLe,
                      })
                      setIsDrawerRenvoyerInvitationOpen(true)
                    } else {
                      setUtilisateurSelectionne(unUtilisateurViewModel)
                      setIsDrawerOpen(true)
                    }
                  }}
                  type="button"
                >
                  {unUtilisateurViewModel.prenomEtNom}
                </button>
                {unUtilisateurViewModel.structure}
              </td>
              <td>
                {unUtilisateurViewModel.email}
              </td>
              <td>
                <Role role={unUtilisateurViewModel.role} />
              </td>
              <td>
                {unUtilisateurViewModel.derniereConnexion}
              </td>
              <td>
                <Statut libelle={unUtilisateurViewModel.statut} />
              </td>
              <td className="fr-cell--center">
                <button
                  aria-controls={modalId}
                  className="fr-btn fr-btn--tertiary"
                  data-fr-opened="false"
                  disabled={!unUtilisateurViewModel.canBeDeleted}
                  onClick={() => {
                    setUtilisateurASupprimer(unUtilisateurViewModel)
                    setIsModaleSuppressionOpen(true)
                  }}
                  title="Supprimer"
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className={`fr-icon-delete-line ${unUtilisateurViewModel.canBeDeleted ? 'color-red' : 'color-grey'}`}
                  />
                </button>

              </td>
            </tr>
          )
        })}
      </Tableau>
      {
        mesUtilisateursViewModel.totalUtilisateur > utilisateursParPage ?
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
        id={modalId}
        isOpen={isModaleSuppressionOpen}
        setIsOpen={setIsModaleSuppressionOpen}
        setUtilisateurASupprimer={setUtilisateurASupprimer}
        utilisateurASupprimer={utilisateurASupprimer}
      />
      <Drawer
        boutonFermeture="Fermer le menu"
        id={drawerDetailsId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelDetailsId}
        setIsOpen={setIsDrawerOpen}
      >
        <DetailsUtilisateur
          labelId={labelDetailsId}
          utilisateur={utilisateurSelectionne}
        />
      </Drawer>
      <Drawer
        boutonFermeture="Fermer le menu"
        id={drawerRenvoyerInvitationId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerRenvoyerInvitationOpen}
        labelId={labelRenvoyerInvitationId}
        setIsOpen={setIsDrawerRenvoyerInvitationOpen}
      >
        <ReinviterUnUtilisateur
          labelId={labelRenvoyerInvitationId}
          utilisateur={utilisateurEnAttenteSelectionne}
        />
      </Drawer>
    </>
  )
}

type MesUtilisateursProps = Readonly<{
  mesUtilisateursViewModel: MesUtilisateursViewModel
}>
