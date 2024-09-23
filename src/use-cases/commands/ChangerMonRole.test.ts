import { ChangerMonRole, UtilisateurRepository } from './ChangerMonRole'
import { Role, RoleState } from '@/domain/Role'
import { Utilisateur, UtilisateurState } from '@/domain/Utilisateur'

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
    const utilisateur = new Utilisateur(
      'fooId',
      new Role('Administrateur dispositif'),
      'tartempion',
      'martin',
      'martin.tartempion@example.net',
      true
    )
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
    const utilisateur = new Utilisateur(
      'fooId',
      new Role('Administrateur dispositif'),
      'tartempion',
      'martin',
      'martin.tartempion@example.net',
      false
    )
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
