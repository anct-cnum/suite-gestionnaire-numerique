import * as nextCache from 'next/cache'

import { changerMonRoleAction } from './changerMonRoleAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

describe('changer mon rôle action', () => {
  it('étant donné un nouveau rôle correct, quand mon rôle est changé, alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    const path = '/'
    const nouveauRole = 'Instructeur'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await changerMonRoleAction({ nouveauRole, path })

    // THEN
    expect(ChangerMonRole.prototype.execute).toHaveBeenCalledWith({
      nouveauRole,
      uidUtilisateurCourant: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(messages).toStrictEqual(['OK'])
  })

  it('étant donné un nouveau rôle incorrect, quand mon rôle est changé, alors cela renvoie une erreur', async () => {
    // GIVEN
    const nouveauRoleIncorrect = 'fake-role'

    // WHEN
    const messages = await changerMonRoleAction({ nouveauRole: nouveauRoleIncorrect, path: '/' })

    // THEN
    expect(messages).toStrictEqual(['Le rôle n’est pas correct'])
  })

  it('étant donné un path non renseigné quand mon rôle est changé alors cela renvoie une erreur', async () => {
    // GIVEN
    const nouveauRole = 'Instructeur'
    const pathIncorrect = ''

    // WHEN
    const messages = await changerMonRoleAction({ nouveauRole, path: pathIncorrect })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
