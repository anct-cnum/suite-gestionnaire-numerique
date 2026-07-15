import {
  RecupererStructuresAdministrativesReadModel,
  StructureAdministrativeItem,
} from '@/use-cases/queries/RecupererStructuresAdministratives'

export function listeStructuresAdministrativesPresenter(
  readModel: RecupererStructuresAdministrativesReadModel
): ListeStructuresAdministrativesViewModel {
  const structures = readModel.structures.map((structure) => ({
    adresse: formatAdresse(structure),
    antenne: structure.denomination_antenne,
    categorieJuridique: structure.categorie_juridique ?? '-',
    dejaFusionnee: structure.deja_fusionnee,
    estCanonique: structure.denomination_antenne === null,
    estGouvernance: structure.est_gouvernance,
    id: structure.id,
    identifiants: formatIdentifiants(structure),
    nbPersonnesEmployees: structure.nb_personnes_employees,
    nom: structure.denomination_sirene ?? '-',
    rattachements: formatRattachements(structure),
  }))

  return {
    displayPagination: readModel.total > readModel.limite,
    limite: readModel.limite,
    nombreDePages: Math.ceil(readModel.total / readModel.limite),
    page: readModel.page,
    structures,
    total: readModel.total,
  }
}

export interface ListeStructuresAdministrativesViewModel {
  displayPagination: boolean
  limite: number
  nombreDePages: number
  page: number
  structures: Array<StructureAdministrativeViewModel>
  total: number
}

export interface StructureAdministrativeViewModel {
  adresse: AdresseViewModel
  antenne: null | string
  categorieJuridique: string
  dejaFusionnee: boolean
  estCanonique: boolean
  estGouvernance: boolean
  id: number
  identifiants: Array<IdentifiantViewModel>
  nbPersonnesEmployees: number
  nom: string
  rattachements: RattachementsViewModel
}

interface IdentifiantViewModel {
  label: string
  valeur: string
  valeurCourte: string
}

interface AdresseViewModel {
  ligne1: string
  ligne2: string
}

interface RattachementsViewModel {
  details: Array<string>
  total: number
}

// Tous les identifiants portés par la structure, au format homogène « libellé + valeur » :
// identifiants légaux (siret, RNA, Ridet) puis ids des sources agrégées coop/tp/ac
// (mêmes libellés que la page de comparaison des doublons — plus fiable que `edited_by`,
// qui reflète le dernier éditeur et non l'origine de la donnée).
function formatIdentifiants(structure: StructureAdministrativeItem): Array<IdentifiantViewModel> {
  const identifiants: Array<Readonly<{ label: string; valeur: string }>> = []
  if (structure.siret !== null) {
    identifiants.push({ label: 'Siret', valeur: structure.siret })
  }
  if (structure.rna !== null) {
    identifiants.push({ label: 'RNA', valeur: structure.rna })
  }
  if (structure.ridet !== null) {
    identifiants.push({ label: 'Ridet', valeur: structure.ridet })
  }
  if (structure.structure_coop_id !== null) {
    identifiants.push({ label: 'Coop', valeur: structure.structure_coop_id })
  }
  if (structure.structure_tp_id !== null) {
    identifiants.push({ label: 'Idposte', valeur: String(structure.structure_tp_id) })
  }
  if (structure.structure_ac_id !== null) {
    identifiants.push({ label: 'Aidants Connect', valeur: structure.structure_ac_id })
  }

  return identifiants.map(({ label, valeur }) => ({ label, valeur, valeurCourte: tronquer(valeur) }))
}

// Les ids Coop et Aidants Connect sont des UUID de 36 caractères qui élargissent
// démesurément la colonne : on tronque l'affichage, la valeur complète reste
// disponible au survol et à la copie. Le siret (14 caractères) reste entier.
function tronquer(valeur: string): string {
  return valeur.length > 14 ? `${valeur.slice(0, 8)}…` : valeur
}

// Ventilation lisible des rattachements non nuls (ex : « 3 affectations emploi, 1 poste »)
// pour juger du poids réel d'une structure avant fusion ou nettoyage.
function formatRattachements(structure: StructureAdministrativeItem): RattachementsViewModel {
  const compteurs: ReadonlyArray<Readonly<{ nombre: number; pluriel: string; singulier: string }>> = [
    { nombre: structure.nb_affectations_emploi, pluriel: 'affectations emploi', singulier: 'affectation emploi' },
    { nombre: structure.nb_contacts, pluriel: 'contacts', singulier: 'contact' },
    { nombre: structure.nb_contrats, pluriel: 'contrats', singulier: 'contrat' },
    { nombre: structure.nb_membres_min, pluriel: 'membres MIN', singulier: 'membre MIN' },
    { nombre: structure.nb_postes, pluriel: 'postes', singulier: 'poste' },
    { nombre: structure.nb_utilisateurs_min, pluriel: 'utilisateurs MIN', singulier: 'utilisateur MIN' },
  ]

  return {
    details: compteurs
      .filter(({ nombre }) => nombre > 0)
      .map(({ nombre, pluriel, singulier }) => `${nombre} ${nombre > 1 ? pluriel : singulier}`),
    total: compteurs.reduce((total, { nombre }) => total + nombre, 0),
  }
}

function formatAdresse(structure: {
  code_postal: null | string
  nom_commune: null | string
  nom_voie: null | string
  numero_voie: null | number
}): AdresseViewModel {
  const voie = [structure.numero_voie, structure.nom_voie].filter(Boolean).join(' ')
  const commune = [structure.code_postal, structure.nom_commune].filter(Boolean).join(' ')
  const lignes = [voie, commune].filter(Boolean)

  if (lignes.length === 0) {
    return { ligne1: '-', ligne2: '' }
  }

  return { ligne1: lignes[0], ligne2: lignes[1] ?? '' }
}
