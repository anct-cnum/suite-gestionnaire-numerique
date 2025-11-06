'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import { StatistiquesActivitesData } from './AidantDetails'
import Bar from '@/components/shared/Bar/Bar'
import Information from '@/components/shared/Information/Information'

export default function AidantDetailsActivites(props: Props) : ReactElement {
  const { data, nom, prenom } = props
  const statistiques = data
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPeriode = searchParams.get('periode') ?? 'mensuel'
  const totalAccompagnements = statistiques?.accompagnements.total ?? 0
  const hasActivites = totalAccompagnements > 0

  function handlePeriodeChange(nouvellePeriode: 'journalier' | 'mensuel'): void {
    const params = new URLSearchParams(searchParams.toString())
    if (nouvellePeriode === 'mensuel') {
      params.delete('periode')
    } else {
      params.set('periode', nouvellePeriode)
    }
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`${window.location.pathname + newUrl }#activites`)
  }

  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--between fr-grid-row--top ">
        <div className="fr-col">
          <h2 className="fr-h3 fr-m-0">
            Activités
          </h2>
          <p className="fr-text--sm fr-text-mention--grey fr-m-0">
            Statistiques des activités du médiateur
          </p>
        </div>
        <div
          className="fr-col-auto"
          style={{ display: 'none' }}
        >
          <button
            className="fr-link fr-icon-arrow-right-line fr-link--icon-right"
            type="button"
          >
            Voir plus de statistiques
          </button>
        </div>
      </div>
      {hasActivites ? (
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--stretch">
          <AccompagnementsCard statistiques={statistiques} />
          <GraphiqueCard
            currentPeriode={currentPeriode}
            onPeriodeChange={handlePeriodeChange}
            statistiques={statistiques}
          />
        </div>
      ) : (
        <EmptyState
          nom={nom}
          prenom={prenom}
        />
      )}
    </section>
  )
}

function EmptyState({ nom, prenom }: Readonly<{ nom: string; prenom: string }>): ReactElement {
  return (
    <div
      className="fr-mt-2w"
      style={{ backgroundColor: 'var(--brown-caramel-975-75)', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}
    >
      <p
        className="fr-text--md fr-mb-0"
        style={{ textAlign: 'center' }}
      >
        <span className="fr-text--bold">
          👻 Aucune activité trouvée
        </span>
        {' '}
        pour
        {' '}
        {nom}
        {' '}
        {prenom}
      </p>
    </div>
  )
}

function AccompagnementsCard({ statistiques }: Readonly<{ statistiques?: StatistiquesActivitesData }>): ReactElement {
  const total = statistiques?.accompagnements.total ?? 0
  const individuels = statistiques?.accompagnements.individuels ?? 0
  const participationsAteliers = statistiques?.accompagnements.participationsAteliers ?? 0
  const nombreAteliers = statistiques?.accompagnements.nombreAteliers ?? 0
  const avecAidantsConnect = statistiques?.accompagnements.avecAidantsConnect ?? 0

  const informationLabel = `${total.toLocaleString('fr-FR')} accompagnements au total dont :
${individuels.toLocaleString('fr-FR')} accompagnements individuels
${participationsAteliers.toLocaleString('fr-FR')} participations lors de ${nombreAteliers.toLocaleString('fr-FR')} ateliers*
*Les ateliers collectifs comptent pour 1 accompagnement par participant.
Ex : Un atelier collectif avec 10 participants compte pour 10 accompagnements.

${avecAidantsConnect.toLocaleString('fr-FR')} accompagnements avec Aidants Connect`

  return (
    <div className="fr-col-12 fr-col-md-4">
      <div className="d-flex flex-column">
        <div
          className="fr-p-3w fr-background-alt--brown-caramel"
          style={{ borderRadius: '1rem' }}
        >
          <div style={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between' }}>
            <p
              className="fr-text--xl fr-mb-1w fr-text--heavy"
              style={{ fontSize: '48px', lineHeight: '1', margin: 0 }}
            >
              {total}
            </p>
            <span
              className="fr-icon-heart-line color-orange-terre-battue"
              style={{ color: 'var(--brown-caramel-sun-425-moon-901-hover)', fontSize: '24px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="fr-text--sm fr-text--bold fr-mb-1v">
              Accompagnements
              <Information label={informationLabel} />
            </p>
            <p className="fr-text--xs fr-mt-0">
              Dont
              {' '}
              {avecAidantsConnect}
              {' '}
              avec Aidants Connect
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PeriodeSelector({ currentPeriode, onPeriodeChange }: PeriodeSelectorProps): ReactElement {
  return (
    <fieldset
      className="fr-segmented fr-segmented--sm fr-mb-3w"
      style={{ width: '100%' }}
    >
      <div className="fr-segmented__elements">
        <div className="fr-segmented__element">
          <input
            checked={currentPeriode === 'mensuel'}
            id="periode-mensuel"
            name="periode"
            onChange={() => { onPeriodeChange('mensuel') }}
            type="radio"
            value="mensuel"
          />
          <label
            className="fr-label"
            htmlFor="periode-mensuel"
          >
            Par mois
          </label>
        </div>
        <div className="fr-segmented__element">
          <input
            checked={currentPeriode === 'journalier'}
            id="periode-journalier"
            name="periode"
            onChange={() => { onPeriodeChange('journalier') }}
            type="radio"
            value="journalier"
          />
          <label
            className="fr-label"
            htmlFor="periode-journalier"
          >
            Par jours
          </label>

        </div>
      </div>
      <div
        style={{ display: 'block', textAlign: 'right', width: '100%' }}
      >
        {currentPeriode === 'journalier' && (
          <p
            className="fr-text--sm fr-text--right fr-text-mention--grey"
            style={{ margin: 0 }}
          >
            Les 30 derniers jours
          </p>
        )}
        {currentPeriode === 'mensuel' && (
          <p
            className="fr-text--sm fr-text--right fr-text-mention--grey"
            style={{ margin: 0 }}
          >
            Les 12 derniers mois
          </p>
        )}
      </div>
    </fieldset>
  )
}

function GraphiqueCard({ currentPeriode, onPeriodeChange, statistiques }: GraphiqueCardProps): ReactElement {
  const backgroundColor = statistiques?.graphique.backgroundColor ?? ['#009099']
  const data = statistiques?.graphique.data ?? [0]
  const labels = Array.from(statistiques?.graphique.labels ?? ['Aucune donnée'])

  return (
    <div className="fr-col-12 fr-col-md-8" >
      <div
        className="fr-p-3w"
        style={{ borderColor: 'var(--grey-900-175)', borderRadius: '1rem' ,borderStyle: 'solid', borderWidth: '1px' }}
      >
        <div className="fr-grid-row fr-grid-row--between fr-grid-row--middle fr-mb-2w" >
          <h3 className="fr-h6 fr-col fr-mb-0">
            Nombre d&apos;accompagnements
            <Information label="
Le nombre d'accompagnements correspond à la somme des 2 types d'activités enregistrées : accompagnement individuel et atelier collectif.

À noter : Les ateliers collectifs comptent pour 1 accompagnement par participant.
Ex : Un atelier collectif avec 10 participants compte pour 10 accompagnements."
            />
          </h3>
        </div>

        <PeriodeSelector
          currentPeriode={currentPeriode}
          onPeriodeChange={onPeriodeChange}
        />

        <Bar
          backgroundColor={backgroundColor}
          data={data}
          labels={labels}
        />
      </div>
    </div>
  )
}

type Props = Readonly<{
  data?: StatistiquesActivitesData
  nom: string
  prenom: string
}>

type PeriodeSelectorProps = Readonly<{
  currentPeriode: string
  onPeriodeChange(periode: 'journalier' | 'mensuel'): void
}>

type GraphiqueCardProps = Readonly<{
  currentPeriode: string
  onPeriodeChange(periode: 'journalier' | 'mensuel'): void
  statistiques?: StatistiquesActivitesData
}>
