import { ModifierMesInformationsPersonnelles } from './ModifierMesInformationsPersonnelles'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
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
    expect(result).toBe('compteInexistant')
  })

  it('quand le compte existe alors il est modifié', async () => {
    // GIVEN
    const utilisateur = utilisateurFactory()
    const commandHandler = new ModifierMesInformationsPersonnelles(new RepositoryStub(utilisateur))

    // WHEN
    const result = await commandHandler.execute(informationsPersonnellesModifiees)

    // THEN
    const utilisateurApresMiseAJour = utilisateurFactory({
      email: 'martine.dugenoux@example.com',
      nom: 'Dugenoux',
      prenom: 'Martine',
      telephone: '0102030406',
    })
    expect(result).toBe('OK')
    expect(utilisateurApresMiseAJour.equals(utilisateur)).toBe(true)
  })
})

const informationsPersonnellesModifiees = {
  modification: {
    email: 'martine.dugenoux@example.com',
    nom: 'Dugenoux',
    prenom: 'Martine',
    telephone: '0102030406',
  },
  uid: 'fooId',
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

function utilisateurFactory(
  override: Partial<Parameters<typeof Utilisateur.create>[0]> = {}
): Utilisateur {
  return Utilisateur.create({
    email: 'michel.tartempion@example.org',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Banque des territoires',
    prenom: 'Michel',
    role: 'Instructeur',
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  })
}
