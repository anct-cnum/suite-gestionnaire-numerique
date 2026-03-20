import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { ajouterUneFeuilleDeRouteAction } from './ajouterUneFeuilleDeRouteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUneFeuilleDeRoute } from '@/use-cases/commands/AjouterUneFeuilleDeRoute'

describe('ajouter une feuille de route action', () => {
  it('quand une feuille de route est ajoutée avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUneFeuilleDeRoute.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUneFeuilleDeRouteAction({
      nom: 'Feuille de route du Rhône',
      path: '/gouvernance/11/feuilles-de-route',
      perimetre: 'regional',
      uidGouvernance: 'gouvernanceFooId',
      uidPorteur: 'porteurFooId',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuilles-de-route')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une feuille de route est ajoutée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUneFeuilleDeRouteAction({
      nom: 'Feuille de route du Rhône',
      path: '',
      perimetre: 'regional',
      uidGouvernance: 'gouvernanceFooId',
      uidPorteur: 'porteurFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
