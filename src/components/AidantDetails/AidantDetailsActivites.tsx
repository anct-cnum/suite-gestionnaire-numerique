'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import { StatistiquesActivitesData } from './AidantDetails'
import Bar from '@/components/shared/Bar/Bar'
import Information from '@/components/shared/Information/Information'

export default function AidantDetailsActivites(props: Props): ReactElement {
  const { data } = props
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
    router.push(window.location.pathname + newUrl)
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

            {/* Boutons de bascule Par mois / Par jours */}
            <div
              className="fr-mb-3w"
              style={{ display: 'flex', gap: '0' }}
            >
              <button
                className={`fr-btn fr-btn--sm ${currentPeriode === 'mensuel' ? 'fr-btn--primary' : 'fr-btn--secondary'}`}
                onClick={() => { handlePeriodeChange('mensuel') }}
                style={{
                  border: currentPeriode === 'mensuel' ? '1px solid #000091' : '1px solid #929292',
                  borderRadius: '0.25rem 0 0 0.25rem',
                }}
                type="button"
              >
                Par mois
              </button>
              <button
                className={`fr-btn fr-btn--sm ${currentPeriode === 'journalier' ? 'fr-btn--primary' : 'fr-btn--secondary'}`}
                onClick={() => { handlePeriodeChange('journalier') }}
                style={{
                  border: currentPeriode === 'journalier' ? '1px solid #000091' : '1px solid #929292',
                  borderRadius: '0 0.25rem 0.25rem 0',
                  marginLeft: '-1px',
                }}
                type="button"
              >
                Par jours
              </button>
            </div>

            <Bar
              backgroundColor={statistiques?.graphique.backgroundColor ?? ['#009099']}
              data={statistiques?.graphique.data ?? [0]}
              labels={Array.from(statistiques?.graphique.labels ?? ['Aucune donnée'])}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  data?: StatistiquesActivitesData
}>
