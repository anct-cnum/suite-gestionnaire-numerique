import { ChangerMonRole, UtilisateurRepository } from './ChangerMonRole'
import { RoleState } from '@/domain/Role'
import { UtilisateurState, Utilisateur } from '@/domain/Utilisateur'

const nullUtilisateur = {} as Utilisateur

let spiedUtilisateur: Utilisateur = nullUtilisateur

const utilisateurRepository: UtilisateurRepository = {
  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateur = utilisateur
    return Promise.resolve()
  },
}

describe('changer mon rôle', () => {
  afterEach(() => {
    spiedUtilisateur = nullUtilisateur
  })

  it('ayant le rôle super admin quand un utilisateur change de rôle alors le rôle est modifié', async () => {
    // GIVEN
    const utilisateur = Utilisateur.create({
      email: 'martin.tartempion@example.net',
      isSuperAdmin: true,
      nom: 'tartempion',
      organisation: 'Dispositif Lambda',
      prenom: 'martin',
      role: 'Administrateur dispositif',
      uid: 'fooId',
    })
    const nouveauRoleState: Omit<RoleState, 'categorie'> = {
      groupe: 'admin',
      nom: 'Pilote politique publique',
      territoireOuStructure: '',
    }
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRoleState,
      utilisateurState: utilisateur.state(),
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateur.state()).toStrictEqual<UtilisateurState>({
      ...utilisateur.state(),
      role: { ...nouveauRoleState, categorie: 'anct' },
    })
  })

  it('n’ayant pas le rôle super admin quand un utilisateur change de rôle alors le rôle est n’est pas modifié', async () => {
    // GIVEN
    const utilisateur = Utilisateur.create({
      email: 'martin.tartempion@example.net',
      isSuperAdmin: false,
      nom: 'tartempion',
      organisation: 'Dispositif Lambda',
      prenom: 'martin',
      role: 'Administrateur dispositif',
      uid: 'fooId',
    })
    const nouveauRoleState: Omit<RoleState, 'categorie'> = {
      groupe: 'admin',
      nom: 'Pilote politique publique',
      territoireOuStructure: '',
    }
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.execute({
      nouveauRoleState,
      utilisateurState: utilisateur.state(),
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSonRole')
    expect(spiedUtilisateur).toStrictEqual(nullUtilisateur)
  })
})
