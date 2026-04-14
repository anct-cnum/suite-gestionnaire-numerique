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
  totalCounts: AccompagnementsStats
}

// Type helper privé (doit être après les types exportés pour satisfaire sort-modules)
type LabelAndCount<TLabel = string> = {
  count: number
  label: TLabel
}
