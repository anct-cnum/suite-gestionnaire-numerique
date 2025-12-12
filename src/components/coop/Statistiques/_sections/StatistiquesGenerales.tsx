'use client'

import { useState } from 'react'

import { AccompagnementBarChart } from '../_components/AccompagnementBarChart'
import type { AccompagnementCountByPeriod, AccompagnementsStats } from '../types'
import { numberToString, sPluriel } from '../utils'
import Information from '@/components/shared/Information/Information'

export function StatistiquesGenerales({
  accompagnementsParJour,
  accompagnementsParMois,
  totalCounts,
}: {
  readonly accompagnementsParJour: AccompagnementCountByPeriod
  readonly accompagnementsParMois: AccompagnementCountByPeriod
  readonly totalCounts: AccompagnementsStats
}) {
  const [isAccompagnementCountByMonth, setIsAccompagnementCountByMonth] =
    useState(true)

  return (
    <>
      <h2 className="fr-h5 fr-text-mention--grey">
        <span aria-hidden className="fr-icon-line-chart-line fr-mr-1w" />
        Statistiques générales sur les accompagnements
      </h2>
      <div className="fr-grid-row fr-flex-gap-6v">
        <div
          style={{
            alignItems: 'flex-start',
            alignSelf: 'stretch',
            display: 'flex',
            flex: '1 0 0',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel"
            style={{ alignSelf: 'stretch', display: 'flex' }}
          >
            <div style={{ flex: '0 0 80%' }}>
              <span className="fr-h2 fr-mb-0">
                {numberToString(totalCounts.accompagnements.total)}
              </span>
              <div className="fr-text--bold fr-text--sm fr-mb-0 fr-mt-1v">
                <span>
                  Accompagnement
                  {sPluriel(totalCounts.accompagnements.total)}
                </span>
                <Information
                  children={
                    <p className="fr-mb-0">
                      Les ateliers collectifs comptent pour 1 accompagnement par participant.
                    </p>
                  }
                />
              </div>
            </div>
            <div
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                flex: '0 0 20%',
                justifyContent: 'flex-end',
              }}
            >
              <span
                aria-hidden
                className="fr-icon-service-line"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                  fontSize: '2rem',
                }}
              />
            </div>
          </div>
          <div
            className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-flex-grow-1"
            style={{ alignSelf: 'stretch', display: 'flex' }}
          >
            <div style={{ flex: '0 0 80%' }}>
              <span className="fr-h2 fr-mb-0">
                {numberToString(totalCounts.beneficiaires.total)}
              </span>
              <div className="fr-mt-2v">
                <div className="fr-text--sm fr-text--bold fr-mb-4v">
                  Bénéficiaire
                  {sPluriel(totalCounts.beneficiaires.total)} accompagné
                  {sPluriel(totalCounts.beneficiaires.total)}
                </div>
                <div className="fr-text-mention--grey fr-text--sm fr-mb-0">
                  <div>
                    <strong>{numberToString(totalCounts.beneficiaires.suivis)}</strong> bénéficiaire
                    {sPluriel(totalCounts.beneficiaires.suivis)} suivi
                    {sPluriel(totalCounts.beneficiaires.suivis)}
                  </div>
                  <div>
                    <strong>{numberToString(totalCounts.beneficiaires.anonymes)}</strong>{' '}
                    bénéficiaire
                    {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
                    {sPluriel(totalCounts.beneficiaires.anonymes)}
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                flex: '0 0 20%',
                justifyContent: 'flex-end',
              }}
            >
              <span
                aria-hidden
                className="fr-icon-user-heart-line"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                  fontSize: '2rem',
                }}
              />
            </div>
          </div>
        </div>
        <div className="fr-col fr-border fr-py-6v fr-px-8v fr-border-radius--16">
          <div className="fr-mb-3w">
            <div className="fr-mb-1w">
              <h3 className="fr-text--lg fr-mb-0">
                <span>Nombre d'accompagnements</span>
                <Information
                  children={
                    <p className="fr-mb-0">
                      Somme des accompagnements individuels et participations aux ateliers
                      collectifs.
                    </p>
                  }
                />
              </h3>
            </div>
            <fieldset className="fr-segmented fr-segmented--sm fr-md-col fr-col-12">
              <legend className="fr-segmented__legend sr-only">Bascule entre les périodes</legend>
              <div className="fr-segmented__elements">
                <div className="fr-segmented__element">
                  <input
                    checked={isAccompagnementCountByMonth}
                    id="period-month"
                    name="period"
                    onChange={() => {
                      setIsAccompagnementCountByMonth(true)
                    }}
                    type="radio"
                  />
                  <label className="fr-label" htmlFor="period-month">
                    Par mois
                  </label>
                </div>
                <div className="fr-segmented__element">
                  <input
                    checked={!isAccompagnementCountByMonth}
                    id="period-day"
                    name="period"
                    onChange={() => {
                      setIsAccompagnementCountByMonth(false)
                    }}
                    type="radio"
                  />
                  <label className="fr-label" htmlFor="period-day">
                    Par jour
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <AccompagnementBarChart
            data={isAccompagnementCountByMonth ? accompagnementsParMois : accompagnementsParJour}
          />
        </div>
      </div>
    </>
  )
}
