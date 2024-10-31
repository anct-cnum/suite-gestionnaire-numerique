import { changerMonRoleAction } from './changerMonRoleAction'
import { profileFactory } from './testHelper'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

describe('changer mon rôle action', () => {
  it('étant donné un nouveau rôle correct quand mon rôle est changé alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(profileFactory({ sub }))
    vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('OK')

    const nouveauRole = 'Instructeur'

    // WHEN
    const result = await changerMonRoleAction(nouveauRole)

    // THEN
    expect(ChangerMonRole.prototype.execute).toHaveBeenCalledWith({
      nouveauRole,
      utilisateurUid: sub,
    })
    expect(result).toBe('OK')
  })

  it('étant donné un nouveau rôle incorrect quand mon rôle est changé alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(profileFactory({ sub }))
    vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('OK')

    const nouveauRole = 'fake-role'

    // WHEN
    const result = await changerMonRoleAction(nouveauRole)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le rôle n’est pas correct')
  })
})
