import { ReactElement } from 'react'

import LieuInclusionDetailsAccueil from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueil'
import LieuInclusionDetailsHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsHeader'
import LieuInclusionDetailsInformationsGenerales from '@/components/LieuInclusionDetails/LieuInclusionDetailsInformationsGenerales'
import LieuInclusionDetailsPersonnes from '@/components/LieuInclusionDetails/LieuInclusionDetailsPersonnes'
import LieuInclusionDetailsServices from '@/components/LieuInclusionDetails/LieuInclusionDetailsServices'
import Alerte from '@/components/shared/Alerte/Alerte'
import { CouleurFraicheur } from '@/shared/fraicheur'

export type LieuInclusionDetailsHeaderData = Readonly<{
  fraicheur?: Readonly<{
    couleur: CouleurFraicheur
    date: string
    libelle: string
    source: string
  }>
  nom: string
  tags: ReadonlyArray<string>
}>

export type PersonneTravaillantData = Readonly<{
  email?: string
  id: number
  labelisations: ReadonlyArray<'aidants connect' | 'conseiller numérique'>
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
  typologies?: ReadonlyArray<string>
}>

export type ServiceInclusionNumeriqueData = Readonly<{
  description?: string
  modalites: ReadonlyArray<string>
  nom: string
  thematiques: ReadonlyArray<string>
}>

export type LieuInclusionDetailsData = Readonly<{
  // Lieu porté par la Coop numérique : présenté en lecture seule (#1951).
  estLieuCoop: boolean
  header: LieuInclusionDetailsHeaderData
  informationsGenerales: InformationsGeneralesData
  lieuAccueilPublic: LieuAccueilPublicData
  personnesTravaillant: ReadonlyArray<PersonneTravaillantData>
  peutModifier: boolean
  peutModifierInformationsGenerales: boolean
  servicesInclusionNumerique: ReadonlyArray<ServiceInclusionNumeriqueData>
}>

export default function LieuxInclusionDetails(props: Props): ReactElement {
  const { data, lieuId, peutSupprimer } = props

  return (
    <>
      <div id="header">
        <LieuInclusionDetailsHeader
          data={data.header}
          suppression={
            peutSupprimer ? { adresse: data.informationsGenerales.adresse, lieuId, nom: data.header.nom } : undefined
          }
        />
      </div>

      {data.estLieuCoop ? (
        <Alerte titre="Lieu géré dans la Coop numérique">
          Les informations de ce lieu sont renseignées par les médiateurs dans la Coop numérique et reprises ici
          automatiquement. Pour les modifier, masquer ce lieu sur la carte ou le supprimer, passez par la Coop.
        </Alerte>
      ) : null}

      <div id="informations-generales">
        <LieuInclusionDetailsInformationsGenerales
          data={data.informationsGenerales}
          peutModifier={data.peutModifierInformationsGenerales}
        />
      </div>

      <div id="personnes-travaillant">
        <LieuInclusionDetailsPersonnes data={data.personnesTravaillant} />
      </div>
      <section className="grey-border border-radius ">
        <div id="lieu-accueil-public">
          <LieuInclusionDetailsAccueil data={data.lieuAccueilPublic} peutModifier={data.peutModifier} />
        </div>
        <hr className="fr-hr fr-p-1" />
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
  lieuId: string
  peutSupprimer: boolean
}>
