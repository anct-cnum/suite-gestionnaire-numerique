import { ModificationUtilisateurGateway, ModifierMesInformationsPersonnelles } from './ModifierMesInformationsPersonnelles'

describe('modifier mes informations personnelles', () => {
  it.each([
    [
      'quand le compte n’existe pas alors pas de modification possible',
      'compteInexistant',
      gatewayCompteInexistant,
    ],
    [
      'quand le compte existe alors il est modifié',
      'OK',
      gatewayCompteExistant,
    ],
  ])('%s', async (_, expected, gateway) => {
    // GIVEN
    const informationsPersonnellesModifiees = {
      modification: {
        email: 'martin.tartempion@example.com',
        nom: 'tartempion',
        prenom: 'martin',
        telephone: '0102030405',
      },
      uid: 'fooId',
    }
    const commandHandler = new ModifierMesInformationsPersonnelles(gateway)

    // WHEN
    const result = await commandHandler.execute(informationsPersonnellesModifiees)

    // THEN
    expect(result).toBe(expected)
  })
})

const gatewayCompteExistant: ModificationUtilisateurGateway = {
  async update(): Promise<boolean> {
    return Promise.resolve(true)
  },
}

const gatewayCompteInexistant: ModificationUtilisateurGateway = {
  async update(): Promise<boolean> {
    return Promise.resolve(false)
  },
}
