import Image from 'next/image'
import { ReactElement } from 'react'

export default function ListeLieuxInclusionInfo(props: Props): ReactElement {
  const { infos } = props

  return (
    <section
      aria-labelledby="ListeLieuxInclusionInfo"
      className="fr-pb-3w"
    >
      <div className="fr-container-fluid">
        <div className="fr-grid-row fr-grid-row--gutters">
          {renderLieuxInclusionInfoCard({
            description: 'Lieux d\'inclusion numérique',
            indicateur: String(infos.total),
            legends: '',
          })}
          {renderLieuxInclusionInfoCard({
            description: 'Lieux labellisés ou habilités',
            indicateur: String(infos.totalLabellise),
            legends: `Dont ${infos.totalConseillerNumerique} conseillers numériques`,
          })}
          <div
            className="fr-col-12 fr-col-md-4"
            style={{ height: '7rem' }}
          >
            <div
              className="fr-grid-row  fr-mb-4w fr-border-default--grey"
              style={{ borderRadius: '0.5rem', height: '7rem' }}
            >
              <div
                className="fr-col-12 fr-col-md-4 fr-pr-1w"
                style={{ borderRadius: '0.5rem' , position: 'relative' }}
              >
                <Image
                  alt=""
                  className="fr-mr-2w"
                  fill
                  src="/carte-inclusion-numerique.png"
                  style={{
                    borderBottomLeftRadius: '0.5rem',
                    borderTopLeftRadius: '0.5rem',
                  }}
                />
              </div>
              <div
                className="fr-col-12 fr-col-md-8 fr-pr-1w"
                style={{
                  alignItems: 'center',
                  backgroundColor: 'var(--success-975-75)',
                  borderBottomRightRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <a
                    className="fr-btn fr-btn--secondary fr-icon-external-link-line fr-btn--icon-right"
                    href="https://cartographie.societenumerique.gouv.fr/cartographie"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Voir la cartographie
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function renderLieuxInclusionInfoCard({
  description,
  indicateur,
  legends,
}: LieuxInclusionInfoCard): ReactElement {
  return (
    <div
      className="fr-col-12 fr-col-md-4"
      style={{
        height: '7rem',
      }}
    >
      <div
        className="fr-background-alt--blue-france fr-p-2w"
        style={{
          borderRadius: '1rem',
          gap: '1rem',
          height: '7rem',
        }}
      >
        <div className="fr-h5 fr-text-title--blue-france fr-m-0">
          {indicateur}
        </div>
        <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
          {description}
        </div>
        <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
          {legends}
        </div>
      </div>
    </div>
  )
}

type LieuxInclusionInfoCard = Readonly<{
  description: string
  indicateur: string
  legends: string
}>

type LieuxInclusionInfoData = Readonly<{
  total: number
  totalConseillerNumerique: number
  totalLabellise: number
}>

type Props = Readonly<{
  infos: LieuxInclusionInfoData
}>
