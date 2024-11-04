import { DropUtilisateurByUidRepository } from './shared/UtilisateurRepository'
import { SupprimerMonCompte } from './SupprimerMonCompte'

describe('supprimer mon compte utilisateur', () => {
  it.each([
    [
      'quand le compte n’existe pas alors pas de suppression possible',
      'compteInexistant',
      repositoryCompteInexistant,
    ],
    [
      'quand le compte existe alors il est supprimé',
      'OK',
      repositoryCompteExistant,
    ],
  ])('%s', async (_, expected, repository) => {
    // GIVEN
    const commandHandler = new SupprimerMonCompte(repository)

    // WHEN
    const result = await commandHandler.execute({ utilisateurUid: 'fooId' })

    // THEN
    expect(result).toBe(expected)
  })
})

const repositoryCompteExistant: DropUtilisateurByUidRepository = {
  async dropByUid(): Promise<boolean> {
    return Promise.resolve(true)
  },
}

const repositoryCompteInexistant: DropUtilisateurByUidRepository = {
  async dropByUid(): Promise<boolean> {
    return Promise.resolve(false)
  },
}
