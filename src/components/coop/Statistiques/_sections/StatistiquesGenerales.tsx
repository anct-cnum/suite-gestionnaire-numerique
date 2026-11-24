'use client'

import { AccompagnementBarChart } from '../_components/AccompagnementBarChart'
import { BoutonInformationCoop } from '../_components/BoutonInformationCoop'
import type { AccompagnementCountByPeriod, AccompagnementsStats, TableauDeDonneesViewModel } from '../types'
import { NiveauTitreSection, niveauxDeTitre, numberToString, sPluriel } from '../utils'
import styles from './OngletsSegmentes.module.css'
import DonneesEnTableau from '@/components/shared/DonneesEnTableau/DonneesEnTableau'
import InformationDepliable, { TexteInformation } from '@/components/shared/Information/InformationDepliable'

export const StatistiquesGenerales = ({
  totalCounts,
  accompagnementsParMois,
  accompagnementsParJour,
  tableauAccompagnementsParJour,
  tableauAccompagnementsParMois,
  niveauTitre = 'h3',
}: {
  accompagnementsParJour: AccompagnementCountByPeriod
  accompagnementsParMois: AccompagnementCountByPeriod
  tableauAccompagnementsParJour: TableauDeDonneesViewModel
  tableauAccompagnementsParMois: TableauDeDonneesViewModel
  totalCounts: AccompagnementsStats
  niveauTitre?: NiveauTitreSection
}) => {
  const { bloc: TitreBloc, section: TitreSection, tableau: niveauTitreTableau } = niveauxDeTitre(niveauTitre)
  const periodes = [
    {
      accompagnements: accompagnementsParMois,
      id: 'accompagnements-par-mois',
      nomDuPanneau: 'Nombre d’accompagnements par mois',
      onglet: 'Par mois',
      tableau: tableauAccompagnementsParMois,
    },
    {
      accompagnements: accompagnementsParJour,
      id: 'accompagnements-par-jour',
      nomDuPanneau: 'Nombre d’accompagnements par jour',
      onglet: 'Par jour',
      tableau: tableauAccompagnementsParJour,
    },
  ]

  return (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v">
        <TitreSection className="fr-h5 fr-text-mention--grey fr-mb-0">
          <span className="ri-line-chart-line fr-mr-1w" aria-hidden />
          Statistiques générales sur les accompagnements
        </TitreSection>
      </div>
      <div className="fr-grid-row fr-flex-gap-6v fr-background-default--grey fr-border-radius--16">
        <div className="fr-flex fr-direction-column fr-flex-gap-6v fr-col-xl-4 fr-col-12">
          <div className="fr-px-4v fr-px-md-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-width-full">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0">{numberToString(totalCounts.accompagnements.total)}</span>
              <span
                className="ri-service-line ri-2x"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                }}
                aria-hidden
              />
            </div>
            {/* MIN (#2350, RGAA 7.3) : le « i » déplie son texte dans la page au lieu d'une infobulle */}
            <InformationDepliable>
              <div className="fr-text--bold fr-text--sm fr-mb-0 fr-mt-1v">
                Accompagnement{sPluriel(totalCounts.accompagnements.total)}{' '}
                <BoutonInformationCoop className="fr-px-2v" libelle="Plus d'information à propos des accompagnements" />
              </div>
              <TexteInformation>
                <p className="fr-text--sm fr-mb-0">
                  {numberToString(totalCounts.accompagnements.total)} accompagnements au total dont&nbsp;:
                </p>
                {/* MIN (#2350) : puces de liste rétablies, masquées par le style global des listes */}
                <ul className="fr-list fr-text--sm fr-pl-2w fr-mb-0">
                  <li>
                    {numberToString(totalCounts.accompagnements.individuels.total)} accompagnement
                    {sPluriel(totalCounts.accompagnements.individuels.total)} individuel
                    {sPluriel(totalCounts.accompagnements.individuels.total)}
                  </li>
                  <li>
                    {numberToString(totalCounts.activites.collectifs.participants)} participation
                    {sPluriel(totalCounts.activites.collectifs.participants)} lors de{' '}
                    {numberToString(totalCounts.activites.collectifs.total)} ateliers*
                  </li>
                </ul>
                <p className="fr-text--sm fr-mb-0">
                  *Les ateliers collectifs comptent pour 1 accompagnement par participant. Ex&nbsp;: Un atelier
                  collectif avec 10 participants compte pour 10 accompagnements.
                </p>
              </TexteInformation>
            </InformationDepliable>
          </div>
          <div className="fr-px-4v fr-px-md-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-flex-grow-1">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0 fr-text--nowrap">{numberToString(totalCounts.beneficiaires.total)}</span>
              <span
                className="ri-user-heart-line ri-2x"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                }}
                aria-hidden
              />
            </div>
            <div className="fr-mt-2v">
              <div className="fr-text--sm fr-text--bold fr-mb-0">
                Bénéficiaire{sPluriel(totalCounts.beneficiaires.total)} accompagné
                {sPluriel(totalCounts.beneficiaires.total)}
              </div>
            </div>
            <div className="fr-text-mention--grey fr-text--sm fr-mb-0 fr-mt-4v">
              <div>
                <strong>{numberToString(totalCounts.beneficiaires.suivis)}</strong> bénéficiaire
                {sPluriel(totalCounts.beneficiaires.suivis)} suivi
                {sPluriel(totalCounts.beneficiaires.suivis)}
              </div>
              <InformationDepliable>
                <div>
                  <strong>{numberToString(totalCounts.beneficiaires.anonymes)}</strong> bénéficiaire
                  {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
                  {sPluriel(totalCounts.beneficiaires.anonymes)}
                  <BoutonInformationCoop
                    className="fr-px-1v fr-ml-1v"
                    libelle="Plus d'information à propos des bénéficiaires anonymes"
                  />
                </div>
                <TexteInformation>
                  Les bénéficiaires anonymes sont comptabilisés comme 1 nouveau bénéficiaire à chaque accompagnement.
                </TexteInformation>
              </InformationDepliable>
            </div>
          </div>
        </div>
        {/* #2251 : fr-min-width-0 : le tableau défile dans son conteneur au lieu d'élargir la colonne en mobile */}
        <div className="fr-col fr-min-width-0 fr-border fr-pt-6v fr-pb-4v fr-px-4v fr-px-md-8v fr-border-radius--16 fr-flex fr-direction-column">
          <InformationDepliable>
            <div className="fr-mb-3w fr-flex fr-align-items-center">
              <TitreBloc className="fr-text--lg fr-mb-0">Nombre d'accompagnements</TitreBloc>
              <BoutonInformationCoop
                className="fr-px-1v fr-ml-1v"
                libelle="Plus d'information à propos du nombre d'accompagnements"
              />
            </div>
            <TexteInformation>
              <p className="fr-text--sm fr-mb-2w">
                Le nombre d'accompagnements correspond à la somme des 2 types d'activités enregistrées&nbsp;:
                accompagnement individuel et atelier collectif.
              </p>
              <p className="fr-text--sm fr-mb-3w">
                À noter&nbsp;: Les ateliers collectifs comptent pour 1 accompagnement par participant. Ex&nbsp;: Un
                atelier collectif avec 10 participants compte pour 10 accompagnements.
              </p>
            </TexteInformation>
          </InformationDepliable>
          {/* #2352 (RGAA 7.1) : onglets DSFR canoniques (motif ARIA Tabs, activation automatique), gérés par le JS
              du DSFR. Chaque panneau porte son histogramme et son tableau : le tableau suit toujours l'histogramme */}
          <div className={`fr-tabs fr-flex-grow-1 ${styles.ongletsSegmentes}`}>
            <ul aria-label="Affichage des données d'accompagnement" className="fr-tabs__list" role="tablist">
              {periodes.map(({ id, onglet }, index) => (
                <li key={id} role="presentation">
                  <button
                    aria-controls={`${id}-panneau`}
                    aria-selected={index === 0}
                    className="fr-tabs__tab"
                    id={`${id}-onglet`}
                    role="tab"
                    tabIndex={index === 0 ? 0 : -1}
                    type="button"
                  >
                    {onglet}
                  </button>
                </li>
              ))}
            </ul>
            {periodes.map(({ accompagnements, id, nomDuPanneau, tableau }, index) => (
              <div
                aria-label={nomDuPanneau}
                className={`fr-tabs__panel${index === 0 ? ' fr-tabs__panel--selected' : ''}`}
                id={`${id}-panneau`}
                key={id}
                role="tabpanel"
                tabIndex={0}
              >
                {/* MIN (#2246, #2352) : hauteur explicite, sans elle l'histogramme (hauteur 100 %) a une hauteur nulle
                    et disparaît ; 11rem est proche de son ancienne hauteur en desktop (182 px). Elle l'empêche aussi
                    d'être écrasé quand on ouvre le tableau de données (#2251) */}
                {/* #2251 : histogramme masqué aux aides techniques, ses valeurs exactes sont dans le tableau dessous */}
                <div aria-hidden style={{ height: '11rem' }}>
                  <AccompagnementBarChart data={accompagnements} />
                </div>
                <DonneesEnTableau className="fr-mt-2w" niveauTitre={niveauTitreTableau} {...tableau} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
