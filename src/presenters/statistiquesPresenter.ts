// ------------------------------------------------------------------
// Types ViewModel — utilisés par les composants React
// ------------------------------------------------------------------

export type QuantifiedShare<TLabel = string> = {
  proportion: number
} & LabelAndCount<TLabel>

export type AccompagnementCountByPeriod = Array<{
  count: number
  label: string
}>

export type AccompagnementsStats = {
  accompagnements: {
    collectifs: {
      proportion: number
      total: number
    }
    individuels: {
      proportion: number
      total: number
    }
    total: number
  }
  activites: {
    collectifs: {
      participants: number
      proportion: number
      total: number
    }
    individuels: {
      proportion: number
      total: number
    }
    total: number
  }
  beneficiaires: {
    anonymes: number
    nouveaux: number
    suivis: number
    total: number
  }
}

export type ActivitesStats = {
  durees: Array<{ value: string } & QuantifiedShare>
  materiels: Array<{ value: string } & QuantifiedShare>
  tags?: Array<{ value: string } & QuantifiedShare>
  thematiques: Array<{ value: string } & QuantifiedShare>
  thematiquesDemarches: Array<{ value: string } & QuantifiedShare>
  total: number
  typeActivites: Array<{ value: string } & QuantifiedShare>
  typeLieu: Array<{ value: string } & QuantifiedShare>
}

export type BeneficiaireStats = {
  genres: Array<{ value: string } & QuantifiedShare>
  statutsSocial: Array<{ value: string } & QuantifiedShare>
  total: number
  trancheAges: Array<{ value: string } & QuantifiedShare>
}

export type BeneficiairesStatsWithCommunes = {
  communes: Array<
    {
      codeInsee: null | string
      codePostal: null | string
      nom: null | string
    } & QuantifiedShare
  >
} & BeneficiaireStats

export type StatistiquesMediateursData = {
  accompagnementsParJour: AccompagnementCountByPeriod
  accompagnementsParMois: AccompagnementCountByPeriod
  activites: ActivitesStats
  beneficiaires: BeneficiaireStats
  communes?: Array<QuantifiedShare>
  structures?: Array<QuantifiedShare>
  // #2251 : alternative en tableau de l'histogramme « Nombre d'accompagnements » (RGAA 1.6)
  tableauAccompagnementsParJour: TableauDeDonneesViewModel
  tableauAccompagnementsParMois: TableauDeDonneesViewModel
  totalCounts: AccompagnementsStats
}

// Tableau de données d'un graphique : la première colonne porte l'en-tête de ligne, les suivantes des nombres.
export type TableauDeDonneesViewModel = Readonly<{
  caption: string
  enTetes: ReadonlyArray<string>
  lignes: ReadonlyArray<ReadonlyArray<string>>
}>

// Ce que montre l'histogramme : au plus les 30 dernières barres (la vue par mois en compte déjà 12 au plus, #1286).
export function accompagnementsAffiches<T>(donnees: ReadonlyArray<T>): ReadonlyArray<T> {
  return donnees.slice(-NOMBRE_DE_JOURS_AFFICHES)
}

// #2251 : le tableau montre exactement les barres de l'histogramme, et le dit quand la période en compte davantage.
export function tableauAccompagnementsPresenter(
  donnees: ReadonlyArray<LabelAndCount>,
  granularite: 'jour' | 'mois'
): TableauDeDonneesViewModel {
  const parMois = granularite === 'mois'
  const plafond = parMois ? NOMBRE_DE_MOIS_AFFICHES : NOMBRE_DE_JOURS_AFFICHES
  const lignes = parMois ? donnees.slice(-NOMBRE_DE_MOIS_AFFICHES) : accompagnementsAffiches(donnees)
  const titre = `Nombre d’accompagnements par ${granularite}`
  const derniers = parMois ? `${plafond} derniers mois` : `${plafond} derniers jours`

  return {
    caption: donnees.length > plafond ? `${titre}, ${derniers} de la période` : titre,
    enTetes: [parMois ? 'Mois' : 'Jour', 'Accompagnements'],
    lignes: lignes.map(({ count, label }) => [
      parMois ? moisEnToutesLettres(label) : jourEnToutesLettres(label),
      count.toLocaleString('fr-FR'),
    ]),
  }
}

// « 2026-01-01 », « 2026-06-30 » → « Données du 1er janvier 2026 au 30 juin 2026 »
export function periodeStatistiquesPresenter(du: string, au: string): string {
  return `Données du ${dateEnToutesLettres(du)} au ${dateEnToutesLettres(au)}`
}

// Type helper privé (doit être après les types exportés pour satisfaire sort-modules)
type LabelAndCount<TLabel = string> = {
  count: number
  label: TLabel
}

const NOMBRE_DE_JOURS_AFFICHES = 30

const NOMBRE_DE_MOIS_AFFICHES = 12

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

// Libellé Coop « MM/AA » → « novembre 2025 »
function moisEnToutesLettres(label: string): string {
  const [mois, annee] = label.split('/').map(Number)
  return estMois(mois) && Number.isInteger(annee) ? `${MOIS[mois - 1]} ${2000 + annee}` : label
}

// Libellé Coop « JJ/MM » → « 1er novembre »
function jourEnToutesLettres(label: string): string {
  const [jour, mois] = label.split('/').map(Number)
  return estMois(mois) && Number.isInteger(jour) ? `${numeroDuJour(jour)} ${MOIS[mois - 1]}` : label
}

// « AAAA-MM-JJ » → « 1er janvier 2026 »
function dateEnToutesLettres(iso: string): string {
  const [annee, mois, jour] = iso.split('-').map(Number)
  return `${numeroDuJour(jour)} ${MOIS[mois - 1]} ${annee}`
}

function numeroDuJour(jour: number): string {
  return jour === 1 ? '1er' : String(jour)
}

function estMois(mois: number): boolean {
  return Number.isInteger(mois) && mois >= 1 && mois <= 12
}
