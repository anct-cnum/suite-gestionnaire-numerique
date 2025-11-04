import { ReactElement } from 'react'

import LieuInclusionDetailsAccueil from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueil'
import LieuInclusionDetailsHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsHeader'
import LieuInclusionDetailsInformationsGenerales from '@/components/LieuInclusionDetails/LieuInclusionDetailsInformationsGenerales'
import LieuInclusionDetailsPersonnes from '@/components/LieuInclusionDetails/LieuInclusionDetailsPersonnes'
import LieuInclusionDetailsServices from '@/components/LieuInclusionDetails/LieuInclusionDetailsServices'

export type LieuInclusionDetailsHeaderData = Readonly<{
  modificationAuteur?: string
  modificationDate?: string
  nom: string
  tags: ReadonlyArray<string>
}>

export type PersonneTravaillantData = Readonly<{
  email?: string
  id: number
  nom: string
  prenom: string
  role?: string
  telephone?: string
}>

export type LieuAccueilPublicData = Readonly<{
  accessibilite?: string
  conseillerNumeriqueLabellePhase2?: boolean
  conseillerNumeriqueLabellePhase3?: boolean
  email?: string
  fraisACharge?: ReadonlyArray<string>
  horaires?: string
  itinerance?: ReadonlyArray<string>
  modalitesAcces?: ReadonlyArray<string>
  modalitesAccueil?: string
  presentationDetail?: string
  presentationResume?: string
  priseEnChargeSpecifique?: ReadonlyArray<string>
  priseRdvUrl?: string
  publicsSpecifiquementAdresses?: ReadonlyArray<string>
  telephone?: string
  typologies?: ReadonlyArray<string>
  websiteUrl?: string
}>

export type InformationsGeneralesData = Readonly<{
  adresse: string
  complementAdresse?: string
  nomStructure: string
  siret?: string
}>

export type ServiceInclusionNumeriqueData = Readonly<{
  description?: string
  modalites: ReadonlyArray<string>
  nom: string
  thematiques: ReadonlyArray<string>
}>

export type LieuInclusionDetailsData = Readonly<{
  header: LieuInclusionDetailsHeaderData
  informationsGenerales: InformationsGeneralesData
  lieuAccueilPublic: LieuAccueilPublicData
  personnesTravaillant: ReadonlyArray<PersonneTravaillantData>
  peutModifier: boolean
  servicesInclusionNumerique: ReadonlyArray<ServiceInclusionNumeriqueData>
}>

export default function LieuxInclusionDetails(props: Props): ReactElement {
  const { data } = props

  return (
    <>
      <div id="header">
        <LieuInclusionDetailsHeader data={data.header} />
      </div>

      <div id="informations-generales">
        <LieuInclusionDetailsInformationsGenerales data={data.informationsGenerales} />
      </div>

      <div id="personnes-travaillant">
        <LieuInclusionDetailsPersonnes data={data.personnesTravaillant} />
      </div>
      <section className="grey-border border-radius ">
        <div id="lieu-accueil-public">
          <LieuInclusionDetailsAccueil
            data={data.lieuAccueilPublic}
            peutModifier={data.peutModifier}
          />
        </div>
        <hr className="fr-hr " />
        <div id="services-inclusion-numerique">
          <LieuInclusionDetailsServices
            data={data.servicesInclusionNumerique}
            lieuAccueilPublic={data.lieuAccueilPublic}
            peutModifier={data.peutModifier}
          />
        </div>
      </section>

    </>
  )
}

type Props = Readonly<{
  data: LieuInclusionDetailsData
}>
