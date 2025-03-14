'use client'

import { ReactElement, useId, useState } from 'react'

import InformationPersonnelle from './InformationPersonnelle'
import ModifierMonCompte from './ModifierMonCompte'
import SupprimerMonCompte from './SupprimerMonCompte'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { MesInformationsPersonnellesViewModel } from '@/presenters/mesInformationsPersonnellesPresenter'

export default function MesInformationsPersonnelles({ mesInformationsPersonnellesViewModel }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supprimerMonCompteModalId = 'supprimer-mon-compte'
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerMesInformationsPersonnellesId'
  const labelId = useId()

  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div>
        <PageTitle>
          <TitleIcon icon="account-circle-line" />
          Mes informations
        </PageTitle>
        <p className="fr-text--sm color-grey">
          Retrouvez ici, les informations de votre compte.
        </p>
        <section
          aria-labelledby="mesInformationsPersonnelles"
          className="grey-border fr-p-4w fr-mb-4w"
        >
          <div className="fr-grid-row space-between fr-grid-row--middle">
            <h2
              className="fr-h6"
              id="mesInformationsPersonnelles"
            >
              Mes informations personnelles
            </h2>
            <button
              aria-controls={drawerId}
              className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
              data-fr-opened="false"
              onClick={() => {
                setIsDrawerOpen(true)
              }}
              type="button"
            >
              Modifier
            </button>
          </div>
          <hr />
          <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
            <InformationPersonnelle
              label="Nom"
              value={mesInformationsPersonnellesViewModel.nom}
            />
            <InformationPersonnelle
              label="Prénom"
              value={mesInformationsPersonnellesViewModel.prenom}
            />
            <InformationPersonnelle
              label="Adresse électronique"
              value={mesInformationsPersonnellesViewModel.emailDeContact}
            />
            <InformationPersonnelle
              label="Téléphone professionnel"
              value={mesInformationsPersonnellesViewModel.telephone}
            />
          </div>
        </section>
        {
          mesInformationsPersonnellesViewModel.structure ? (
            <section
              aria-labelledby="maStructure"
              className="grey-border fr-p-4w fr-mb-4w"
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
                  value={mesInformationsPersonnellesViewModel.structure.raisonSociale}
                />
                <InformationPersonnelle
                  label="Type de structure"
                  value={mesInformationsPersonnellesViewModel.structure.typeDeStructure}
                />
                <InformationPersonnelle
                  label={
                    <>
                      Numéro de
                      {' '}
                      <abbr title="Système d’Identification du Répertoire des ÉTablissements">
                        SIRET
                      </abbr>
                      {/**/}
                      /
                      {/**/}
                      <abbr title="Répertoire d’Identification des Entreprises et des ÉTablissements">
                        RIDET
                      </abbr>
                    </>
                  }
                  value={mesInformationsPersonnellesViewModel.structure.numeroDeSiret}
                />
                <InformationPersonnelle
                  label="Adresse"
                  value={mesInformationsPersonnellesViewModel.structure.adresse}
                />
              </div>
              <hr className="fr-mt-3w" />
              <h3 className="fr-text--md">
                Contact principal de la structure
              </h3>
              <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
                <InformationPersonnelle
                  label="Nom"
                  value={mesInformationsPersonnellesViewModel.structure.contact.nom}
                />
                <InformationPersonnelle
                  label="Prénom"
                  value={mesInformationsPersonnellesViewModel.structure.contact.prenom}
                />
                <InformationPersonnelle
                  label="Fonction dans la structure"
                  value={mesInformationsPersonnellesViewModel.structure.contact.fonction}
                />
                <InformationPersonnelle
                  label="Adresse électronique"
                  value={mesInformationsPersonnellesViewModel.structure.contact.email}
                />
              </div>
            </section>
          ) : null
        }
        <section
          aria-labelledby="monRole"
          className="grey-border fr-p-4w fr-mb-4w"
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
            <ExternalLink
              href="https://aide.conseiller-numerique.gouv.fr/fr/"
              title="Aide"
            >
              Contacter le support
            </ExternalLink>
            {' '}
            pour le modifier.
          </p>
          <Badge color="info">
            {mesInformationsPersonnellesViewModel.role}
          </Badge>
        </section>
        <section
          aria-labelledby="supprimerMonCompte"
          className="grey-border fr-p-4w fr-mb-4w"
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
              setIsModalOpen(true)
            }}
            type="button"
          >
            Supprimer mon compte
          </button>
        </section>
        <SupprimerMonCompte
          closeModal={() => {
            setIsModalOpen(false)
          }}
          email={mesInformationsPersonnellesViewModel.emailDeContact}
          id={supprimerMonCompteModalId}
          isOpen={isModalOpen}
        />
      </div>
      <Drawer
        boutonFermeture="Fermer la modification"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <ModifierMonCompte
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          email={mesInformationsPersonnellesViewModel.emailDeContact}
          id={drawerId}
          labelId={labelId}
          nom={mesInformationsPersonnellesViewModel.nom}
          prenom={mesInformationsPersonnellesViewModel.prenom}
          telephone={mesInformationsPersonnellesViewModel.telephoneBrut}
        />
      </Drawer>
    </div>
  )
}

type Props = Readonly<{
  mesInformationsPersonnellesViewModel: MesInformationsPersonnellesViewModel
}>
