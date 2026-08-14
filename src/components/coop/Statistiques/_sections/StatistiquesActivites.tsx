'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { Fragment, useState } from 'react'
import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { StatistiqueAccompagnement } from '../_components/StatistiqueAccompagnement'
import { StatistiqueMateriel } from '../_components/StatistiqueMateriel'
import {
  canauxAccompagnementColors,
  dureesAccompagnementColors,
  tagsColor,
  thematiquesAccompagnementColors,
} from '../colors'
import type { AccompagnementsStats, ActivitesStats, QuantifiedShare } from '../types'
import { numberToString, sPluriel } from '../utils'

type AccompagnementCategory = 'thematiques' | 'demarches' | 'tags'

const desc = ({ count: countA }: { count: number }, { count: countB }: { count: number }) => countB - countA

export const StatistiquesActivites = ({
  activites,
  totalCounts,
}: {
  activites: ActivitesStats
  structures?: QuantifiedShare[]
  communes?: QuantifiedShare[]
  totalCounts: AccompagnementsStats
}) => {
  const [accompagnementCategory, setAccompagnementCategory] = useState<AccompagnementCategory>('thematiques')

  const segmentMediationNumerique = {
    label: 'Médiation numérique',
    nativeInputProps: {
      checked: accompagnementCategory === 'thematiques',
      onChange: () => setAccompagnementCategory('thematiques'),
    },
  }
  const segmentDemarches = {
    label: 'Démarches administratives',
    nativeInputProps: {
      checked: accompagnementCategory === 'demarches',
      onChange: () => setAccompagnementCategory('demarches'),
    },
  }
  const segmentTags = {
    label: (
      <>
        <span className="ri-price-tag-3-line" aria-hidden />
        &ensp;Tags spécifiques
      </>
    ),
    nativeInputProps: {
      checked: accompagnementCategory === 'tags',
      onChange: () => setAccompagnementCategory('tags'),
    },
  }

  const accompagnementCategories = [
    {
      category: 'thematiques',
      title: 'Thématiques des accompagnements de médiation numérique',
      description:
        "Thématiques sélectionnées lors de l'enregistrement d'un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques.",
      items: activites.thematiques.sort(desc),
      colors: thematiquesAccompagnementColors,
      limite: undefined,
    },
    {
      category: 'demarches',
      title: 'Thématiques des accompagnements de démarches administratives',
      description:
        "Thématiques des démarches administratives sélectionnées lors de l'enregistrement d'un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques administratives.",
      items: activites.thematiquesDemarches.sort(desc),
      colors: thematiquesAccompagnementColors,
      limite: undefined,
    },
    // Tags absents (vue France) : ni la catégorie ni le segment ne sont rendus
    ...(activites.tags === undefined
      ? []
      : [
          {
            category: 'tags',
            title: 'Tags spécifiques',
            description:
              "Tags spécifiques sélectionnés lors de l'enregistrement d'un accompagnement. À noter : un accompagnement peut avoir plusieurs tags.",
            items: activites.tags.sort(desc),
            colors: tagsColor,
            // Jusqu'à ~50 tags dans un département : top 10 + « Voir tous », comme les lieux/communes de la Coop
            limite: { count: 10, hideLabel: 'Réduire', showLabel: 'Voir tous les tags' },
          },
        ]),
  ]

  return (
    <>
      <h3 className="fr-h5 fr-text-mention--grey">
        <span className="ri-service-line fr-mr-1w" aria-hidden />
        Statistiques sur les accompagnements
      </h3>
      <div className="fr-background-alt--blue-france fr-px-8v fr-py-6v fr-mb-3w fr-border-radius--16 fr-grid-row fr-flex-gap-12v fr-position-relative">
        {activites.typeActivites.map(({ count, proportion, value }) => (
          <StatistiqueAccompagnement
            key={value}
            className="fr-col-xl fr-col-12"
            typeActivite={value}
            count={count}
            proportion={proportion}
          >
            {value === 'Collectif' && (
              <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
                &nbsp;·&nbsp;sur{' '}
                <span className="fr-text--bold">{numberToString(totalCounts.activites.collectifs.total)}</span> atelier
                {sPluriel(totalCounts.activites.collectifs.total)}
              </span>
            )}
          </StatistiqueAccompagnement>
        ))}
      </div>
      <div className="fr-border fr-p-4w fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16">
        <div className="fr-flex">
          <SegmentedControl
            className="fr-md-col fr-col-12 fr-ml-auto"
            hideLegend
            legend="Bascule entre les thématiques"
            segments={
              activites.tags === undefined
                ? [segmentMediationNumerique, segmentDemarches]
                : [segmentMediationNumerique, segmentDemarches, segmentTags]
            }
          />
        </div>
        <hr className="fr-separator-8v" />
        {accompagnementCategories.map(
          ({ category, title, description, items, colors, limite }) =>
            category === accompagnementCategory && (
              <Fragment key={category}>
                <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v">
                  <div className="fr-mb-0 fr-flex fr-align-items-center">
                    <h4 className="fr-text--md fr-mb-0 fr-text--nowrap">{title}</h4>
                    <Button
                      className="fr-px-1v fr-ml-1v"
                      title={`Plus d'information à propos des ${title.toLowerCase()}`}
                      priority="tertiary no outline"
                      size="small"
                      type="button"
                      aria-describedby={`tooltip-accompagnement-${category}`}
                    >
                      <span className="ri-information-line fr-text--lg" aria-hidden />
                    </Button>
                    <span
                      className="fr-tooltip fr-placement"
                      id={`tooltip-accompagnement-${category}`}
                      role="tooltip"
                      aria-hidden
                    >
                      {description}
                    </span>
                  </div>
                </div>
                <QuantifiedShareList
                  colors={colors}
                  limit={limite}
                  oneLineLabel
                  quantifiedShares={items}
                  tooltipKey={category}
                />
              </Fragment>
            )
        )}
      </div>
      <div className="fr-border fr-p-8v fr-pb-10v fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16 fr-position-relative">
        <div className="fr-col fr-flex fr-align-items-center fr-mb-8v">
          <h4 className="fr-text--md fr-mb-0">Matériel utilisé lors des accompagnements</h4>
          <Button
            className="fr-px-1v fr-ml-1v"
            title="Plus d'information à propos du matériel utilisé"
            priority="tertiary no outline"
            size="small"
            type="button"
            aria-describedby="tooltip-meteriel-utilise"
          >
            <span className="ri-information-line fr-text--lg" aria-hidden />
          </Button>
          <span className="fr-tooltip fr-placement" id="tooltip-meteriel-utilise" role="tooltip" aria-hidden>
            Matériel utilisé lors d'un accompagnement de médiation numérique. À noter&nbsp;: Plusieurs matériels ont pu
            être utilisés lors d'un même accompagnement.
          </span>
        </div>
        <div className="fr-flex fr-flex-wrap fr-justify-content-space-between fr-flex-gap-6v fr-px-4v">
          {activites.materiels.map(({ value, label, count, proportion }) => (
            <StatistiqueMateriel key={value} value={value} label={label} count={count} proportion={proportion} />
          ))}
        </div>
      </div>
      <div className="fr-border fr-p-4w fr-background-default--grey fr-border-radius--16 fr-position-relative">
        <div className="fr-flex fr-flex-wrap fr-flex-gap-16v">
          <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
            <h4 className="fr-text--md fr-mb-4v">Canaux des accompagnements</h4>
            <div className="fr-flex fr-align-items-center">
              <AccompagnementPieChart
                className="fr-flex-shrink-0"
                size={80}
                width={18}
                data={activites.typeLieu}
                colors={canauxAccompagnementColors}
              />
              <QuantifiedShareLegend
                className="fr-pl-3w"
                quantifiedShares={activites.typeLieu}
                colors={canauxAccompagnementColors}
              />
            </div>
          </div>
          <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
            <h4 className="fr-text--md fr-mb-4v">Durée des accompagnements</h4>
            <div className="fr-flex fr-align-items-center">
              <AccompagnementPieChart
                className="fr-flex-shrink-0"
                size={80}
                width={18}
                data={activites.durees}
                colors={dureesAccompagnementColors}
              />
              <QuantifiedShareLegend
                className="fr-pl-3w"
                quantifiedShares={activites.durees}
                colors={dureesAccompagnementColors}
                oneLineLabel
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
