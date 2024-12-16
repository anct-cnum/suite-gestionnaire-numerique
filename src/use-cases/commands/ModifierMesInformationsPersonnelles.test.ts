import { ModifierMesInformationsPersonnelles } from './ModifierMesInformationsPersonnelles'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('modifier mes informations personnelles', () => {
  it('quand le compte n’existe pas alors pas de modification possible', async () => {
    // GIVEN
    const commandHandler = new ModifierMesInformationsPersonnelles(
      new RepositoryUtilisateurIntrouvableStub()
    )

    // WHEN
    const result = await commandHandler.execute(informationsPersonnellesModifiees)

    // THEN
    expect(result).toBe('utilisateurCourantInexistant')
  })

  describe('quand le compte existe', () => {
    describe('il n’est pas modifié si les modifications sont invalides', () => {
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
        const result = await commandHandler.execute({ ...informationsPersonnellesModifiees,
          modification: {
            ...informationsPersonnellesModifiees.modification,
            ...modification,
          } })

        // THEN
        expect(result).toBe(expectedResult)
      })
    })

    it('il et modifié si les modifications sont valides', async () => {
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
  readonly #utilisateur: Utilisateur | null

  constructor(utilisateur: Utilisateur | null = null) {
    this.#utilisateur = utilisateur
  }

  async find(): Promise<Utilisateur | null> {
    return Promise.resolve(this.#utilisateur)
  }

  async update(): Promise<void> {
    return Promise.resolve()
  }
}

class RepositoryUtilisateurIntrouvableStub extends RepositoryStub {
  override async find(): Promise<null> {
    return Promise.resolve(null)
  }
}
