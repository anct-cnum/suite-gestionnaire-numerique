'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import { StatistiquesActivitesData } from './AidantDetails'
import Bar from '@/components/shared/Bar/Bar'
import Information from '@/components/shared/Information/Information'

export default function AidantDetailsActivites(props: Props): ReactElement {
  const { data, nom, prenom } = props
  const statistiques = data
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPeriode = searchParams.get('periode') ?? 'mensuel'

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

  function renderEmptyState(nom: string, prenom:string): ReactElement {
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

  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--between fr-grid-row--top ">
        <div className="fr-col">
          <h2 className="fr-h4 fr-m-0">
            Activités
          </h2>
          <p className="fr-text--sm  fr-m-0">
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
      {(statistiques?.accompagnements.total ?? 0) === 0 ?renderEmptyState(nom, prenom) : (
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--stretch">
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
                    {statistiques?.accompagnements.total ?? 0}
                  </p>
                  <span
                    className="fr-icon-heart-line color-orange-terre-battue"
                    style={{ color: 'var(--brown-caramel-sun-425-moon-901-hover)', fontSize: '24px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p className="fr-text--sm fr-text--bold fr-mb-1v">
                    Accompagnements
                    <Information label="" />
                  </p>
                  <p className="fr-text--xs fr-mt-0">
                    Dont
                    {' '}
                    {statistiques?.accompagnements.avecAidantsConnect ?? 0}
                    {' '}
                    avec Aidants Connect
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="fr-col-12 fr-col-md-8" >
            <div
              className="fr-p-3w"
              style={{ borderColor: 'var(--grey-900-175)', borderRadius: '1rem' ,borderStyle: 'solid', borderWidth: '1px' }}
            >
              <div className="fr-grid-row fr-grid-row--between fr-grid-row--middle fr-mb-2w" >
                <h3 className="fr-h6 fr-col fr-mb-0">
                  Nombre d&apos;accompagnements
                  <Information label="" />
                </h3>
              </div>

              {/* Sélecteur segmenté DSFR Par mois / Par jours */}
              <fieldset className="fr-segmented fr-segmented--sm fr-mb-3w">
                <div className="fr-segmented__elements">
                  <div className="fr-segmented__element">
                    <input
                      checked={currentPeriode === 'mensuel'}
                      id="periode-mensuel"
                      name="periode"
                      onChange={() => { handlePeriodeChange('mensuel') }}
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
                      onChange={() => { handlePeriodeChange('journalier') }}
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
              </fieldset>

              <Bar
                backgroundColor={statistiques?.graphique.backgroundColor ?? ['#009099']}
                data={statistiques?.graphique.data ?? [0]}
                labels={Array.from(statistiques?.graphique.labels ?? ['Aucune donnée'])}
              />
            </div>
          </div>
        </div>)}
    </section>
  )
}

type Props = Readonly<{
  data?: StatistiquesActivitesData
  nom: string
  prenom: string
}>
