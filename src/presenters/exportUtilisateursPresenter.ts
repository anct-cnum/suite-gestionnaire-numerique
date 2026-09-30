import { formaterEnDateFrancaise } from './shared/date'
import { escapeCSV } from '@/shared/csv'
import {
  GouvernanceStructureReadModel,
  UneGouvernanceStructureReadModel,
} from '@/use-cases/queries/shared/GouvernanceStructureReadModel'
import { TerritoiresReadModel } from '@/use-cases/queries/shared/TerritoireReadModel'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export const ENTETES_UTILISATEURS = [
  'Nom',
  'Prénom',
  'Adresse électronique',
  'Téléphone',
  'Rôle',
  'Structure',
  'Département',
  'Région',
  'Statut',
  'Dernière connexion',
] as const

export const ENTETES_UTILISATEURS_GOUVERNANCES = [
  ...ENTETES_UTILISATEURS,
  'SIRET',
  'Statut de la structure',
  'Territoires',
  'Rôle gouvernance',
] as const

export function genererLigneUtilisateur(
  utilisateur: UnUtilisateurReadModel,
  territoires: TerritoiresReadModel
): ReadonlyArray<string> {
  const { departement, region } = resoudreDepartementEtRegion(utilisateur, territoires)
  return [
    escapeCSV(utilisateur.nom),
    escapeCSV(utilisateur.prenom),
    escapeCSV(utilisateur.email),
    escapeCSV(utilisateur.telephone),
    escapeCSV(utilisateur.role.nom),
    escapeCSV(utilisateur.role.organisation),
    escapeCSV(departement),
    escapeCSV(region),
    utilisateur.isActive ? 'Activé' : 'En attente',
    utilisateur.isActive ? formaterEnDateFrancaise(utilisateur.derniereConnexion) : '',
  ]
}

export function genererLigneUtilisateurGouvernance(
  utilisateur: UnUtilisateurReadModel,
  territoires: TerritoiresReadModel,
  gouvernanceParStructure: GouvernanceStructureReadModel
): ReadonlyArray<string> {
  const gouvernance = resoudreGouvernance(utilisateur, territoires, gouvernanceParStructure)
  return [
    ...genererLigneUtilisateur(utilisateur, territoires),
    escapeCSV(gouvernance.siret),
    escapeCSV(gouvernance.statutStructure),
    escapeCSV(gouvernance.territoires.join(' / ')),
    escapeCSV(gouvernance.roleGouvernance),
  ]
}

function resoudreDepartementEtRegion(
  utilisateur: UnUtilisateurReadModel,
  territoires: TerritoiresReadModel
): Readonly<{ departement: string; region: string }> {
  const { departements, structureDepartements } = territoires
  const departementParCode = new Map(departements.map((departement) => [departement.code, departement]))
  const regionParCode = new Map(departements.map((departement) => [departement.regionCode, departement.regionNom]))

  if (utilisateur.regionCode !== null) {
    return { departement: '', region: regionParCode.get(utilisateur.regionCode) ?? '' }
  }

  if (utilisateur.departementCode !== null) {
    const departementInfo = departementParCode.get(utilisateur.departementCode)
    if (departementInfo !== undefined) {
      return { departement: departementInfo.nom, region: departementInfo.regionNom }
    }
  }

  if (utilisateur.structureId !== null) {
    const codeDepartement = structureDepartements.get(utilisateur.structureId)
    if (codeDepartement !== undefined) {
      const departementInfo = departementParCode.get(codeDepartement)
      if (departementInfo !== undefined) {
        return { departement: departementInfo.nom, region: departementInfo.regionNom }
      }
    }
  }

  return { departement: '', region: '' }
}

const gouvernanceVide: Readonly<{
  roleGouvernance: '' | UneGouvernanceStructureReadModel['roleGouvernance']
  siret: string
  statutStructure: '' | UneGouvernanceStructureReadModel['statutStructure']
  territoires: ReadonlyArray<string>
}> = { roleGouvernance: '', siret: '', statutStructure: '', territoires: [] }

// Le rôle métier dans la gouvernance (SIRET, statut de la structure, territoires, coporteur/membre) est une
// information portée par la structure elle-même (via ses membres de gouvernance), pas par l'utilisateur : on
// distingue les branches par `role.type` — jamais par la simple présence de `departementCode`/`structureId`, qui
// sont aussi renseignés pour un « Gestionnaire structure » (cf. dérivation du département depuis les membres de
// gouvernance de sa structure dans PrismaUtilisateurLoader).
function resoudreGouvernance(
  utilisateur: UnUtilisateurReadModel,
  territoires: TerritoiresReadModel,
  gouvernanceParStructure: GouvernanceStructureReadModel
): Readonly<{
  roleGouvernance: '' | UneGouvernanceStructureReadModel['roleGouvernance']
  siret: string
  statutStructure: '' | UneGouvernanceStructureReadModel['statutStructure']
  territoires: ReadonlyArray<string>
}> {
  if (utilisateur.role.type === 'gestionnaire_structure' && utilisateur.structureId !== null) {
    return gouvernanceParStructure.get(utilisateur.structureId) ?? gouvernanceVide
  }

  const { departement, region } = resoudreDepartementEtRegion(utilisateur, territoires)

  if (utilisateur.role.type === 'gestionnaire_departement') {
    return { ...gouvernanceVide, territoires: departement === '' ? [] : [departement] }
  }

  if (utilisateur.role.type === 'gestionnaire_region') {
    return { ...gouvernanceVide, territoires: region === '' ? [] : [region] }
  }

  return gouvernanceVide
}
