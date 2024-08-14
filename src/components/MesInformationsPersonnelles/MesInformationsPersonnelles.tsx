'use client'

import { ReactElement, useState } from 'react'

import InformationPersonnelle from './InformationPersonnelle'
import Role from './Role'
import SupprimerMonCompte from './SupprimerMonCompte'
import Titre from './Titre'
import { MesInformationsPersonnellesViewModel } from '@/presenters/mesInformationsPersonnellesPresenter'

export default function MesInformationsPersonnelles(
  { mesInformationsPersonnellesViewModel }: MesInformationsPersonnellesProps
): ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const supprimerMonCompteModalId = 'supprimer-mon-compte'

  return (
    <>
      <Titre icon="account-circle-line">
        Mes informations
      </Titre>
      <p className="fr-text--sm color-grey">
        Retrouvez ici, les informations de votre compte.
      </p>
      <section
        aria-labelledby="mesInformationsPersonnelles"
        className="fr-card fr-p-4w fr-mb-4w"
      >
        <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
          <h2 id="mesInformationsPersonnelles">
            Mes informations personnelles
          </h2>
          <button
            className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
            type="button"
          >
            Modifier
          </button>
        </div>
        <hr />
        <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
          <InformationPersonnelle
            label="Nom"
            value={mesInformationsPersonnellesViewModel.informationsPersonnellesNom}
          />
          <InformationPersonnelle
            label="Prénom"
            value={mesInformationsPersonnellesViewModel.informationsPersonnellesPrenom}
          />
          <InformationPersonnelle
            label="Adresse éclectronique"
            value={mesInformationsPersonnellesViewModel.informationsPersonnellesEmail}
          />
          <InformationPersonnelle
            label="Téléphone professionnel"
            value={mesInformationsPersonnellesViewModel.informationsPersonnellesTelephone}
          />
        </div>
      </section>
      {
        mesInformationsPersonnellesViewModel.isStructure ? (
          <section
            aria-labelledby="maStructure"
            className="fr-card fr-p-4w fr-mb-4w"
          >
            <h2
              className="fr-h6"
              id="maStructure"
            >
              Ma structure
            </h2>
            <hr />
            <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
              <InformationPersonnelle
                label="Raison sociale"
                value={mesInformationsPersonnellesViewModel.structureRaisonSociale}
              />
              <InformationPersonnelle
                label="Type de structure"
                value={mesInformationsPersonnellesViewModel.structureTypeDeStructure}
              />
              <InformationPersonnelle
                label={
                  <>
                    Numéro de
                    {' '}
                    <abbr title="Système d’Identification du Répertoire des ÉTablissements">
                      SIRET
                    </abbr>
                  </>
                }
                value={mesInformationsPersonnellesViewModel.structureNumeroDeSiret}
              />
              <InformationPersonnelle
                label="Adresse"
                value={mesInformationsPersonnellesViewModel.structureAdresse}
              />
            </div>
            <hr className="fr-mt-3w" />
            <h3 className="fr-text--md">
              Contact principal de la structure
            </h3>
            <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
              <InformationPersonnelle
                label="Nom"
                value={mesInformationsPersonnellesViewModel.contactNom}
              />
              <InformationPersonnelle
                label="Prénom"
                value={mesInformationsPersonnellesViewModel.contactPrenom}
              />
              <InformationPersonnelle
                label="Fonction dans la structure"
                value={mesInformationsPersonnellesViewModel.contactFonction}
              />
              <InformationPersonnelle
                label="Adresse électronique"
                value={mesInformationsPersonnellesViewModel.contactEmail}
              />
            </div>
          </section>
        ) : null
      }
      <section
        aria-labelledby="monRole"
        className="fr-card fr-p-4w fr-mb-4w"
      >
        <h2
          className="fr-h6"
          id="monRole"
        >
          Mon rôle
        </h2>
        <p className="fr-text--sm color-grey">
          Le rôle qui vous est attribué donne accès à des fonctionnalités et des droits spécifiques.
          {' '}
          <a
            href="https://aide.conseiller-numerique.gouv.fr/fr/"
            rel="external noopener noreferrer"
            target="_blank"
          >
            Contacter le support
          </a>
          {' '}
          pour le modifier.
        </p>
        <Role role={mesInformationsPersonnellesViewModel.role} />
      </section>
      <section
        aria-labelledby="supprimerMonCompte"
        className="fr-card fr-p-4w fr-mb-4w"
      >
        <h2
          className="fr-h6"
          id="supprimerMonCompte"
        >
          Supprimer mon compte
        </h2>
        <p className="fr-text--sm color-grey">
          En supprimant votre compte, vous n’aurez plus la possibilité d’accéder à cette plateforme.
        </p>
        <hr />
        <button
          aria-controls={supprimerMonCompteModalId}
          className="fr-btn red-button"
          data-fr-opened="false"
          onClick={() => {
            setIsOpen(true)
          }}
          type="button"
        >
          Supprimer mon compte
        </button>
      </section>
      <SupprimerMonCompte
        email={mesInformationsPersonnellesViewModel.informationsPersonnellesEmail}
        id={supprimerMonCompteModalId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

type MesInformationsPersonnellesProps = Readonly<{
  mesInformationsPersonnellesViewModel: MesInformationsPersonnellesViewModel
}>
