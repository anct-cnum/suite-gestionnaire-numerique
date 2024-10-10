'use client'

import Image from 'next/image'
import { ReactElement, useContext, useState } from 'react'

import DetailsUtilisateur from './DetailsUtilisateur'
import FiltrerMesUtilisateurs from './FiltrerMesUtilisateurs'
import SupprimerUnUtilisateur from './SupprimerUnUtilisateur'
import { TypologieRole } from '../../domain/Role'
import Drawer from '../shared/Drawer/Drawer'
import Pagination from '../shared/Pagination/Pagination'
import Rechercher from '../shared/Rechercher/Rechercher'
import Role from '../shared/Role/Role'
import Statut from '../shared/Statut/Statut'
import Tableau from '../shared/Tableau/Tableau'
import Titre from '../shared/Titre/Titre'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'
import { MesUtilisateursViewModel, MonUtilisateur } from '@/presenters/mesUtilisateursPresenter'

export default function MesUtilisateurs(
  { mesUtilisateursViewModel }: MesUtilisateursProps
): ReactElement {
  const { session } = useContext(sessionUtilisateurContext)
  // Stryker disable next-line BooleanLiteral
  const [isModaleSuppressionOpen, setIsModaleSuppressionOpen] = useState(false)
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState({ prenomEtNom: '', uid: '' })
  const modalId = 'supprimer-un-utilisateur'
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<Partial<MonUtilisateur>>({
    derniereConnexion: '',
    email: '',
    role: '' as TypologieRole,
    structure: '',
    telephone: '',
  })
  const drawerCompteId = 'drawer-modifier-mon-compte'
  const labelCompteId = 'drawer-modifier-mon-compte-titre'
  const drawerDetailsId = 'drawer-details-utilisateur'
  const labelDetailsId = 'drawer-details-utilisateur-nom'

  return (
    <>
      <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
        <Titre icon="team-line">
          Gestion de mes utilisateurs
        </Titre>
        <button
          className="fr-btn fr-btn--icon-left fr-icon-add-line"
          type="button"
        >
          Inviter une personne
        </button>
      </div>
      <Drawer
        boutonFermeture="Fermer les filtres"
        id={drawerCompteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelCompteId}
        setIsOpen={setIsDrawerOpen}
      >
        <FiltrerMesUtilisateurs
          id={drawerCompteId}
          labelId={labelCompteId}
          setIsOpen={setIsDrawerOpen}
        />
      </Drawer>
      {
        session.role.groupe === 'gestionnaire' ? (
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
                aria-controls={drawerCompteId}
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
              key={unUtilisateurViewModel.email}
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
                  aria-controls={drawerDetailsId}
                  className="primary font-weight-700 fr-px-0 no-hover d-block"
                  data-fr-opened="false"
                  onClick={() => {
                    setUtilisateurSelectionne(unUtilisateurViewModel)
                    setIsDrawerOpen(true)
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
        mesUtilisateursViewModel.totalUtilisateur > 10 ?
          (
            <div className="fr-grid-row fr-grid-row--center">
              <Pagination
                pageCourante={mesUtilisateursViewModel.pageCourante}
                pathname={'/mes-utilisateurs'}
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
        <DetailsUtilisateur utilisateur={utilisateurSelectionne} />
      </Drawer>
    </>
  )
}

type MesUtilisateursProps = Readonly<{
  mesUtilisateursViewModel: MesUtilisateursViewModel
}>
