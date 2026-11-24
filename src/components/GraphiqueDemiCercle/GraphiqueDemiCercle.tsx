'use client'
import { ReactElement, useRef } from 'react'

import styles from './GraphiqueDemiCercle.module.css'
import Dot from '@/components/shared/Dot/Dot'
import Doughnut from '@/components/shared/Doughnut/Doughnut'
import { DownloadButton } from '@/components/shared/Download/DownloadButton'
import InformationDepliable, {
  BoutonInformation,
  TexteInformation,
  titreSuiviDuBouton,
} from '@/components/shared/Information/InformationDepliable'
import { handleDownload } from '@/shared/DownloadHelp'

export default function GraphiqueDemiCercle(props: Readonly<Props>): ReactElement {
  const {
    dateGeneration,
    description = '',
    details,
    graphiqueInfos,
    indicateur,
    information,
    label,
    niveauTitre,
  } = props
  // Sans niveau de titre (page sans titre parent), le libellé reste un simple texte mis en forme
  const Libelle = niveauTitre ?? 'div'
  const componentRef = useRef<HTMLDivElement>(null)
  return (
    <section className="fr-mb-3w">
      <div className="fr-p-4w fr-border-default--grey" style={{ borderRadius: '1rem' }}>
        <div className="center" ref={componentRef}>
          {/* RGAA 10.7 (#2350) : le contour de focus du « i » du libellé ne chevauche pas le demi-cercle */}
          <div className="fr-mb-1w">
            <Doughnut
              backgroundColor={graphiqueInfos.map((item) => item.backgroundColor)}
              data={graphiqueInfos.map((item) => item.value)}
              isFull={false}
              labels={graphiqueInfos.map((item) => item.label)}
            />
          </div>
          {/* RGAA 9.1 (#2357) : avec un titre, le total en fait partie (« 42 Lieux en territoires prioritaires ») ;
              il reste affiché en grand au-dessus du libellé, au centre du demi-cercle */}
          {niveauTitre === undefined ? (
            <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>{indicateur}</div>
          ) : null}
          <InformationDepliable>
            <div>
              <Libelle className={`fr-text--lg font-weight-700 fr-m-0 fr-text-default--grey ${titreSuiviDuBouton}`}>
                {niveauTitre === undefined ? null : (
                  <>
                    <span className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']} ${styles['total-du-titre']}`}>
                      {indicateur}
                    </span>{' '}
                  </>
                )}
                {label}
              </Libelle>
              {information === undefined ? null : <BoutonInformation libelle={`Plus d'information sur « ${label} »`} />}
            </div>
            <TexteInformation>
              <p className="fr-text--sm fr-mb-0">{information}</p>
            </TexteInformation>
          </InformationDepliable>
          {description === '' ? null : <div className="color-blue-france fr-pb-1w separator">{description}</div>}

          <div className="fr-mt-4w">
            <ul>
              {details.map((item) => (
                <li className="fr-grid-row fr-grid-row--top fr-btns-group--space-between fr-mb-1w" key={item.label}>
                  {/* #2246 : libellé sur plusieurs lignes plutôt que tronqué par « … » (RGAA 10.4, 10.12) */}
                  <div className={`fr-col fr-pr-1w ${styles.libelle}`}>
                    <span className={styles['dot-margin']}>
                      <Dot color={item.backgroundColor} />
                    </span>
                    <span className={styles['item-type-padding']}>{item.label}</span>
                  </div>
                  <div className="font-weight-700" style={{ flexShrink: 0 }}>
                    {item.value}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="fr-hr fr-mt-3w" />
        <div className="fr-grid-row fr-grid-row--middle fr-mt-2w" style={{ alignItems: 'center' }}>
          <div style={{ display: 'none', flex: 1 }}>
            <p className="fr-text--sm fr-mb-0">Données mises à jour le {dateGeneration.toLocaleDateString('fr-FR')}</p>
          </div>
          <DownloadButton
            onClick={() => {
              void handleDownload(componentRef, label)
            }}
            title={label}
          />
        </div>
      </div>
    </section>
  )
}

type Props = {
  dateGeneration: Date
  description?: string
  details: Array<Info>
  graphiqueInfos: Array<Info>
  indicateur: number
  information?: string
  label: string
  niveauTitre?: 'h3'
}

type Info = {
  backgroundColor: string
  label: string
  value: number
}
