'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { ReactNode } from 'react'
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
import { NiveauTitreSection, niveauxDeTitre, numberToString, sPluriel } from '../utils'
import ongletsStyles from './OngletsSegmentes.module.css'
import styles from './StatistiquesActivites.module.css'

const desc = ({ count: countA }: { count: number }, { count: countB }: { count: number }) => countB - countA

export const StatistiquesActivites = ({
  activites,
  totalCounts,
  niveauTitre = 'h3',
}: {
  activites: ActivitesStats
  structures?: QuantifiedShare[]
  communes?: QuantifiedShare[]
  totalCounts: AccompagnementsStats
  niveauTitre?: NiveauTitreSection
}) => {
  const { bloc: TitreBloc, section: TitreSection } = niveauxDeTitre(niveauTitre)
  const accompagnementCategories = [
    {
      category: 'thematiques',
      onglet: 'Médiation numérique' as ReactNode,
      title: 'Thématiques des accompagnements de médiation numérique',
      description:
        "Thématiques sélectionnées lors de l'enregistrement d'un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques.",
      items: activites.thematiques.sort(desc),
      colors: thematiquesAccompagnementColors,
      limite: undefined,
    },
    {
      category: 'demarches',
      onglet: 'Démarches administratives' as ReactNode,
      title: 'Thématiques des accompagnements de démarches administratives',
      description:
        "Thématiques des démarches administratives sélectionnées lors de l'enregistrement d'un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques administratives.",
      items: activites.thematiquesDemarches.sort(desc),
      colors: thematiquesAccompagnementColors,
      limite: undefined,
    },
    // Tags absents (vue France) : ni la catégorie ni son onglet ne sont rendus
    ...(activites.tags === undefined
      ? []
      : [
          {
            category: 'tags',
            onglet: (
              <>
                <span className="ri-price-tag-3-line" aria-hidden />
                &ensp;Tags spécifiques
              </>
            ),
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
      <TitreSection className="fr-h5 fr-text-mention--grey">
        <span className="ri-service-line fr-mr-1w" aria-hidden />
        Statistiques sur les accompagnements
      </TitreSection>
      <div className="fr-background-alt--blue-france fr-px-4v fr-px-md-8v fr-py-6v fr-mb-3w fr-border-radius--16 fr-grid-row fr-flex-gap-12v fr-position-relative">
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
      <div className="fr-border fr-p-2w fr-p-md-4w fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16">
        {/* #2352 (RGAA 7.1) : onglets DSFR canoniques (motif ARIA Tabs, activation automatique), gérés par le JS du DSFR */}
        <div className={`fr-tabs ${ongletsStyles.ongletsSegmentes}`}>
          <ul aria-label="Affichage des thématiques des accompagnements" className="fr-tabs__list" role="tablist">
            {accompagnementCategories.map(({ category, onglet }, index) => (
              <li key={category} role="presentation">
                <button
                  aria-controls={`accompagnements-${category}-panneau`}
                  aria-selected={index === 0}
                  className="fr-tabs__tab"
                  id={`accompagnements-${category}-onglet`}
                  role="tab"
                  tabIndex={index === 0 ? 0 : -1}
                  type="button"
                >
                  {onglet}
                </button>
              </li>
            ))}
          </ul>
          {accompagnementCategories.map(({ category, title, description, items, colors, limite }, index) => (
            <div
              aria-label={title}
              className={`fr-tabs__panel${index === 0 ? ' fr-tabs__panel--selected' : ''}`}
              id={`accompagnements-${category}-panneau`}
              key={category}
              role="tabpanel"
              tabIndex={0}
            >
              <div className="fr-flex fr-align-items-center fr-mb-6v">
                <TitreBloc className="fr-text--md fr-mb-0">{title}</TitreBloc>
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
              <QuantifiedShareList colors={colors} limit={limite} quantifiedShares={items} tooltipKey={category} />
            </div>
          ))}
        </div>
      </div>
      <div className="fr-border fr-p-4v fr-p-md-8v fr-pb-10v fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16 fr-position-relative">
        <div className="fr-col fr-flex fr-align-items-center fr-mb-8v">
          <TitreBloc className="fr-text--md fr-mb-0">Matériel utilisé lors des accompagnements</TitreBloc>
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
      <div className="fr-border fr-p-2w fr-p-md-4w fr-background-default--grey fr-border-radius--16 fr-position-relative">
        <div className="fr-flex fr-flex-wrap fr-flex-gap-16v">
          <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
            <TitreBloc className="fr-text--md fr-mb-4v">Canaux des accompagnements</TitreBloc>
            <div className={`fr-flex fr-align-items-center ${styles.camembertEtLegende}`}>
              <AccompagnementPieChart
                className="fr-flex-shrink-0"
                size={80}
                width={18}
                data={activites.typeLieu}
                colors={canauxAccompagnementColors}
              />
              <QuantifiedShareLegend quantifiedShares={activites.typeLieu} colors={canauxAccompagnementColors} />
            </div>
          </div>
          <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
            <TitreBloc className="fr-text--md fr-mb-4v">Durée des accompagnements</TitreBloc>
            <div className={`fr-flex fr-align-items-center ${styles.camembertEtLegende}`}>
              <AccompagnementPieChart
                className="fr-flex-shrink-0"
                size={80}
                width={18}
                data={activites.durees}
                colors={dureesAccompagnementColors}
              />
              <QuantifiedShareLegend quantifiedShares={activites.durees} colors={dureesAccompagnementColors} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
