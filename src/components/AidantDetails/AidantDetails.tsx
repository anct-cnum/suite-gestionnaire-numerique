import { ReactElement } from 'react'

import AidantDetailsActivites from '@/components/AidantDetails/AidantDetailsActivites'
import AidantDetailsHeader from '@/components/AidantDetails/AidantDetailsHeader'
import InformationsPersonnellesCard from '@/components/AidantDetails/AidantDetailsInformationsPersonnelles'
import AidantDetailsLieuxActivite from '@/components/AidantDetails/AidantDetailsLieuxActivite'
import AidantDetailsStructureEmployeuse from '@/components/AidantDetails/AidantDetailsStructureEmployeuse'
import MenuCollant, { MenuCollantSection } from '@/components/AidantDetails/MenuCollant'

export type AidantDetailsHeaderData = Readonly<{
  modificationAutheur?: string
  modificationDate?: string
  nom: string
  tags: ReadonlyArray<string>
}>

export type InformationsPersonnellesData = Readonly<{
  email?: string
  nom: string
  prenom: string
  telephone?: string
}>

export type StatistiquesActivitesData = Readonly<{
  accompagnements: Readonly<{
    avecAidantsConnect: number
    individuels: number
    nombreAteliers: number
    participationsAteliers: number
    total: number
  }>
  beneficiaires: Readonly<{
    anonymes: number
    suivis: number
    total: number
  }>
  graphique: Readonly<{
    backgroundColor: ReadonlyArray<string>
    data: ReadonlyArray<number>
    labels: ReadonlyArray<string>
  }>
}>

export type StructureEmployeuseData = Readonly<{
  adresse: string
  departement?: string
  nom: string
  referent?: Readonly<{
    email: string
    nom: string
    post: string
    prenom: string
    telephone: string
  }>
  region?: string
  siret?: string
  type: string
}>

export type LieuActiviteData = Readonly<{
  adresse: string
  idCoopCarto: null | string
  nom: string
  nombreAccompagnements: number
}>

export type AidantDetailsData = Readonly<{
  header: AidantDetailsHeaderData
  informationsPersonnelles: InformationsPersonnellesData
  lieuxActivite: ReadonlyArray<LieuActiviteData>
  statistiquesActivites?: StatistiquesActivitesData
  structuresEmployeuses: ReadonlyArray<StructureEmployeuseData>
}>

export default function AidantDetails(props: Props): ReactElement {
  const { data } = props

  // Cacher la section activités si rôle = médiateur ET pas de labelisation/habilitation
  const isMediateur = data.header.tags.includes('Médiateur')
  const hasLabelisation = data.header.tags.includes('Conseiller numérique') || data.header.tags.includes('Aidant numérique')
  const shouldShowActivites = !(isMediateur && !hasLabelisation)

  const sections: ReadonlyArray<MenuCollantSection> = [
    { id: 'informations-personnelles', label: 'Informations personnelles' },
    { id: 'structures-employeuses', label: 'Structures employeuses' },
    ...shouldShowActivites ? [{ id: 'activites', label: 'Activités' }] : [],
    { id: 'lieux-activite', label: 'Lieux d\'activité' },
  ]
  return (
    <div className="fr-container fr-py-4w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-3">
          <MenuCollant sections={sections} />
        </div>
        <div className="fr-col-12 fr-col-md-9">
          <div id="header">
            <AidantDetailsHeader data={data.header} />
          </div>

          <div id="informations-personnelles">
            <InformationsPersonnellesCard data={data.informationsPersonnelles} />
          </div>

          <div id="structures-employeuses">
            {data.structuresEmployeuses.map((structure) => (
              <AidantDetailsStructureEmployeuse
                data={structure}
                key={structure.nom}
              />
            ))}
          </div>

          {shouldShowActivites ?
            <div id="activites">
              <AidantDetailsActivites
                data={data.statistiquesActivites}
                nom={data.informationsPersonnelles.nom}
                prenom={data.informationsPersonnelles.prenom}
              />
            </div> : null}

          <div id="lieux-activite">
            <AidantDetailsLieuxActivite
              data={data.lieuxActivite}
              nom={data.informationsPersonnelles.nom}
              prenom={data.informationsPersonnelles.prenom}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: AidantDetailsData
}>
