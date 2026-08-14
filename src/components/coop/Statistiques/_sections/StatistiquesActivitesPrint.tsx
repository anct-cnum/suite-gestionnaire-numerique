'use client'

// Adapté de la Coop : apps/web/src/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesActivitesPrint.tsx
import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import { ProgressItemList } from '../_components/ProgressItemList'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import { StatistiqueMateriel } from '../_components/StatistiqueMateriel'
import {
  canauxAccompagnementColors,
  communeColor,
  dureesAccompagnementColors,
  tagsColor,
  thematiquesAccompagnementColors,
} from '../colors'
import type { AccompagnementsStats, ActivitesStats, QuantifiedShare } from '../types'
import { numberToPercentage, numberToString, sPluriel } from '../utils'

const desc = ({ count: countA }: { count: number }, { count: countB }: { count: number }) => countB - countA

const toMaxProportion = (max: number, { proportion }: { proportion: number }) => (proportion > max ? proportion : max)

export const StatistiquesActivitesPrint = ({
  activites,
  structures,
  totalCounts,
}: {
  activites: ActivitesStats
  structures?: QuantifiedShare[]
  totalCounts: AccompagnementsStats
}) => {
  const accompagnementCategories = [
    {
      category: 'thematiques',
      title: 'Médiation numérique',
      items: activites.thematiques.sort(desc),
      colors: thematiquesAccompagnementColors,
      maxProportion: activites.thematiques.reduce(toMaxProportion, 0),
    },
    {
      category: 'demarches',
      title: 'Démarches administratives',
      items: activites.thematiquesDemarches.sort(desc),
      colors: thematiquesAccompagnementColors,
      maxProportion: activites.thematiquesDemarches.reduce(toMaxProportion, 0),
    },
    ...(activites.tags === undefined
      ? []
      : [
          {
            category: 'tags',
            title: 'Tags spécifiques',
            items: activites.tags.sort(desc),
            colors: tagsColor,
            maxProportion: activites.tags.reduce(toMaxProportion, 0),
          },
        ]),
  ]

  return (
    <>
      <div className="print-bloc-insecable">
        <h2 className="fr-h3">Statistiques sur les accompagnements</h2>
        <h3 className="fr-h5">Types d&apos;activités</h3>
        <ul>
          {activites.typeActivites.map(({ count, label, proportion, value }) => (
            <li key={value}>
              <b>{numberToString(count)}</b> {label}
              {value === 'Collectif' &&
                ` · sur ${numberToString(totalCounts.activites.collectifs.total)} atelier${sPluriel(
                  totalCounts.activites.collectifs.total
                )}`}{' '}
              ({numberToPercentage(proportion)} des activités)
            </li>
          ))}
        </ul>
      </div>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Thématiques des accompagnements</h3>
      <small className="fr-mb-6v fr-display-block" role="note">
        Thématiques sélectionnées lors de l&apos;enregistrement d&apos;un accompagnement. À noter&nbsp;: un
        accompagnement peut avoir plusieurs thématiques.
      </small>
      {accompagnementCategories.map(({ category, title, items, maxProportion, colors }) => (
        <div className="print-bloc-insecable" key={category}>
          <h4 className="fr-h6 fr-mb-2v fr-mt-6v">{title}</h4>
          <ProgressItemList items={items} maxProportion={maxProportion} colors={colors} />
        </div>
      ))}
      <div className="print-bloc-insecable">
        <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Matériel utilisé lors des accompagnements</h3>
        <small className="fr-mb-6v fr-display-block" role="note">
          Matériel utilisé lors d&apos;un accompagnement de médiation numérique. À noter&nbsp;: Plusieurs matériels ont
          pu être utilisés lors d&apos;un même accompagnement.
        </small>
        <div className="fr-flex fr-flex-wrap fr-justify-content-space-between fr-flex-gap-6v fr-px-4v">
          {activites.materiels.map(({ value, label, count, proportion }) => (
            <StatistiqueMateriel key={value} value={value} label={label} count={count} proportion={proportion} />
          ))}
        </div>
      </div>
      <div className="print-bloc-insecable">
        <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Canaux des accompagnements</h3>
        <small className="fr-mb-6v fr-display-block" role="note">
          Répartition des accompagnements enregistrés par canal.
        </small>
        <div className="fr-flex fr-align-items-center">
          <AccompagnementPieChart
            size={128}
            data={activites.typeLieu}
            colors={canauxAccompagnementColors}
            isAnimationActive={false}
          />
          <QuantifiedShareLegend
            className="fr-pl-3w"
            quantifiedShares={activites.typeLieu}
            colors={canauxAccompagnementColors}
          />
        </div>
      </div>
      <div className="print-bloc-insecable">
        <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Durée des accompagnements</h3>
        <small className="fr-mb-6v fr-display-block" role="note">
          Répartition des accompagnements enregistrés par durée.
        </small>
        <div className="fr-flex fr-align-items-center">
          <AccompagnementPieChart
            size={128}
            data={activites.durees}
            colors={dureesAccompagnementColors}
            isAnimationActive={false}
          />
          <QuantifiedShareLegend
            className="fr-pl-3w"
            quantifiedShares={activites.durees}
            colors={dureesAccompagnementColors}
          />
        </div>
      </div>
      {structures !== undefined && structures.length > 0 && (
        <>
          <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Nombre d&apos;accompagnements par lieux</h3>
          <small className="fr-mb-6v fr-display-block" role="note">
            Répartition des accompagnements enregistrés par lieu d&apos;activité.
          </small>
          <QuantifiedShareList order="desc" quantifiedShares={structures} color={communeColor} />
        </>
      )}
    </>
  )
}
