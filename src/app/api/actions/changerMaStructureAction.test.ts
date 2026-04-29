import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { changerMaStructureAction } from './changerMaStructureAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ChangerMaStructure } from '@/use-cases/commands/ChangerMaStructure'

describe('changer ma structure action', () => {
  it('étant donné un identifiant de structure correct, quand ma structure est changée, alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    const path = '/'
    const idStructure = 42
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(ChangerMaStructure.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await changerMaStructureAction({ idStructure, path })

    // THEN
    expect(ChangerMaStructure.prototype.handle).toHaveBeenCalledWith({
      idStructure,
      uidUtilisateurCourant: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(messages).toStrictEqual(['OK'])
  })

  it('étant donné un identifiant de structure invalide (zéro ou négatif), quand ma structure est changée, alors cela renvoie une erreur de validation', async () => {
    // GIVEN
    const idStructureInvalide = 0
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()

    // WHEN
    const messages = await changerMaStructureAction({ idStructure: idStructureInvalide, path: '/' })

    // THEN
    expect(nextCache.revalidatePath).not.toHaveBeenCalled()
    expect(messages).toStrictEqual(["L'identifiant de la structure doit être un entier positif"])
  })

  it("étant donné un échec métier, quand ma structure est changée, alors cela renvoie le message d'échec", async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    const path = '/'
    const idStructure = 42
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(ChangerMaStructure.prototype, 'handle').mockResolvedValueOnce('utilisateurNonAutoriseAChangerSaStructure')

    // WHEN
    const messages = await changerMaStructureAction({ idStructure, path })

    // THEN
    expect(messages).toStrictEqual(['utilisateurNonAutoriseAChangerSaStructure'])
  })
})
