import { SuppressionUtilisateurGateway, SupprimerMonCompte } from './SupprimerMonCompte'

describe('supprimer mon compte utilisateur', () => {
  it.each([
    [
      'quand le compte n’existe pas alors pas de suppression possible',
      'compteInexistant',
      gatewayCompteInexistant,
    ],
    [
      'quand le compte existe alors il est supprimé',
      'OK',
      gatewayCompteExistant,
    ],
  ])('%s', async (_, expected, gateway) => {
    // GIVEN
    const commandHandler = new SupprimerMonCompte(gateway)

    // WHEN
    const result = await commandHandler.execute({ utilisateurUid: 'fooId' })

    // THEN
    expect(result).toBe(expected)
  })
})

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
