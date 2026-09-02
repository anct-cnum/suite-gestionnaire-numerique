import { cache } from 'react'

import departements from '../../../../ressources/departements.json'
import { PrismaScopeTerritorialLoader } from '@/gateways/PrismaScopeTerritorialLoader'
import { BoundingBoxReadModel } from '@/use-cases/queries/RecupererScopeTerritorial'
import { FiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

export type TerritoireVitrine =
  | Readonly<{
      bbox: BoundingBoxReadModel
      code: string
      codeDepartement: null | string
      codesInsee: ReadonlyArray<string>
      nom: string
      nombreDepartements: number
      type: 'epci'
    }>
  | Readonly<{
      bbox: BoundingBoxReadModel
      code: string
      codesDepartement: ReadonlyArray<string>
      nom: string
      type: 'region'
    }>
  | Readonly<{ code: string; type: 'departement' }>
  | Readonly<{ type: 'national' }>

// cache() déduplique la résolution entre generateMetadata et la page au sein d'une même requête.
export const recupererTerritoireVitrine = cache(
  async (niveau: string, code: string | undefined): Promise<null | TerritoireVitrine> => {
    if (niveau === 'national') {
      return { type: 'national' }
    }
    if (code === undefined || code === '') {
      return null
    }
    if (niveau === 'departement') {
      const departementConnu = (departements as ReadonlyArray<Readonly<{ code: string }>>).some(
        (departement) => departement.code === code
      )
      return departementConnu ? { code, type: 'departement' } : null
    }
    if (niveau === 'region') {
      const scope = await new PrismaScopeTerritorialLoader().getRegion(code)
      return scope === null ? null : { ...scope, type: 'region' }
    }
    if (niveau === 'epci') {
      const scope = await new PrismaScopeTerritorialLoader().getEpci(code)
      return scope === null ? null : { ...scope, type: 'epci' }
    }
    return null
  }
)

export function filtreDuTerritoire(territoire: TerritoireVitrine): FiltreTerritorial {
  switch (territoire.type) {
    case 'departement':
      return { code: territoire.code, type: 'departement' }
    case 'epci':
      return { codesInsee: territoire.codesInsee, type: 'communes' }
    case 'national':
      return { type: 'national' }
    case 'region':
      return { codes: territoire.codesDepartement, type: 'departements' }
  }
}
