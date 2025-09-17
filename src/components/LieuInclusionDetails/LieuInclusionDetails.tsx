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
  nom: string
  prenom: string
  role?: string
  telephone?: string
}>

export type LieuAccueilPublicData = Readonly<{
  accessibilite?: string
  conseillerNumeriqueLabellePhase2?: boolean
  conseillerNumeriqueLabellePhase3?: boolean
  horaires?: string
  modalitesAccueil?: string
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
      <section className="fr-mb-4w grey-border border-radius ">
        <div id="lieu-accueil-public">
          <LieuInclusionDetailsAccueil data={data.lieuAccueilPublic} />
        </div>
        <hr className="fr-hr fr-mt-3w" />
        <div id="services-inclusion-numerique">
          <LieuInclusionDetailsServices data={data.servicesInclusionNumerique} />
        </div>
      </section>

    </>
  )
}

type Props = Readonly<{
  data: LieuInclusionDetailsData
}>
