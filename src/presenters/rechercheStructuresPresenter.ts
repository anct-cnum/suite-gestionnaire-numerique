import { StructuresReadModel, UneStructureReadModel } from '@/use-cases/queries/RechercherLesStructures'

export function makeSearchParams(
  search: string,
  extraSearchParams: URLSearchParams = new URLSearchParams()
): URLSearchParams {
  const searchParams = new URLSearchParams([['search', search]])
  extraSearchParams.entries().forEach(([searchParamKey, searchParamValue]) => {
    searchParams.append(searchParamKey, searchParamValue)
  })
  return searchParams
}

export function toStructureSearchViewModels(structures: StructuresReadModel): ReadonlyArray<StructureSearchViewModel> {
  return structures.map(toStructureSearchViewModel)
}

export type StructureSearchViewModel = Readonly<{
  label: string
  value: string
}>

function toStructureSearchViewModel({
  commune,
  nom,
  uid,
}: UneStructureReadModel): StructureSearchViewModel {
  return {
    label: nom + (commune ? ` — ${commune}` : ''),
    value: uid,
  }
}
