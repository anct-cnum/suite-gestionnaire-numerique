import { SuppressionUtilisateurGateway, SupprimerMonCompte } from './SupprimerMonCompte'

const gatewayCompteExistant: SuppressionUtilisateurGateway = {
  async delete(): Promise<boolean> {
    return Promise.resolve(true)
  },
}

const gatewayCompteInexistant: SuppressionUtilisateurGateway = {
  async delete(): Promise<boolean> {
    return Promise.resolve(false)
  },
}

describe('supprimer mon compte utilisateur', () => {
  it.each([
    {
      desc: 'le compte n’existe pas : pas de suppression possible',
      expected: 'compteInexistant',
      gateway: gatewayCompteInexistant,
    },
    {
      desc: 'le compte existe : il est supprimé',
      expected: 'OK',
      gateway: gatewayCompteExistant,
    },
  ])('$desc', async ({ gateway, expected }) => {
    // GIVEN
    const commandHandler = new SupprimerMonCompte(gateway)

    // WHEN
    const result = await commandHandler.execute('martin.tartempion@example.net')

    // THEN
    expect(result).toBe(expected)
  })
})
