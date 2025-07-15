import * as nextCache from 'next/cache'

import { modifierUneFeuilleDeRouteAction } from './modifierUneFeuilleDeRouteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierUneFeuilleDeRoute } from '@/use-cases/commands/ModifierUneFeuilleDeRoute'

describe('modifier une feuille de route action', () => {
  it('quand une feuille de route est modifiée avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUneFeuilleDeRoute.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierUneFeuilleDeRouteAction({
      nom: 'Feuille de route du Rhône',
      path: '/gouvernance/11/feuilles-de-route',
      perimetre: 'regional',
      uidFeuilleDeRoute: 'feuilleDeRouteFooId',
      uidGouvernance: 'gouvernanceFooId',
      uidPorteur: 'membreFooId',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuilles-de-route')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une feuille de route est modifiée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await modifierUneFeuilleDeRouteAction({
      nom: 'Feuille de route du Rhône',
      path: '',
      perimetre: 'regional',
      uidFeuilleDeRoute: 'feuilleDeRouteFooId',
      uidGouvernance: 'gouvernanceFooId',
      uidPorteur: 'membreFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
