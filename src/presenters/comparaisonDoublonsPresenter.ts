import { libelleSource } from '@/presenters/shared/libelleSource'
import { NotionCle } from '@/use-cases/commands/TransfererNotionsStructure'
import {
  ComparaisonDoublonsReadModel,
  RattachementsReadModel,
  StructureDetailReadModel,
} from '@/use-cases/queries/ComparerStructuresAFusionner'

const LIBELLES_RATTACHEMENTS: ReadonlyArray<
  Readonly<{ cle: keyof RattachementsReadModel; info?: string; label: string }>
> = [
  { cle: 'utilisateursMin', label: 'Utilisateurs MIN' },
  { cle: 'membresMin', label: 'Membres MIN' },
  { cle: 'gouvernances', label: 'Gouvernances' },
  { cle: 'feuillesDeRoute', label: 'Feuilles de route portées' },
  { cle: 'contactsMembre', label: 'Contacts membres' },
  { cle: 'postes', label: 'Postes' },
  { cle: 'contrats', label: 'Contrats' },
  { cle: 'affectationsEmploi', label: 'Affectations emploi' },
  { cle: 'contacts', label: 'Contacts référents' },
  {
    cle: 'associationsLieux',
    info:
      'Les lieux d’inclusion sont rattachés à cette structure par leur SIRET. Fusionner une structure qui a des ' +
      'lieux d’inclusion rattachés ne « déplace » pas les lieux d’inclusion sur la carte, ces derniers ayant une ' +
      'adresse indépendante.',
    label: "Associations à des lieux d'inclusion",
  },
]

export function comparaisonDoublonsPresenter(readModel: ComparaisonDoublonsReadModel): ComparaisonViewModel {
  return readModel.map(versStructureComparaison)
}

export type ComparaisonViewModel = ReadonlyArray<StructureComparaisonViewModel>

// Une des 6 notions transférables portées par une structure. `present` pilote l'affichage
// de la case (concept absent = pas de case). `idExterne` rend lisible le cas « 0 ligne mais
// id scalaire présent » (ex. structure_ac_id sans aucun aidant) pour les sources agrégées.
export type ConceptViewModel = Readonly<{
  cle: NotionCle
  idExterne: null | string
  label: string
  present: boolean
  resume: string
}>

export type StructureComparaisonViewModel = Readonly<{
  adresse: string
  champs: ReadonlyArray<ChampViewModel>
  // Les 6 notions transférables, dans l'ordre d'affichage (toujours les 6, `present` filtre).
  concepts: ReadonlyArray<ConceptViewModel>
  denomination: string
  denominationSirene: string
  // true si la structure est associée à au moins un lieu d'inclusion
  // (table main.lieu_inclusion_structure_administrative).
  estAssocieLieuInclusion: boolean
  // true si la structure est la forme canonique (aucune denomination_antenne) = celle qui devrait
  // porter le rattachement et l'affichage. Sinon c'est une antenne.
  estCanonique: boolean
  // true si la structure porte au moins un membre de gouvernance (critère de décision important).
  estMembre: boolean
  id: number
  latitude: null | number
  longitude: null | number
  rattachements: ReadonlyArray<RattachementViewModel>
  rattachementsTotal: number
  // SIRET brut, pour la requête INSEE de l'aperçu et le calcul de collision de canonisation côté client.
  siret: null | string
}>

export type ChampViewModel = Readonly<{
  label: string
  valeur: string
}>

export type RattachementViewModel = Readonly<{
  info?: string
  label: string
  nombre: number
}>

export type MatriceDistancesViewModel = Readonly<{
  // En-têtes de colonnes : nom seul (pour ne pas surcharger l'axe horizontal).
  colonnes: ReadonlyArray<ColonneDistanceViewModel>
  // true si au moins une structure n'a pas de coordonnées (cellules « n/a »).
  coordsIncompletes: boolean
  // En-têtes de lignes : nom + adresse (axe vertical, plus de place).
  lignes: ReadonlyArray<LigneDistanceViewModel>
}>

export type ColonneDistanceViewModel = Readonly<{
  id: number
  nom: string
}>

export type LigneDistanceViewModel = Readonly<{
  adresse: string
  cellules: ReadonlyArray<CelluleDistanceViewModel>
  id: number
  nom: string
}>

// Niveau de proximité d'une cellule, pour la mise en forme : identique (0 = même adresse),
// proche (< 100 m), eloigne (> 1 km), normal (entre les deux), inconnu (coords manquantes),
// diagonale (structure vs elle-même).
export type NiveauDistance = 'diagonale' | 'eloigne' | 'identique' | 'inconnu' | 'normal' | 'proche'

// Matrice N×N des distances (km) à vol d'oiseau entre structures candidates. Diagonale = « — »,
// cellule « n/a » si une coordonnée manque. Sert à juger si des antennes d'un même SIRET sont
// géographiquement proches ou éparpillées.
export function matriceDistances(structures: ReadonlyArray<StructureComparaisonViewModel>): MatriceDistancesViewModel {
  return {
    colonnes: structures.map((structure) => ({ id: structure.id, nom: structure.denomination })),
    coordsIncompletes: structures.some((structure) => structure.latitude === null || structure.longitude === null),
    lignes: structures.map((ligne) => ({
      adresse: ligne.adresse,
      cellules: structures.map((colonne) => celluleDistance(ligne, colonne)),
      id: ligne.id,
      nom: ligne.denomination,
    })),
  }
}

type CelluleDistanceViewModel = Readonly<{
  colonneId: number
  niveau: NiveauDistance
  valeur: string
}>

function celluleDistance(
  ligne: StructureComparaisonViewModel,
  colonne: StructureComparaisonViewModel
): CelluleDistanceViewModel {
  if (ligne.id === colonne.id) {
    return { colonneId: colonne.id, niveau: 'diagonale', valeur: '—' }
  }
  const km = distanceKm(ligne, colonne)
  if (km === null) {
    return { colonneId: colonne.id, niveau: 'inconnu', valeur: 'n/a' }
  }

  return { colonneId: colonne.id, niveau: niveauDistance(km), valeur: km.toFixed(1) }
}

function niveauDistance(km: number): NiveauDistance {
  if (km === 0) {
    return 'identique'
  }
  if (km < 0.1) {
    return 'proche'
  }
  if (km > 1) {
    return 'eloigne'
  }

  return 'normal'
}

function versStructureComparaison(structure: StructureDetailReadModel): StructureComparaisonViewModel {
  return {
    adresse: structure.adresse ?? '—',
    champs: [
      { label: 'SIRET', valeur: structure.siret ?? '—' },
      { label: 'RIDET', valeur: structure.ridet ?? '—' },
      { label: 'RNA', valeur: structure.rna ?? '—' },
      { label: 'Dénomination SIRENE', valeur: structure.denominationSirene ?? '—' },
      {
        label: 'Antenne',
        valeur: structure.denominationAntenne === null ? 'Non' : `Oui — ${structure.denominationAntenne}`,
      },
      { label: 'Source', valeur: libelleSource(structure.source) },
      { label: 'État administratif', valeur: structure.etatAdministratif ?? '—' },
      { label: 'Code activité (APE)', valeur: structure.codeActivitePrincipale ?? '—' },
      { label: 'Commune', valeur: structure.commune ?? '—' },
      { label: 'Bénéficiaire de subvention', valeur: structure.estBeneficiaire ? 'Oui' : 'Non' },
      { label: 'Issue d’une fusion précédente', valeur: structure.dejaFusionnee ? 'Oui' : 'Non' },
    ],
    concepts: construireConcepts(structure),
    denomination: structure.denominationAntenne ?? structure.denominationSirene ?? `Structure #${structure.id}`,
    denominationSirene: structure.denominationSirene ?? '',
    estAssocieLieuInclusion: structure.rattachements.associationsLieux > 0,
    estCanonique: structure.denominationAntenne === null,
    estMembre: structure.rattachements.membresMin > 0,
    id: structure.id,
    latitude: structure.latitude,
    longitude: structure.longitude,
    rattachements: LIBELLES_RATTACHEMENTS.map(({ cle, info, label }) => ({
      info,
      label,
      nombre: structure.rattachements[cle],
    })),
    rattachementsTotal: structure.rattachements.total,
    siret: structure.siret,
  }
}

// Construit les 6 notions transférables d'une structure. Une notion est « présente » dès qu'elle
// porte au moins une ligne OU un id scalaire non-NULL — d'où l'inclusion des ids coop/tp/ac, qui
// font qu'une structure « porte » la source même avec 0 affectation (le resync la repeuplerait).
function construireConcepts(structure: StructureDetailReadModel): ReadonlyArray<ConceptViewModel> {
  const liens = structure.rattachements
  const idTp = structure.structureTpId === null ? null : String(structure.structureTpId)

  return [
    {
      cle: 'membre',
      idExterne: null,
      label: 'Membre de gouvernance + utilisateurs',
      present: liens.membresMin > 0 || liens.utilisateursMin > 0,
      resume: `${unite(liens.membresMin, 'membre')} · ${unite(liens.utilisateursMin, 'utilisateur')}`,
    },
    {
      cle: 'contacts',
      idExterne: null,
      label: 'Contacts référents',
      present: liens.contacts > 0,
      resume: unite(liens.contacts, 'contact'),
    },
    {
      cle: 'coop',
      idExterne: structure.structureCoopId,
      label: 'Coop',
      present: liens.affectationsCoop > 0 || structure.structureCoopId !== null,
      resume: unite(liens.affectationsCoop, 'affectation'),
    },
    {
      cle: 'idposte',
      idExterne: idTp,
      label: 'Idposte',
      present:
        liens.postes > 0 || liens.contrats > 0 || liens.affectationsIdposte > 0 || structure.structureTpId !== null,
      resume: `${unite(liens.postes, 'poste')} · ${unite(liens.contrats, 'contrat')} · ${unite(liens.affectationsIdposte, 'affectation')}`,
    },
    {
      cle: 'aidantsConnect',
      idExterne: structure.structureAcId,
      label: 'Aidants Connect',
      present: liens.affectationsAc > 0 || structure.structureAcId !== null,
      resume: unite(liens.affectationsAc, 'aidant'),
    },
    {
      cle: 'lieuInclusion',
      idExterne: null,
      label: 'Lieu d’inclusion',
      present: liens.associationsLieux > 0,
      resume: unite(liens.associationsLieux, 'lieu', 'lieux'),
    },
  ]
}

// « 2 membres », « 1 contact », « 0 aidant » — pluriel à partir de 2.
function unite(nombre: number, singulier: string, pluriel = `${singulier}s`): string {
  return `${nombre} ${nombre > 1 ? pluriel : singulier}`
}

// Distance à vol d'oiseau (Haversine) en km entre deux structures, ou null si une coordonnée manque.
function distanceKm(depart: StructureComparaisonViewModel, arrivee: StructureComparaisonViewModel): null | number {
  if (
    depart.latitude === null ||
    depart.longitude === null ||
    arrivee.latitude === null ||
    arrivee.longitude === null
  ) {
    return null
  }

  const rayonTerreKm = 6371
  const dLat = versRadians(arrivee.latitude - depart.latitude)
  const dLon = versRadians(arrivee.longitude - depart.longitude)
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(versRadians(depart.latitude)) * Math.cos(versRadians(arrivee.latitude)) * Math.sin(dLon / 2) ** 2

  return 2 * rayonTerreKm * Math.asin(Math.sqrt(hav))
}

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180
}
