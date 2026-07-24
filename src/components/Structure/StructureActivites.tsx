'use client'

import Link from 'next/link'
import { ReactElement, ReactNode, useId, useState } from 'react'

import Bar from '@/components/shared/Bar/Bar'
import Information from '@/components/shared/Information/Information'
import { ActivitesStructureViewModel } from '@/presenters/activitesStructurePresenter'

export default function StructureActivites({ viewModel }: Props): ReactElement {
  return (
    <section
      aria-labelledby="activites"
      className="grey-border border-radius fr-mb-2w fr-p-4w"
      id="activites"
      style={{ scrollMarginTop: '56px' }}
    >
      <header className="fr-mb-3w">
        <div className="fr-grid-row space-between">
          <div>
            <h2 className="fr-h6 fr-m-0">Activités</h2>
            <p className="fr-text--sm color-grey">Statistiques des activités de la structure.</p>
          </div>
          <div>
            <Link className="fr-link fr-icon-arrow-right-line fr-link--icon-right" href={viewModel.lienStatistiques}>
              Statistiques de la structure
            </Link>
          </div>
        </div>
      </header>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-4">
          <CarteIndicateur
            couleurPastille="var(--green-archipel-main-557)"
            libelle="Accompagnements de médiation numérique"
            valeur={viewModel.totalMediationNumerique}
          >
            Somme des accompagnements réalisés par les médiateurs et conseillers numériques qui sont ou ont été en
            contrat dans la structure.
          </CarteIndicateur>
          <CarteIndicateur
            couleurPastille="var(--pink-tuile-main-556)"
            libelle="Accompagnements Aidants Connect"
            valeur={viewModel.totalAidantsConnect}
          >
            Accompagnements réalisés via la plateforme Aidants Connect par les aidants de la structure.
          </CarteIndicateur>
          <CarteBeneficiaires beneficiaires={viewModel.beneficiaires} />
        </div>
        <GraphiqueCard graphique={viewModel.graphique} />
      </div>
    </section>
  )
}

function CarteIndicateur({
  children,
  couleurPastille,
  libelle,
  valeur,
}: Readonly<{
  children: ReactNode
  couleurPastille: string
  libelle: string
  valeur: string
}>): ReactElement {
  return (
    <div className="fr-p-3w fr-mb-2w fr-background-alt--brown-caramel" style={{ borderRadius: '1rem' }}>
      <p className="fr-h4 fr-mb-1w" style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
        <span
          aria-hidden="true"
          style={{
            backgroundColor: couleurPastille,
            borderRadius: '50%',
            display: 'inline-block',
            height: '1rem',
            width: '1rem',
          }}
        />
        {valeur}
      </p>
      <p className="fr-text--sm fr-text--bold fr-m-0">
        {libelle}
        <Information>{children}</Information>
      </p>
    </div>
  )
}

function CarteBeneficiaires({
  beneficiaires,
}: Readonly<{ beneficiaires: ActivitesStructureViewModel['beneficiaires'] }>): ReactElement {
  return (
    <div className="fr-p-3w fr-background-alt--brown-caramel" style={{ borderRadius: '1rem' }}>
      <div style={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between' }}>
        <p className="fr-h4 fr-mb-1w">{beneficiaires.accompagnes}</p>
        <span
          aria-hidden="true"
          className="fr-icon-heart-line"
          style={{ color: 'var(--brown-caramel-sun-425-moon-901-hover)' }}
        />
      </div>
      <p className="fr-text--sm fr-text--bold fr-mb-2w">Bénéficiaires accompagnés</p>
      <p className="fr-text--sm fr-mb-1v">{beneficiaires.suivis} bénéficiaires suivis</p>
      <p className="fr-text--sm fr-m-0">
        {beneficiaires.anonymes} bénéficiaires anonymes
        <Information>
          Bénéficiaires déclarés par les médiateurs et conseillers numériques de la structure : les bénéficiaires suivis
          disposent d&apos;une fiche, les bénéficiaires anonymes non.
        </Information>
      </p>
    </div>
  )
}

function GraphiqueCard({ graphique }: Readonly<{ graphique: ActivitesStructureViewModel['graphique'] }>): ReactElement {
  const [periode, setPeriode] = useState<'journalier' | 'mensuel'>('mensuel')
  const idMensuel = useId()
  const idJournalier = useId()
  const serie = periode === 'mensuel' ? graphique.parMois : graphique.parJour

  return (
    <div className="fr-col-12 fr-col-md-8">
      <div className="grey-border border-radius fr-p-3w">
        <h3 className="fr-h6 fr-mb-2w">
          Nombre d&apos;accompagnements
          <Information>
            Somme des accompagnements de médiation numérique enregistrés (accompagnements individuels et participations
            aux ateliers collectifs) et, sur la vue mensuelle, des accompagnements Aidants Connect.
          </Information>
        </h3>
        <fieldset className="fr-segmented fr-segmented--sm fr-mb-1w">
          <legend className="fr-sr-only">Période du graphique</legend>
          <div className="fr-segmented__elements">
            <div className="fr-segmented__element">
              <input
                checked={periode === 'mensuel'}
                id={idMensuel}
                name="periode"
                onChange={() => {
                  setPeriode('mensuel')
                }}
                type="radio"
                value="mensuel"
              />
              <label className="fr-label" htmlFor={idMensuel}>
                Par mois
              </label>
            </div>
            <div className="fr-segmented__element">
              <input
                checked={periode === 'journalier'}
                id={idJournalier}
                name="periode"
                onChange={() => {
                  setPeriode('journalier')
                }}
                type="radio"
                value="journalier"
              />
              <label className="fr-label" htmlFor={idJournalier}>
                Par jours
              </label>
            </div>
          </div>
        </fieldset>
        <p className="fr-text--sm color-grey fr-mb-1w">
          {periode === 'mensuel' ? 'Les 6 derniers mois' : 'Les 30 derniers jours'}
        </p>
        {/* Sur la vue mensuelle, les accompagnements Aidants Connect sont en bas de l'empilement,
            la médiation numérique au-dessus */}
        <Bar
          backgroundColor={
            serie.aidantsConnect === undefined ? serie.backgroundColor : serie.aidantsConnect.backgroundColor
          }
          data={serie.aidantsConnect === undefined ? serie.data : serie.aidantsConnect.data}
          labels={[...serie.labels]}
          serieEmpilee={
            serie.aidantsConnect === undefined
              ? undefined
              : { backgroundColor: serie.backgroundColor, data: serie.data, label: 'Médiation numérique' }
          }
          titreSerie={serie.aidantsConnect === undefined ? 'Médiation numérique' : 'Aidants Connect'}
        />
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: ActivitesStructureViewModel
}>
