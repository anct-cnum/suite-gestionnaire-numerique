import { ChangerMonRole } from './ChangerMonRole'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('changer mon rôle', () => {
  beforeEach(() => {
    spiedUtilisateur = nullUtilisateur
  })

  it('ayant le rôle super admin quand un utilisateur change de rôle alors le rôle est modifié', async () => {
    // GIVEN
    const nouveauRole = 'Pilote politique publique'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRole,
      uidUtilisateurCourant: 'utilisateurSuperAdminUid',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateur.state).toStrictEqual(utilisateurFactory({
      isSuperAdmin: true,
      role: 'Pilote politique publique',
      uid: { email: 'martin.tartempion@example.fr', value: 'utilisateurSuperAdminUid' },
    }).state)
  })

  it('n’ayant pas le rôle super admin quand un utilisateur change de rôle alors le rôle est n’est pas modifié', async () => {
    // GIVEN
    const nouveauRole = 'Pilote politique publique'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRole,
      uidUtilisateurCourant: 'utilisateurNonSuperAdminUid',
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSonRole')
    expect(spiedUtilisateur).toStrictEqual(nullUtilisateur)
  })
})

const nullUtilisateur = {} as Utilisateur

let spiedUtilisateur: Utilisateur

const utilisateurByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurNonSuperAdminUid: utilisateurFactory({
    isSuperAdmin: false,
    uid: { email: 'martin.tartempion@example.fr', value: 'utilisateurNonSuperAdminUid' },
  }),
  utilisateurSuperAdminUid: utilisateurFactory({
    isSuperAdmin: true,
    uid: { email: 'martin.tartempion@example.fr', value: 'utilisateurSuperAdminUid' },
  }),
}

const utilisateurRepository = new class implements FindUtilisateurRepository, UpdateUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurByUid[uid])
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateur = utilisateur
    return Promise.resolve()
  }
}()
