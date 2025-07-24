import { ReactElement } from 'react'

import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { IconDSFR } from '@/components/shared/TitleIcon/TitleIconDsfr'

export default function GouvernancesInfos(props:Props): ReactElement {
  const { infos } = props
  return (
    <section
      aria-labelledby="gouvernance"
    >
      <div className="fr-grid-row">
        {renderGouvernanceInfoCart({
          description: 'Gouvernances territoriales',
          icon:'bank-line',
          indicateur:infos.gouvernancesTerritoriales.gouvernancesCompte,
          legends:`dont dont ${infos.gouvernancesTerritoriales.gouvernanceCoporterCompte} gouvernances co-portées` })}
        {renderGouvernanceInfoCart({
          description:'Feuilles de route',
          icon:'file-download-line',
          indicateur:infos.feuilleDeRoutes.feuilleDeRouteCompte,
          legends:`pour ${infos.feuilleDeRoutes.subventionValiderCompte} financements` })}
        {renderGouvernanceInfoCart({
          description:'Crédits engagés par l’état',
          icon:'download-line',
          indicateur:infos.creditEngager.creditEngagerGlobal,
          legends:`${infos.creditEngager.envelopeGlobal  }restant à attribuer` })}
      </div>
    </section>
  )
}
function renderGouvernanceInfoCart({
  description ,
  icon ,
  indicateur ,
  legends }: GouvernancesInfo):ReactElement  {
  return (
    <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
      <div className="fr-grid-row">
        <div className="fr-h1 fr-m-0 ">
          <TitleIcon
            background="white"
            icon={icon}
          />
        </div>
        <div className="fr-text-label--blue-france">
          <div>
            <span className="fr-h2 fr-text-title--blue-france">
              {indicateur}
            </span>
          </div>
          <div >
            <span className="fr-text--sm fr-text--bold">
              {description}
            </span>
          </div>
          <div >
            {legends}
          </div>
        </div>
      </div>
    </div>
  )
}
 type GouvernancesInfo = Readonly<{
   description: string
   icon: IconDSFR
   indicateur: string
   legends: string
 }>

type Props= Readonly<{
  infos: {
    creditEngager: {
      creditEngagerGlobal: string
      envelopeGlobal: string
    }
    feuilleDeRoutes: {
      feuilleDeRouteCompte: string
      subventionValiderCompte: string
    }
    gouvernancesTerritoriales: {
      gouvernanceCoporterCompte:string
      gouvernancesCompte: string
    }
  }
}>
