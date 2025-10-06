import { RecupererTerritoireUtilisateur, TerritoireDepartementsLoader, TerritoireReadModel } from './RecupererTerritoireUtilisateur'
import { utilisateurFactory } from '@/domain/testHelper'

describe('récupérer territoire utilisateur', () => {
  it('quand l\'utilisateur est administrateur alors le territoire est France', async () => {
    // GIVEN
    const utilisateur = utilisateurFactory({ role: 'Administrateur dispositif' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub())

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['France'],
      type: 'france',
    })
  })

  it('quand l\'utilisateur est gestionnaire département alors le territoire est le département', async () => {
    // GIVEN
    const utilisateur = utilisateurFactory({ codeOrganisation: '69', role: 'Gestionnaire département' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub())

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['69'],
      type: 'departement',
    })
  })

  it('quand l\'utilisateur est gestionnaire structure alors le territoire est le département de la structure', async () => {
    // GIVEN
    const utilisateur = utilisateurFactory({ codeOrganisation: '123', role: 'Gestionnaire structure' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub('75'))

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['75'],
      type: 'departement',
    })
  })

  it('quand l\'utilisateur est gestionnaire structure sans département alors le territoire est vide', async () => {
    // GIVEN
    const utilisateur = utilisateurFactory({ codeOrganisation: '123', role: 'Gestionnaire structure' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub(null))

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: [],
      type: 'departement',
    })
  })
})

class TerritoireDepartementsLoaderStub implements TerritoireDepartementsLoader {
  readonly #departementCode: null | string

  constructor(departementCode: null | string = '69') {
    this.#departementCode = departementCode
  }

  async getDepartementCodeByStructureId(): Promise<null | string> {
    return Promise.resolve(this.#departementCode)
  }
}
