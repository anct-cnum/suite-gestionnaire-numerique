import { ModifierMesInformationsPersonnelles } from './ModifierMesInformationsPersonnelles'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('modifier mes informations personnelles', () => {
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
      const utilisateur = utilisateurFactory()
      const commandHandler = new ModifierMesInformationsPersonnelles(new RepositoryStub(utilisateur))

      // WHEN
      const result = await commandHandler.execute({
        ...informationsPersonnellesModifiees,
        modification: {
          ...informationsPersonnellesModifiees.modification,
          ...modification,
        },
      })

      // THEN
      expect(result).toBe(expectedResult)
    })
  })

  it('le compte est modifié si les modifications sont valides', async () => {
    // GIVEN
    const utilisateur = utilisateurFactory()
    const commandHandler = new ModifierMesInformationsPersonnelles(new RepositoryStub(utilisateur))

    // WHEN
    const result = await commandHandler.execute(informationsPersonnellesModifiees)

    // THEN
    const utilisateurApresMiseAJour = utilisateurFactory({
      emailDeContact: 'martine.dugenoux@example.com',
      nom: 'Dugenoux',
      prenom: 'Martine',
      telephone: '0102030406',
    })
    expect(result).toBe('OK')
    expect(utilisateurApresMiseAJour.state).toStrictEqual(utilisateur.state)
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

class RepositoryStub implements FindUtilisateurRepository, UpdateUtilisateurRepository {
  readonly #utilisateur: Utilisateur

  constructor(utilisateur: Utilisateur) {
    this.#utilisateur = utilisateur
  }

  async find(): Promise<Utilisateur> {
    return Promise.resolve(this.#utilisateur)
  }

  async update(): Promise<void> {
    return Promise.resolve()
  }
}
