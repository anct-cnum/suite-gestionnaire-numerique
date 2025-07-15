import { describe, expect, it } from 'vitest'

import { MesUtilisateursLoader, RechercherMesUtilisateurs, UtilisateursCourantsEtTotalReadModel } from './RechercherMesUtilisateurs'
import { utilisateurReadModelFactory } from '../testHelper'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

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
    await rechercherMesUtilisateurs.handle({ uid })

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
  spiedFindByUidIdArgs: Parameters<typeof MesUtilisateursLoaderSpy.prototype.findByUid> | undefined
  spiedFindMesUtilisateursEtLeTotalArgs:
    Parameters<typeof MesUtilisateursLoaderSpy.prototype.mesUtilisateursEtLeTotal> | undefined

  async findByUid(uid: string): Promise<UnUtilisateurReadModel> {
    this.spiedFindByUidIdArgs = [uid]
    return Promise.resolve(dummyUtilisateur)
  }

  async mesUtilisateursEtLeTotal(
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
}
