import { MesUtilisateursLoader, RechercherMesUtilisateurs, UtilisateursCourantsEtTotalReadModel } from './RechercherMesUtilisateurs'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

describe('rechercher mes utilisateurs', () => {
  it('recherchant sans filtre alors je récupère mes utilisateurs et leur nombre total', async () => {
    // GIVEN
    const uid = 'uid'
    const pageCourante = 0
    const utilisateursParPage = 10
    const utilisateursActives = false
    const roles: ReadonlyArray<string> = []
    const mesUtilisateursLoader = new MesUtilisateursLoaderSpy()
    const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(mesUtilisateursLoader)

    // WHEN
    await rechercherMesUtilisateurs.get({
      pageCourante,
      roles,
      uid: uid,
      utilisateursActives,
      utilisateursParPage,
    })

    // THEN
    expect(mesUtilisateursLoader.spiedFindByUidIdArgs).toStrictEqual([uid])
    expect(mesUtilisateursLoader.spiedFindMesUtilisateursEtLeTotalArgs).toStrictEqual([
      dummyUtilisateur,
      pageCourante,
      utilisateursParPage,
      utilisateursActives,
    ])
  })
})

const date = new Date(0)
const dummyUtilisateur: UnUtilisateurReadModel = {
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
  telephone: '',
  uid: '',
}

class MesUtilisateursLoaderSpy implements MesUtilisateursLoader {
  spiedFindMesUtilisateursEtLeTotalArgs: Parameters<typeof this.findMesUtilisateursEtLeTotal> | undefined
  spiedFindByUidIdArgs: Parameters<typeof this.findByUid> | undefined

  async findMesUtilisateursEtLeTotal(
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    this.spiedFindMesUtilisateursEtLeTotalArgs = [utilisateur, pageCourante, utilisateursParPage, utilisateursActives]
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
