'use client'

import Image from 'next/image'
import { ReactElement, useContext } from 'react'

import Titre from '../MesInformationsPersonnelles/Titre'
import Pagination from '../shared/Pagination/Pagination'
import Rechercher from '../shared/Rechercher/Rechercher'
import Role from '../shared/Role/Role'
import Statut from '../shared/Statut/Statut'
import Tableau from '../shared/Tableau/Tableau'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'
import { MesUtilisateursViewModel } from '@/presenters/mesUtilisateursPresenter'

export default function MesUtilisateurs(
  { mesUtilisateursViewModel }: MesUtilisateursProps
): ReactElement {
  const { session } = useContext(sessionUtilisateurContext)
  const groupeGestionnaire = [
    'Gestionnaire département',
    'Gestionnaire région',
    'Gestionnaire structure',
    'Gestionnaire groupement',
  ]

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
      {
        groupeGestionnaire.includes(session.role.nom) ? (
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
                className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-filter-line fr-mr-2w"
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
                  src={`${unUtilisateurViewModel.categorie}.svg`}
                  width={20}
                />
              </td>
              <td>
                <div className="font-weight-700">
                  {unUtilisateurViewModel.prenomEtNom}
                </div>
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
                  className="fr-btn fr-btn--tertiary"
                  disabled={!unUtilisateurViewModel.canBeDeleted}
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
      <div className="fr-grid-row fr-grid-row--center">
        <Pagination
          pageCourante={mesUtilisateursViewModel.pageCourante}
          totalUtilisateurs={mesUtilisateursViewModel.totalUtilisateur}
        />
      </div>
    </>
  )
}

type MesUtilisateursProps = Readonly<{
  mesUtilisateursViewModel: MesUtilisateursViewModel
}>
