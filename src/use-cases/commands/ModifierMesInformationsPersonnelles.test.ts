import { ModifierMesInformationsPersonnelles } from './ModifierMesInformationsPersonnelles'
import { GetUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('modifier mes informations personnelles', () => {
  beforeEach(() => {
    spiedMesInformationsPersonnellesToModify = null
    spiedUtilisateurUidToFind = null
  })

  describe('le compte n’est pas modifié si les modifications sont invalides', () => {
    it.each([
      {
        desc: 'le prénom doit être renseigné',
        expectedResult: 'prenomAbsent',
        modification: { prenom: '' },
      },
      {
        desc: 'le nom doit être renseigné',
        expectedResult: 'nomAbsent',
        modification: { nom: '' },
      },
      {
        desc: 'l’email, si renseigné, doit être valide',
        expectedResult: 'emailInvalide',
        modification: { emailDeContact: 'example@example' },
      },
      {
        desc: 'le téléphone, si renseigné, doit être valide',
        expectedResult: 'telephoneInvalide',
        modification: { telephone: '000' },
      },
    ])('$desc', async ({ modification, expectedResult }) => {
      // GIVEN
      const commandHandler = new ModifierMesInformationsPersonnelles(new RepositorySpy())

      // WHEN
      const result = await commandHandler.handle({
        ...informationsPersonnellesModifiees,
        modification: {
          ...informationsPersonnellesModifiees.modification,
          ...modification,
        },
      })

      // THEN
      expect(spiedMesInformationsPersonnellesToModify).toBeNull()
      expect(result).toBe(expectedResult)
    })
  })

  it('le compte est modifié si les modifications sont valides', async () => {
    // GIVEN
    const commandHandler = new ModifierMesInformationsPersonnelles(new RepositorySpy())

    // WHEN
    const result = await commandHandler.handle(informationsPersonnellesModifiees)

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('fooId')
    expect(spiedMesInformationsPersonnellesToModify?.state).toStrictEqual(utilisateurFactory({
      emailDeContact: 'martine.dugenoux@example.com',
      nom: 'Dugenoux',
      prenom: 'Martine',
      telephone: '0102030406',
    }).state)
    expect(result).toBe('OK')
  })
})

const informationsPersonnellesModifiees = {
  modification: {
    emailDeContact: 'martine.dugenoux@example.com',
    nom: 'Dugenoux',
    prenom: 'Martine',
    telephone: '0102030406',
  },
  uidUtilisateurCourant: 'fooId',
}
let spiedMesInformationsPersonnellesToModify: Utilisateur | null
let spiedUtilisateurUidToFind: UtilisateurUidState['value'] | null

class RepositorySpy implements GetUtilisateurRepository, UpdateUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory())
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedMesInformationsPersonnellesToModify = utilisateur
    return Promise.resolve()
  }
}
