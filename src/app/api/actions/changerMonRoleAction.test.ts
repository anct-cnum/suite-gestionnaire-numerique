import { changerMonRoleAction } from './changerMonRoleAction'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

describe('changer mon rôle action', () => {
  it('étant donné des informations personnelles correctes quand mon rôle est changé alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    // @ts-expect-error
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub } })
    vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('OK')

    const sessionUtilisateurViewModel: SessionUtilisateurViewModel = {
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: {
        groupe: 'admin',
        libelle: 'Lambda',
        nom: 'Administrateur dispositif',
        pictogramme: 'anct',
      },
      uid: 'fooId',
    }
    const nouveauRole = 'Instructeur'

    // WHEN
    const result = await changerMonRoleAction(sessionUtilisateurViewModel, nouveauRole)

    // THEN
    expect(ChangerMonRole.prototype.execute).toHaveBeenCalledWith({
      nouveauRoleState: {
        nom: 'Instructeur',
        territoireOuStructure: '',
      },
      utilisateurState: {
        ...sessionUtilisateurViewModel,
        isSuperAdmin: true,
        role: {
          nom: 'Administrateur dispositif',
          territoireOuStructure: 'Lambda',
        },
      },
    })
    expect(result).toBe('OK')
  })
})
