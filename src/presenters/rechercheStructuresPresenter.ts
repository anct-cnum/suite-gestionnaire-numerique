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

type StructureSearchViewModel = Readonly<{
  isMembre: boolean
  label: string
  value: string
}>

function toStructureSearchViewModel({
  commune,
  isMembre,
  nom,
  uid,
}: UneStructureReadModel): StructureSearchViewModel {
  return {
    isMembre,
    label: nom + (commune ? ` — ${commune}` : ''),
    value: uid,
  }
}
