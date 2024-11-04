import { ChangerMonRole } from './ChangerMonRole'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('changer mon rôle', () => {
  afterEach(() => {
    spiedUtilisateur = nullUtilisateur
  })

  it('ayant le rôle super admin quand un utilisateur change de rôle alors le rôle est modifié', async () => {
    // GIVEN
    const nouveauRole = 'Pilote politique publique'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRole,
      utilisateurUid: 'utilisateurSuperAdminUid',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateur.equals(utilisateurFactory({
      isSuperAdmin: true,
      role: 'Pilote politique publique',
      uid: 'utilisateurSuperAdminUid',
    }))).toBe(true)
  })

  it('n’ayant pas le rôle super admin quand un utilisateur change de rôle alors le rôle est n’est pas modifié', async () => {
    // GIVEN
    const nouveauRole = 'Pilote politique publique'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRole,
      utilisateurUid: 'utilisateurNonSuperAdminUid',
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSonRole')
    expect(spiedUtilisateur).toStrictEqual(nullUtilisateur)
  })

  it('mon compte est introuvable : pas de modification possible', async () => {
    // GIVEN
    const nouveauRole = 'Pilote politique publique'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRole,
      utilisateurUid: 'utilisateurIntrouvableUid',
    })

    // THEN
    expect(result).toBe('compteInexistant')
    expect(spiedUtilisateur).toStrictEqual(nullUtilisateur)
  })
})

const nullUtilisateur = {} as Utilisateur

let spiedUtilisateur: Utilisateur = nullUtilisateur

const utilisateurByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurNonSuperAdminUid: utilisateurFactory({
    isSuperAdmin: false,
    uid: 'utilisateurNonSuperAdminUid',
  }),
  utilisateurSuperAdminUid: utilisateurFactory({
    isSuperAdmin: true,
    uid: 'utilisateurSuperAdminUid',
  }),
}

const utilisateurRepository = new class implements FindUtilisateurRepository, UpdateUtilisateurRepository {
  async find(uid: string): Promise<Utilisateur | null> {
    return Promise.resolve(utilisateurByUid[uid] ?? null)
  }
  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateur = utilisateur
    return Promise.resolve()
  }
}()
