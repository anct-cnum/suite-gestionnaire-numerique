'use client'

import { ReactElement, useRef, useState } from 'react'

import InformationPersonnelle from './InformationPersonnelle'
import ModifierMonCompte from './ModifierMonCompte'
import SupprimerMonCompte from './SupprimerMonCompte'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import Role from '../shared/Role/Role'
import { MesInformationsPersonnellesViewModel } from '@/presenters/mesInformationsPersonnellesPresenter'

export default function MesInformationsPersonnelles(
  { mesInformationsPersonnellesViewModel }: Props
): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supprimerMonCompteModalId = 'supprimer-mon-compte'
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerModifierMonCompteRef = useRef<HTMLDialogElement>(null)
  const drawerId = 'drawer-modifier-mon-compte'
  const labelId = 'drawer-modifier-mon-compte-titre'

  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div>
        <PageTitle icon="account-circle-line">
          Mes informations
        </PageTitle>
        <p className="fr-text--sm color-grey">
          Retrouvez ici, les informations de votre compte.
        </p>
        <section
          aria-labelledby="mesInformationsPersonnelles"
          className="grey-border fr-p-4w fr-mb-4w"
        >
          <div className="fr-grid-row fr-btns-group--between fr-grid-row--middle">
            <h2 id="mesInformationsPersonnelles">
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
          email={mesInformationsPersonnellesViewModel.emailDeContact}
          id={supprimerMonCompteModalId}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
      </div>
      <Drawer
        boutonFermeture="Fermer la modification"
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
        ref={drawerModifierMonCompteRef}
        setIsOpen={setIsDrawerOpen}
      >
        <ModifierMonCompte
          dialogRef={drawerModifierMonCompteRef}
          email={mesInformationsPersonnellesViewModel.emailDeContact}
          id={drawerId}
          labelId={labelId}
          nom={mesInformationsPersonnellesViewModel.nom}
          prenom={mesInformationsPersonnellesViewModel.prenom}
          setIsOpen={setIsDrawerOpen}
          telephone={mesInformationsPersonnellesViewModel.telephoneBrut}
        />
      </Drawer>
    </div>
  )
}

type Props = Readonly<{
  mesInformationsPersonnellesViewModel: MesInformationsPersonnellesViewModel
}>
