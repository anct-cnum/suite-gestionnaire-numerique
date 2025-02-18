import * as nextCache from 'next/cache'

import { ajouterUneFeuilleDeRouteAction } from './ajouterUneFeuilleDeRouteAction'

describe('ajouter une feuille de route action', () => {
  it('quand une feuille de route est ajoutée avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const messages = await ajouterUneFeuilleDeRouteAction({
      contratPreexistant: 'oui',
      nom: 'Feuille de route du Rhône',
      path: '/gouvernance/11/feuilles-de-route',
      perimetre: 'regional',
      uidGouvernance: 'gouvernanceFooId',
      uidMembre: 'membreFooId',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuilles-de-route')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une feuille de route est ajoutée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUneFeuilleDeRouteAction({
      contratPreexistant: 'oui',
      nom: 'Feuille de route du Rhône',
      path: '',
      perimetre: 'regional',
      uidGouvernance: 'gouvernanceFooId',
      uidMembre: 'membreFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
