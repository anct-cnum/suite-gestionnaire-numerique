import { ReactElement } from 'react'

import AidantDetailsActivites from '@/components/AidantDetails/AidantDetailsActivites'
import AidantDetailsHeader from '@/components/AidantDetails/AidantDetailsHeader'
import InformationsPersonnellesCard from '@/components/AidantDetails/AidantDetailsInformationsPersonnelles'
import AidantDetailsLieuxActivite from '@/components/AidantDetails/AidantDetailsLieuxActivite'
import AidantDetailsSideMenu, { SideMenuSection } from '@/components/AidantDetails/AidantDetailsSideMenu'
import AidantDetailsStructureEmployeuse from '@/components/AidantDetails/AidantDetailsStructureEmployeuse'

export type AidantDetailsHeaderData = Readonly<{
  modificationAuther?: string
  modificationDate?: string
  nom: string
  prenom: string
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
  referent: Readonly<{
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
  nom: string
  nombreAccompagnements: number
  nombreAccompagnementsTotal: number
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

  const sections: ReadonlyArray<SideMenuSection> = [
    { id: 'informations-personnelles', label: 'Informations personnelles' },
    { id: 'structures-employeuses', label: 'Structures employeuses' },
    { id: 'activites', label: 'Activités' },
    { id: 'lieux-activite', label: 'Lieux d\'activité' },
  ]

  return (
    <div className="fr-container fr-py-4w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-3">
          <AidantDetailsSideMenu sections={sections} />
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

          <div id="activites">
            <AidantDetailsActivites data={data.statistiquesActivites} />
          </div>

          <div id="lieux-activite">
            <AidantDetailsLieuxActivite data={data.lieuxActivite} />
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: AidantDetailsData
}>
