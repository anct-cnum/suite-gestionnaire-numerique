'use client'

import { useState } from 'react'

import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import { ProgressItemList } from '../_components/ProgressItemList'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { StatistiqueAccompagnement } from '../_components/StatistiqueAccompagnement'
import { StatistiqueMateriel } from '../_components/StatistiqueMateriel'
import {
  canauxAccompagnementColors,
  dureesAccompagnementColors,
  thematiquesAccompagnementColors,
} from '../colors'
import type { AccompagnementsStats, ActivitesStats } from '../types'
import { numberToString, sPluriel } from '../utils'
import Information from '@/components/shared/Information/Information'

type ThematiqueCategory = 'demarches' | 'thematiques'

const desc = (
  { count: countA }: { count: number },
  { count: countB }: { count: number }
) => countB - countA

const toMaxProportion = (
  max: number,
  { proportion }: { proportion: number }
) => proportion > max ? proportion : max

export function StatistiquesActivites({
  activites,
  totalCounts,
}: {
  readonly activites: ActivitesStats
  readonly totalCounts: AccompagnementsStats
}) {
  const [thematiqueCategory, setThematiqueCategory] =
    useState<ThematiqueCategory>('thematiques')

  return (
    <>
      <h2 className="fr-h5 fr-text-mention--grey">
        <span
          aria-hidden
          className="fr-icon-service-line fr-mr-1w"
        />
        Statistiques sur les activités
      </h2>
      {/* Bloc Types d'activité */}
      <div
        className="fr-background-alt--blue-france fr-mb-3w fr-border-radius--16"
        style={{
          alignItems: 'center',
          alignSelf: 'stretch',
          display: 'flex',
          gap: '24px',
          padding: '24px 32px',
        }}
      >
        {activites.typeActivites.map(({ count, proportion, value }) => (
          <StatistiqueAccompagnement
            count={count}
            key={value}
            proportion={proportion}
            typeActivite={value}
          >
            {value === 'Collectif' && (
              <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
                &nbsp;·&nbsp;
                <span className="fr-text--bold">
                  {numberToString(totalCounts.activites.collectifs.participants)}
                </span>
                {' '}
                participant
                {sPluriel(totalCounts.activites.collectifs.participants)}
              </span>
            )}
          </StatistiqueAccompagnement>
        ))}
      </div>

      {/* Bloc Thématiques (encadré gris) - contient Thématiques + Matériel */}
      <div
        className="fr-p-4w fr-mb-3w fr-border-radius--16"
        style={{ border: '1px solid var(--border-default-grey)' }}
      >
        {/* Thématiques des activités */}
        <div
          className="fr-mb-4v"
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: '24px',
            justifyContent: 'space-between',
          }}
        >
          <h3
            className="fr-text--lg fr-mb-0"
            style={{ flexShrink: 0 }}
          >
            <span>
              Thématiques des activités
            </span>
            <Information label="Thématiques sélectionnées lors de l'enregistrement d'une activité. Une activité peut avoir plusieurs thématiques." />
          </h3>
          <fieldset
            className="fr-segmented fr-segmented--sm"
            style={{ flexShrink: 0 }}
          >
            <legend className="fr-segmented__legend sr-only">
              Bascule entre les thématiques
            </legend>
            <div className="fr-segmented__elements">
              <div className="fr-segmented__element">
                <input
                  checked={thematiqueCategory === 'thematiques'}
                  id="cat-mediation"
                  name="thematique-category"
                  onChange={() => { setThematiqueCategory('thematiques') }}
                  type="radio"
                />
                <label
                  className="fr-label"
                  htmlFor="cat-mediation"
                >
                  Médiation numérique
                </label>
              </div>
              <div className="fr-segmented__element">
                <input
                  checked={thematiqueCategory === 'demarches'}
                  id="cat-demarches"
                  name="thematique-category"
                  onChange={() => { setThematiqueCategory('demarches') }}
                  type="radio"
                />
                <label
                  className="fr-label"
                  htmlFor="cat-demarches"
                >
                  Démarches administratives
                </label>
              </div>
            </div>
          </fieldset>
        </div>
        <ProgressItemList
          colors={thematiquesAccompagnementColors}
          items={
            thematiqueCategory === 'thematiques'
              ? activites.thematiques.sort(desc)
              : activites.thematiquesDemarches.sort(desc)
          }
          maxProportion={
            thematiqueCategory === 'thematiques'
              ? activites.thematiques.reduce(toMaxProportion, 0)
              : activites.thematiquesDemarches.reduce(toMaxProportion, 0)
          }
          oneLineLabel
        />

        {/* Séparateur */}
        <hr className="fr-separator-1px fr-my-4w" />

        {/* Matériel utilisé */}
        <div className="fr-mb-3w">
          <h3 className="fr-text--lg fr-mb-0">
            <span>
              Matériel utilisé
            </span>
            <Information label="Matériel utilisé lors d'une activité. Plusieurs matériels peuvent être utilisés lors d'une même activité." />
          </h3>
        </div>
        <div className="fr-grid-row fr-grid-row--gutters">
          {activites.materiels.map(({ count, label, proportion, value }) => (
            <StatistiqueMateriel
              className="fr-col-xl fr-col-4"
              count={count}
              key={value}
              label={label}
              proportion={proportion}
              value={value}
            />
          ))}
        </div>
      </div>

      {/* Canaux et Durées */}
      <div
        className="fr-p-4w fr-border-radius--16"
        style={{ border: '1px solid var(--border-default-grey)' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '64px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 className="fr-text--lg fr-mb-0 fr-mb-3w">
              <span>
                Canaux des activités
              </span>
              <Information label="Répartition des activités enregistrées par canal." />
            </h3>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: '48px',
              }}
            >
              <AccompagnementPieChart
                colors={canauxAccompagnementColors}
                data={activites.typeLieu}
                size={80}
                width={18}
              />
              <QuantifiedShareLegend
                colors={canauxAccompagnementColors}
                quantifiedShares={activites.typeLieu}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="fr-text--lg fr-mb-0 fr-mb-3w">
              <span>
                Durées des activités
              </span>
              <Information label="Répartition des activités enregistrées par durée." />
            </h3>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: '48px',
              }}
            >
              <AccompagnementPieChart
                colors={dureesAccompagnementColors}
                data={activites.durees}
                size={80}
                width={18}
              />
              <QuantifiedShareLegend
                colors={dureesAccompagnementColors}
                oneLineLabel
                quantifiedShares={activites.durees}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
