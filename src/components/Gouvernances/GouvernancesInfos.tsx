import { ReactElement } from 'react'

import { InfosGouvernances } from '@/components/Gouvernances/GouvernancesList'
import { MontantPositif } from '@/components/shared/Montant/MontantPositif'

export default function GouvernancesInfos(props: Props): ReactElement {
  const { infos } = props

  return (
    <section
      aria-labelledby="gouvernance"
      className="fr-pb-2w"
    >
      <div className="fr-container-fluid">
        <div className="fr-grid-row fr-grid-row--gutters">
          {renderGouvernanceInfoCart({
            description: 'Gouvernances territoriales',
            icon: 'bank-line',
            indicateur: String(infos.gouvernancesTerritoriales.gouvernancesCompte),
            legends: `dont ${infos.gouvernancesTerritoriales.gouvernanceCoporterCompte} gouvernances co-portées`,
          })}
          {renderGouvernanceInfoCart({
            description: 'Feuilles de route',
            icon: 'file-download-line',
            indicateur: String(infos.feuilleDeRoutes.feuilleDeRouteCompte),
            legends: `pour ${infos.feuilleDeRoutes.actionsCompte} actions`,
          })}
          {renderGouvernanceInfoCart({
            description: 'Crédits engagés par l’état',
            icon: 'download-line',
            indicateur: `${MontantPositif
              .ofNumber(infos.creditEngager.creditEngagerGlobal)
              .orElse(MontantPositif.Zero)
              .format()} €`,
            legends: `pour ${infos.creditEngager.subventionValiderCompte} demandes de subvention`,
          })}
        </div>
      </div>
    </section>
  )
}

function renderGouvernanceInfoCart({
  description,
  icon,
  indicateur,
  legends,
}: GouvernancesInfo): ReactElement {
  return (
    <div className="fr-col-12 fr-col-md-4">
      <div
        className="fr-background-alt--blue-france fr-p-3w"
        style={{
          alignItems: 'flex-start',
          borderRadius: '1rem',
          display: 'flex',
          gap: '1rem',
          height: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            display: 'inline-flex',
            justifyContent: 'center',
            padding: '0.5rem',
          }}
        >
          <span
            aria-hidden="true"
            className={`fr-icon-${icon} `}
            style={{ color: 'var(--blue-france-sun-113-625)', fontSize: '1.5rem' }}
          />
        </div>

        <div>
          <div className="fr-h5 fr-text-title--blue-france fr-m-0">
            {indicateur}
          </div>
          <div className="fr-text--sm fr-text--bold fr-m-0">
            {description}
          </div>
          <div className="fr-text--sm fr-m-0">
            {legends}
          </div>
        </div>
      </div>
    </div>
  )
}

type GouvernancesInfo = Readonly<{
  description: string
  icon: string
  indicateur: string
  legends: string
}>

type Props = Readonly<{
  infos: InfosGouvernances
}>
