import { ReactElement } from 'react'

import Bar from '../../shared/Bar/Bar'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord.module.css'
import Information from '@/components/shared/Information/Information'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'
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
            <Information>
              <p className="fr-mb-0">
                Depuis <strong>2021</strong>, avec les dispositifs <strong>Conseillers Numériques</strong> et
                <strong>Aidants Connect.</strong>
              </p>
            </Information>
          </div>
        </div>
        <div className="background-blue-france fr-p-3w fr-ml-1w fr-mt-1w">
          <div className="font-weight-500">
            <span> Accompagnements des 6 derniers mois</span>
            <Information>
              <p className="fr-mb-0">
                Accompagnements saisis sur <strong>La Coop.</strong>
              </p>
            </Information>
          </div>
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
            <Information>
              <p className="fr-mb-0">
                Depuis <strong>2021</strong>, avec les dispositifs <strong>Conseillers Numériques</strong> et
                <strong>Aidants Connect.</strong>
              </p>
            </Information>
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">{etat.message}</div>
        </div>
        <div className="background-blue-france fr-p-3w fr-ml-1w fr-mt-1w">
          <div className="font-weight-500">
            <span> Accompagnements des 6 derniers mois</span>
            <Information>
              <p className="fr-mb-0">Accompagnements saisis sur La Coop</p>
            </Information>
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">{etat.message}</div>
        </div>
      </>
    )
  }

  const { resultat } = etat
  const backgroundColor = ['#CACAFB', '#CACAFB', '#CACAFB', '#CACAFB', '#CACAFB', '#6A6AF4']

  return (
    <>
      <div className="background-blue-france fr-p-3w fr-ml-1w">
        <div className={`${styles.indicateurValeur} fr-m-0`}>
          <TitleIcon background="white" icon="compass-3-line" />
          {formaterEnNombreFrancais(resultat.nombreTotal)}
        </div>
        <div className="font-weight-500">
          <span> Accompagnements réalisés</span>
          <Information>
            <p className="fr-mb-0">
              Depuis 2021, avec les dispositifs <strong>Conseillers Numériques</strong> et{' '}
              <strong>Aidants Connect</strong>
            </p>
          </Information>
        </div>
      </div>
      <div className="background-blue-france fr-p-3w fr-ml-1w fr-mt-1w">
        <Bar
          backgroundColor={backgroundColor}
          data={resultat.repartitionMensuelle.map((item) => item.nombre)}
          header={
            <div className="font-weight-500">
              <span> Accompagnements des 6 derniers mois</span>
              <Information>
                <p className="fr-mb-0">
                  Accompagnements saisis sur <strong>La Coop.</strong>
                </p>
              </Information>
            </div>
          }
          labels={resultat.repartitionMensuelle.map((item) => item.mois)}
        />
      </div>
    </>
  )
}

type Props = Readonly<{
  etat: AccompagnementsRealisesEtat
}>
