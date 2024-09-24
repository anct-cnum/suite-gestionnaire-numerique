import { MesUtilisateursLoader, MesUtilisateursReadModel, RechercherMesUtilisateurs, UtilisateursCourantsEtTotalReadModel } from './RechercherMesUtilisateurs'
import { UnUtilisateurReadModel } from './RechercherUnUtilisateur'

describe('rechercher mes utilisateurs', () => {
  it('pour pouvoir récupérer mes utilisateurs et leur nombre total, je dois être préalablement identifié dans le système', async () => {
    // GIVEN
    const ssoId = '7396c91e-b9f2-4f9d-8547-5e7b3302725b'
    const pageCourante = 0
    const utilisateursParPage = 10
    const mesUtilisateursLoader = new MesUtilisateursLoaderSpy()
    const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(mesUtilisateursLoader)

    // WHEN
    await rechercherMesUtilisateurs.get({
      pageCourante,
      ssoId,
      utilisateursParPage,
    })

    // THEN
    expect(mesUtilisateursLoader.spiedFindBySsoIdArgs).toStrictEqual([ssoId])
    expect(mesUtilisateursLoader.spiedFindMesUtilisateursEtLeTotalArgs).toStrictEqual([
      dummyUtilisateur,
      pageCourante,
      utilisateursParPage,
    ])
  })
})

const date = new Date(0)
const dummyUtilisateur: MesUtilisateursReadModel = {
  departementCode: null,
  derniereConnexion: date,
  email: '',
  groupementId: null,
  inviteLe: date,
  isActive: true,
  isSuperAdmin: false,
  nom: '',
  prenom: '',
  regionCode: null,
  role: {
    categorie: 'anct',
    groupe: 'admin',
    nom: 'Administrateur dispositif',
    territoireOuStructure: '',
  },
  structureId: null,
  uid: '',
}

class MesUtilisateursLoaderSpy implements MesUtilisateursLoader {
  spiedFindMesUtilisateursEtLeTotalArgs: Parameters<typeof this.findMesUtilisateursEtLeTotal> | undefined
  spiedFindBySsoIdArgs: Parameters<typeof this.findBySsoId> | undefined

  async findMesUtilisateursEtLeTotal(
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    this.spiedFindMesUtilisateursEtLeTotalArgs = [utilisateur, pageCourante, utilisateursParPage]
    return Promise.resolve({
      total: 1,
      utilisateursCourants: [],
    })
  }

  async findBySsoId(ssoId: string): Promise<UnUtilisateurReadModel> {
    this.spiedFindBySsoIdArgs = [ssoId]
    return Promise.resolve(dummyUtilisateur)
  }
}
