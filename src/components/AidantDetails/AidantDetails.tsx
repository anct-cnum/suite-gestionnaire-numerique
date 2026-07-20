import { ReactElement } from 'react'

import AidantDetailsHeader from '@/components/AidantDetails/AidantDetailsHeader'
import InformationsPersonnellesCard from '@/components/AidantDetails/AidantDetailsInformationsPersonnelles'
import AidantDetailsLieuxActivite from '@/components/AidantDetails/AidantDetailsLieuxActivite'
import AidantDetailsStructureEmployeuse from '@/components/AidantDetails/AidantDetailsStructureEmployeuse'
import MenuCollant, { type SideMenuItem } from '@/components/AidantDetails/MenuCollant'
import styles from '@/components/AidantDetails/MenuCollant.module.css'

export type AidantDetailsHeaderData = Readonly<{
  modificationAutheur?: string
  modificationDate?: string
  nom: string
  prenom: string
  tags: ReadonlyArray<string>
}>

export type InformationsPersonnellesData = Readonly<{
  emails: ReadonlyArray<string>
  nom: string
  prenom: string
  telephone?: string
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
}>

export type AidantDetailsData = Readonly<{
  header: AidantDetailsHeaderData
  informationsPersonnelles: InformationsPersonnellesData
  lieuxActivite: ReadonlyArray<LieuActiviteData>
  structuresEmployeuses: ReadonlyArray<StructureEmployeuseData>
}>

export default function AidantDetails(props: Props): ReactElement {
  const { data } = props

  // Cacher la section activités si rôle = médiateur ET pas de labelisation/habilitation
  const isMediateur = data.header.tags.includes('Médiateur')
  const hasLabelisation =
    data.header.tags.includes('Conseiller numérique') || data.header.tags.includes('Aidant numérique')
  const shouldShowActivites = !(isMediateur && !hasLabelisation)

  const menuItems: ReadonlyArray<SideMenuItem> = [
    { linkProps: { href: '#informations-personnelles' }, text: 'Informations personnelles' },
    { linkProps: { href: '#structures-employeuses' }, text: 'Structures employeuses' },
    ...(shouldShowActivites ? [{ linkProps: { href: '#activites' }, text: 'Activités' }] : []),
    { linkProps: { href: '#lieux-activite' }, text: "Lieux d'activité" },
  ]
  return (
    <div className={`fr-container fr-py-4w ${styles.fullWidth}`}>
      <div className={styles.layout}>
        <div className={styles.menuContainer}>
          <MenuCollant contentId="aidant-content" items={menuItems} />
        </div>
        <div className={styles.contentContainer} id="aidant-content">
          <div id="header">
            <AidantDetailsHeader data={data.header} />
          </div>

          <div id="informations-personnelles">
            <InformationsPersonnellesCard data={data.informationsPersonnelles} />
          </div>

          <div id="structures-employeuses">
            {data.structuresEmployeuses.map((structure) => (
              <AidantDetailsStructureEmployeuse data={structure} key={structure.nom} />
            ))}
          </div>

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
