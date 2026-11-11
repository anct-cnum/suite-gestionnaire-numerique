import { ReactElement } from 'react'

import GraphiqueAvecDonnees from './GraphiqueAvecDonnees'
import TableauAccompagnementsMensuels from './TableauAccompagnementsMensuels'
import Bar from '../../shared/Bar/Bar'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord.module.css'
import Information from '@/components/shared/Information/Information'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'
import { accompagnementsMensuelsPresenter } from '@/presenters/tableauDeBord/accompagnementsMensuelsPresenter'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export type AccompagnementsRealisesEtat =
  | Readonly<{ message: string; statut: 'erreur' }>
  | Readonly<{ resultat: AccompagnementsRealisesResult; statut: 'charge' }>
  | Readonly<{ statut: 'chargement' }>

export default function AccompagnementsRealisesView({ etat }: Props): ReactElement {
  if (etat.statut === 'chargement') {
    return (
      <>
        <div className="background-blue-france fr-p-3w fr-ml-1w">
          <div className={`${styles.indicateurValeur} fr-m-0`}>
            <TitleIcon background="white" icon="compass-3-line" />
            <span className="color-grey">...</span>
          </div>
          <div className="font-weight-500">
            <span> Accompagnements réalisés</span>
            <Information libelle="Plus d'information sur les accompagnements réalisés">
              <p className="fr-mb-0">
                Depuis <strong>2021</strong>, avec les dispositifs <strong>Conseillers Numériques</strong> et
                <strong>Aidants Connect.</strong>
              </p>
            </Information>
          </div>
        </div>
        <div className="background-blue-france fr-p-3w fr-ml-1w fr-mt-1w">
          <h3 className="fr-text--md fr-m-0 font-weight-500 fr-text-default--grey">
            <span> Accompagnements des 6 derniers mois</span>
            <Information libelle="Plus d'information sur les accompagnements des 6 derniers mois">
              <p className="fr-mb-0">
                Accompagnements saisis sur <strong>La Coop.</strong>
              </p>
            </Information>
          </h3>
          <div className="fr-text--sm color-grey fr-mt-2w">Chargement...</div>
        </div>
      </>
    )
  }

  if (etat.statut === 'erreur') {
    return (
      <>
        <div className="background-blue-france fr-p-3w fr-ml-1w">
          <div className={`${styles.indicateurValeur} fr-m-0`}>
            <TitleIcon background="white" icon="error-warning-line" />—
          </div>
          <div className="font-weight-500">
            <span> Accompagnements réalisés</span>
            <Information libelle="Plus d'information sur les accompagnements réalisés">
              <p className="fr-mb-0">
                Depuis <strong>2021</strong>, avec les dispositifs <strong>Conseillers Numériques</strong> et
                <strong>Aidants Connect.</strong>
              </p>
            </Information>
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">{etat.message}</div>
        </div>
        <div className="background-blue-france fr-p-3w fr-ml-1w fr-mt-1w">
          <h3 className="fr-text--md fr-m-0 font-weight-500 fr-text-default--grey">
            <span> Accompagnements des 6 derniers mois</span>
            <Information libelle="Plus d'information sur les accompagnements des 6 derniers mois">
              <p className="fr-mb-0">Accompagnements saisis sur La Coop</p>
            </Information>
          </h3>
          <div className="fr-text--xs color-blue-france fr-mb-0">{etat.message}</div>
        </div>
      </>
    )
  }

  const { resultat } = etat
  const mois = accompagnementsMensuelsPresenter(resultat.repartitionMensuelle)
  // Tokens DSFR lus sur le canvas : bleu France 525 pour les mois passés, 113 (625 en sombre) pour le mois en cours
  const backgroundColor = mois.map(({ enCours }) =>
    enCours ? 'var(--blue-france-sun-113-625)' : 'var(--blue-france-main-525)'
  )

  return (
    <>
      <div className="background-blue-france fr-p-3w fr-ml-1w">
        <div className={`${styles.indicateurValeur} fr-m-0`}>
          <TitleIcon background="white" icon="compass-3-line" />
          {formaterEnNombreFrancais(resultat.nombreTotal)}
        </div>
        <div className="font-weight-500">
          <span> Accompagnements réalisés</span>
          <Information libelle="Plus d'information sur les accompagnements réalisés">
            <p className="fr-mb-0">
              Depuis 2021, avec les dispositifs <strong>Conseillers Numériques</strong> et{' '}
              <strong>Aidants Connect</strong>
            </p>
          </Information>
        </div>
      </div>
      <div className="background-blue-france fr-p-3w fr-ml-1w fr-mt-1w">
        <GraphiqueAvecDonnees
          entete={
            <h3 className="fr-text--md fr-m-0 font-weight-500 fr-text-default--grey">
              <span> Accompagnements des 6 derniers mois</span>
              <Information libelle="Plus d'information sur les accompagnements des 6 derniers mois">
                <p className="fr-mb-0">
                  Accompagnements saisis sur <strong>La Coop.</strong>
                </p>
              </Information>
            </h3>
          }
          graphique={
            <Bar
              backgroundColor={backgroundColor}
              data={mois.map((item) => item.nombre)}
              etiquettesValeurs={mois.map((item) => item.nombreAffiche)}
              labels={mois.map((item) => item.libelleAxe)}
              nomAccessible="Histogramme des accompagnements des 6 derniers mois. Données détaillées disponibles sous forme de tableau."
            />
          }
          idTableau="donnees-histogramme-accompagnements"
          nomVueGraphique="Histogramme"
          titre="l’histogramme des accompagnements"
          tableau={<TableauAccompagnementsMensuels mois={mois} />}
        />
      </div>
    </>
  )
}

type Props = Readonly<{
  etat: AccompagnementsRealisesEtat
}>
