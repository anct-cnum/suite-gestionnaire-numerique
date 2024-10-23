import departements from '../../ressources/departements.json'
import regions from '../../ressources/regions.json'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function mesUtilisateursPresenter(
  mesUtilisateursReadModel: ReadonlyArray<UnUtilisateurReadModel>,
  uid: string,
  totalUtilisateur: number
): MesUtilisateursViewModel {
  return {
    totalUtilisateur,
    utilisateurs: mesUtilisateursReadModel.map((monUtilisateur): MonUtilisateur => {
      const [statut, picto] = monUtilisateur.isActive
        ? ['Activé', monUtilisateur.role.categorie] as const
        : ['En attente', inactif] as const

      return {
        canBeDeleted: uid !== monUtilisateur.uid,
        derniereConnexion: buildDate(monUtilisateur),
        email: monUtilisateur.email,
        picto,
        prenomEtNom: `${monUtilisateur.prenom} ${monUtilisateur.nom}`,
        role: monUtilisateur.role.nom,
        statut,
        structure: monUtilisateur.role.territoireOuStructure,
        telephone: monUtilisateur.telephone || 'Non renseigné',
        uid: monUtilisateur.uid,
      }
    }),
  }
}

export function regionsEtDepartements(): ReadonlyArray<ZoneGeographique> {
  const regionsEtDepartements = [toutesLesRegions]

  regions.forEach((region) => {
    regionsEtDepartements.push({
      label: `(${region.code}) ${region.nom}`,
      type: 'region',
      value: `${region.code}${regionDepartementSeparator}${codeDepartementParDefautDuneRegion}`,
    })

    departements
      .filter((departement) => departement.regionCode === region.code)
      .forEach((departement) => {
        regionsEtDepartements.push({
          label: `(${departement.code}) ${departement.nom}`,
          type: 'departement',
          value: `${region.code}${regionDepartementSeparator}${departement.code}`,
        })
      })
  })

  return regionsEtDepartements
}

export function zoneGeographiqueParDefaut(codeRegion: string | null, codeDepartement: string | null): ZoneGeographique {
  return regionsEtDepartements().find(
    (regionEtDepartement) => {
      const [codeRegionSelectionnee, codeDepartementSelectionne] =
        laRegionOuLeDepartementSelectionne(regionEtDepartement.value)

      return codeRegionSelectionnee === codeRegion || codeDepartementSelectionne === codeDepartement
    }
  ) ?? toutesLesRegions
}

export function laRegionOuLeDepartementSelectionne(zoneGeographique: string): ReadonlyArray<string> {
  return zoneGeographique.split('_')
}

export function isRegion(zoneGeographique: string): boolean {
  return zoneGeographique.endsWith(codeDepartementParDefautDuneRegion)
}

export const valeurParDefautDeToutesLesRegions = 'all'
export const toutesLesRegions: ZoneGeographique = { label: 'Toutes les régions', type: 'region', value: valeurParDefautDeToutesLesRegions }
export const codeDepartementParDefautDuneRegion = '00'
export const regionDepartementSeparator = '_'

export type ZoneGeographique = Readonly<{
  label: string
  type: 'region' | 'departement'
  value: string
}>

export type MesUtilisateursViewModel = Readonly<{
  totalUtilisateur: number
  utilisateurs: ReadonlyArray<MonUtilisateur>
}>

type MonUtilisateur = DetailsUtilisateurViewModel & Readonly<{
  canBeDeleted: boolean
  picto: string
  statut: 'En attente' | 'Activé'
  uid: string
}>

export type DetailsUtilisateurViewModel = Readonly<{
  derniereConnexion: string
  email: string
  prenomEtNom: string
  role: string
  structure: string
  telephone: string
}>

const inactif = 'inactif'

function buildDate(utilisateurReadModel: UnUtilisateurReadModel): string {
  if (utilisateurReadModel.isActive) {
    return buildDateFrancaise(utilisateurReadModel.derniereConnexion)
  }

  return `invité le ${buildDateFrancaise(utilisateurReadModel.inviteLe)}`
}

function buildDateFrancaise(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}
