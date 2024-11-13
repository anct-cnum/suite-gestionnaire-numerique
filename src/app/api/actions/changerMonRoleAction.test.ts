import * as nextCache from 'next/cache'
import { ZodIssue } from 'zod'

import { changerMonRoleAction } from './changerMonRoleAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

describe('changer mon rôle action', () => {
  it('étant donné un nouveau rôle correct quand mon rôle est changé alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    const path = '/'
    const nouveauRole = 'Instructeur'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const result = await changerMonRoleAction({ nouveauRole, path })

    // THEN
    expect(ChangerMonRole.prototype.execute).toHaveBeenCalledWith({
      nouveauRole,
      utilisateurUid: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(result).toBe('OK')
  })

  it('étant donné un nouveau rôle incorrect quand mon rôle est changé alors cela renvoie une erreur', async () => {
    // GIVEN
    const nouveauRoleIncorrect = 'fake-role'

    // WHEN
    const result = await changerMonRoleAction({ nouveauRole: nouveauRoleIncorrect, path: '/' })

    // THEN
    expect((result as ReadonlyArray<ZodIssue>)[0].message).toBe('Le rôle n’est pas correct')
  })

  it('étant donné un path incorrect quand mon rôle est changé alors cela renvoie une erreur', async () => {
    // GIVEN
    const nouveauRole = 'Instructeur'
    const pathIncorrect = ''

    // WHEN
    // @ts-expect-error
    const result = await changerMonRoleAction({ nouveauRole, path: pathIncorrect })

    // THEN
    expect((result as ReadonlyArray<ZodIssue>)[0].message).toBe('Le chemin n’est pas correct')
  })
})
