'use client'

import Link from 'next/link'
import { ReactElement, useState } from 'react'

import AccompagnementsEtMediateurs from './AccompagnementsEtMediateurs'
import NiveauDeFormation from './NiveauDeFormation'
import InformationLogo from '../shared/InformationLogo/InformationLogo'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsEtMediateursViewModel } from '@/presenters/tableauDeBord/accompagnementsEtMediateursPresenter'
import { NiveauDeFormationViewModel } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'

export default function AidantsMediateurs({
  accompagnementsEtMediateursViewModel,
  dateGeneration,
  niveauDeFormationViewModel,
}: Props): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  function handleOpenDrawer(): void {
    setIsDrawerOpen(true)
  }
  function handleCloseDrawer(): void {
    setIsDrawerOpen(false)
  }
  return (
    <>
      <div className="fr-grid-row fr-grid-row--middle fr-mb-4w">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="team-line" />
            Aidants et médiateurs numériques
          </PageTitle>
          <p className="fr-text--lg fr-mb-0">
            L&apos;ensemble des personnes dont le rôle et de faire de la médiation numérique
          </p>
        </div>
        <div className="fr-col-auto">
          <Link
            className="fr-btn fr-btn--icon-right fr-icon-arrow-right-line"
            href="#"
          >
            Suivi des médiateurs
          </Link>
        </div>
      </div>

      <div className="fr-mb-4w">
        <div className="fr-alert fr-alert--error fr-mb-4w">
          <p className="fr-alert__title">
            🚧 Page en construction
          </p>
          <p>
            Cette page est actuellement en développement. Les données présentées ne correspondent pas à la 
            réalité et sont uniquement à des fins de démonstration.
          </p>
        </div>
      </div>

      <div className="fr-mb-4w">
        <div className="fr-grid-row background-info fr-p-3w fr-grid-row--middle">
          <div className="fr-col">
            <div className="fr-grid-row fr-grid-row--middle">
              <InformationLogo />
              <span>
                Aidants, médiateurs, conseillers numériques, … : Quelles différences ?
              </span>
            </div>
          </div>
          <div className="fr-col-auto">
            <button
              className="fr-link"
              onClick={handleOpenDrawer}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#000091',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline', 
              }}
              type="button"
            >
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      <div className="fr-mb-4w">
        <AccompagnementsEtMediateurs
          accompagnementsEtMediateurs={accompagnementsEtMediateursViewModel}
          dateGeneration={dateGeneration}
        />
      </div>

      <div className="fr-mb-4w">
        <NiveauDeFormation
          dateGeneration={dateGeneration}
          niveauDeFormation={niveauDeFormationViewModel}
        />
      </div>

      {isDrawerOpen ? (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            height: '100vh',
            left: 0,
            position: 'fixed',
            top: 0,
            width: '100vw',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              height: '100vh',
              padding: '2rem',
              position: 'absolute',
              right: 0,
              width: '400px',
            }}
          >
            <button
              onClick={handleCloseDrawer}
              style={{ float: 'right' }}
              type="button"
            >
              ✕ Fermer
            </button>
            <h1>
              Les aidants et médiateurs numériques
            </h1>
            
            <div className="fr-text--md">
              <p className="fr-mb-3w">
                <strong>
                  Médiateur numérique
                </strong>
                {' '}
                : un médiateur numérique a pour cœur de métier d&apos;accompagner la montée en compétences 
                de ceux qui le souhaitent sur le numérique mais aussi d&apos;initier à la culture numérique.
              </p>
              
              <p className="fr-mb-3w">
                <strong>
                  Conseiller Numérique
                </strong>
                {' '}
                : un médiateur numérique dont le poste est cofinancé par l&apos;État dans le cadre du dispositif 
                Conseiller numérique.
              </p>
              
              <p className="fr-mb-3w">
                <strong>
                  Aidant numérique
                </strong>
                {' '}
                : la notion d&apos;aidant numérique recouvre une grande diversité d&apos;acteurs. 
                Nous entendons par aidant numérique les professionnels en première ligne face aux usagers 
                en difficultés avec le numérique alors même que l&apos;accompagnement des publics dans leurs 
                usages numériques ne constitue pas toujours le cœur de leurs missions. Par exemple, les travailleurs 
                sociaux, les agents d&apos;accueil en collectivité territoriale ou dans des agences de services 
                publics (Pôle Emploi, CAF, etc), les animateurs jeunesse sont des aidants numériques.
              </p>
              
              <p className="fr-mb-3w">
                <strong>
                  Aidants Connect
                </strong>
                {' '}
                : service public numérique qui permet à des aidants professionnels habilités de réaliser 
                des démarches administratives en ligne de manière légale et sécurisée pour le compte de 
                personnes en difficulté avec les outils numériques.
              </p>
            </div>
          </div>
        </div>
      ) : null}

    </>
  )
}

type Props = Readonly<{
  accompagnementsEtMediateursViewModel: AccompagnementsEtMediateursViewModel | ErrorViewModel
  dateGeneration: Date
  niveauDeFormationViewModel: ErrorViewModel | NiveauDeFormationViewModel
}>