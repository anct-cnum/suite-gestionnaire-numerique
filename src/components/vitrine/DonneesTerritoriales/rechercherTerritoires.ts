import { rechercheTerritoiresPresenter } from '@/presenters/rechercheTerritoiresPresenter'

export async function rechercherTerritoires(
  terme: string
): Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]> {
  return fetch(`/api/territoires?q=${encodeURIComponent(terme)}`).then(
    async (reponse) => reponse.json() as Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]>
  )
}
