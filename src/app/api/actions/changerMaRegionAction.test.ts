import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { changerMaRegionAction } from './changerMaRegionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ChangerMaRegion } from '@/use-cases/commands/ChangerMaRegion'

describe('changer ma région action', () => {
  it('étant donné un code région correct, quand ma région est changée, alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 1
    const path = '/'
    const nouveauCodeRegion = '84'
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce(undefined)
    vi.spyOn(ChangerMaRegion.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await changerMaRegionAction({ nouveauCodeRegion, path })

    // THEN
    expect(ChangerMaRegion.prototype.handle).toHaveBeenCalledWith({
      nouveauCodeRegion,
      uidUtilisateurCourant: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(messages).toStrictEqual(['OK'])
  })

  it('étant donné un code région incorrect, quand ma région est changée, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await changerMaRegionAction({ nouveauCodeRegion: 'fake-region', path: '/' })

    // THEN
    expect(messages).toStrictEqual(["Le code région n'est pas correct"])
  })

  it('étant donné la pseudo-région « Autres territoires », quand ma région est changée, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await changerMaRegionAction({ nouveauCodeRegion: '00', path: '/' })

    // THEN
    expect(messages).toStrictEqual(["Le code région n'est pas correct"])
  })

  it('étant donné un path non renseigné quand ma région est changée alors cela renvoie une erreur', async () => {
    // GIVEN
    const nouveauCodeRegion = '84'
    const pathIncorrect = ''

    // WHEN
    const messages = await changerMaRegionAction({ nouveauCodeRegion, path: pathIncorrect })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
