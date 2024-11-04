import { MesUtilisateursLoader, RechercherMesUtilisateurs, UtilisateursCourantsEtTotalReadModel } from './RechercherMesUtilisateurs'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'
import { utilisateurReadModelFactory } from '../testHelper'

describe('rechercher mes utilisateurs', () => {
  it('recherchant sans filtre alors je récupère mes utilisateurs et leur nombre total', async () => {
    // GIVEN
    const uid = 'uid'
    const pageCourante = 0
    const utilisateursParPage = 10
    const utilisateursActives = false
    const mesUtilisateursLoader = new MesUtilisateursLoaderSpy()
    const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(mesUtilisateursLoader)

    // WHEN
    await rechercherMesUtilisateurs.get({ uid })

    // THEN
    expect(mesUtilisateursLoader.spiedFindByUidIdArgs).toStrictEqual([uid])
    expect(mesUtilisateursLoader.spiedFindMesUtilisateursEtLeTotalArgs).toStrictEqual([
      dummyUtilisateur,
      pageCourante,
      utilisateursParPage,
      utilisateursActives,
      [],
      '0',
      '0',
    ])
  })
})

const dummyUtilisateur = utilisateurReadModelFactory()

class MesUtilisateursLoaderSpy implements MesUtilisateursLoader {
  spiedFindMesUtilisateursEtLeTotalArgs: Parameters<typeof this.findMesUtilisateursEtLeTotal> | undefined
  spiedFindByUidIdArgs: Parameters<typeof this.findByUid> | undefined

  async findMesUtilisateursEtLeTotal(
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    this.spiedFindMesUtilisateursEtLeTotalArgs = [
      utilisateur,
      pageCourante,
      utilisateursParPage,
      utilisateursActives,
      roles,
      codeDepartement,
      codeRegion,
    ]
    return Promise.resolve({
      total: 1,
      utilisateursCourants: [],
    })
  }

  async findByUid(uid: string): Promise<UnUtilisateurReadModel> {
    this.spiedFindByUidIdArgs = [uid]
    return Promise.resolve(dummyUtilisateur)
  }
}
