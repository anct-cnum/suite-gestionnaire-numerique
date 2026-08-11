import { beforeEach, describe, expect, it } from 'vitest'

import { ChangerMonDepartement } from './ChangerMonDepartement'
import { StructurePrefectureDuDepartementLoader } from './InviterUnUtilisateur'
import {
  GetUtilisateurRepository,
  UpdateDepartementUtilisateurRepository,
  UpdateStructureUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('changer mon département', () => {
  beforeEach(() => {
    spiedCodeDepartement = ''
    spiedCodeDepartementPrefecture = ''
    spiedIdStructure = 0
    spiedUid = 0
    structurePrefecture = null
  })

  it('étant superadmin quand je change de département alors le département et la structure de la préfecture départementale sont mis à jour', async () => {
    // GIVEN
    structurePrefecture = 163
    const changerMonDepartement = new ChangerMonDepartement(utilisateurRepository, structurePrefectureLoaderSpy)

    // WHEN
    const result = await changerMonDepartement.handle({
      nouveauCodeDepartement: '02',
      uidUtilisateurCourant: 1,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUid).toBe(1)
    expect(spiedCodeDepartement).toBe('02')
    expect(spiedCodeDepartementPrefecture).toBe('02')
    expect(spiedIdStructure).toBe(163)
  })

  it('étant superadmin quand je change de département sans membre préfecture alors la structure est remise à null', async () => {
    // GIVEN
    structurePrefecture = null
    const changerMonDepartement = new ChangerMonDepartement(utilisateurRepository, structurePrefectureLoaderSpy)

    // WHEN
    const result = await changerMonDepartement.handle({
      nouveauCodeDepartement: '02',
      uidUtilisateurCourant: 1,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedIdStructure).toBeNull()
  })

  it('n’étant pas superadmin quand je change de département alors rien n’est mis à jour', async () => {
    // GIVEN
    const changerMonDepartement = new ChangerMonDepartement(utilisateurRepository, structurePrefectureLoaderSpy)

    // WHEN
    const result = await changerMonDepartement.handle({
      nouveauCodeDepartement: '02',
      uidUtilisateurCourant: 2,
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSonDepartement')
    expect(spiedCodeDepartement).toBe('')
    expect(spiedIdStructure).toBe(0)
  })
})

let spiedCodeDepartement: string
let spiedCodeDepartementPrefecture: string
let spiedIdStructure: null | number
let spiedUid: number
let structurePrefecture: null | number

const utilisateurByUid: Readonly<Record<number, Utilisateur>> = {
  1: utilisateurFactory({
    isSuperAdmin: true,
    uid: { email: 'martin.tartempion@example.fr', value: 1 },
  }),
  2: utilisateurFactory({
    isSuperAdmin: false,
    uid: { email: 'martin.tartempion@example.fr', value: 2 },
  }),
}

const utilisateurRepository = new (class
  implements GetUtilisateurRepository, UpdateDepartementUtilisateurRepository, UpdateStructureUtilisateurRepository
{
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurByUid[uid])
  }

  async updateDepartement(uid: UtilisateurUidState['value'], codeDepartement: string): Promise<void> {
    spiedUid = uid
    spiedCodeDepartement = codeDepartement
    return Promise.resolve()
  }

  async updateStructure(uid: UtilisateurUidState['value'], idStructure: null | number): Promise<void> {
    spiedUid = uid
    spiedIdStructure = idStructure
    return Promise.resolve()
  }
})()

const structurePrefectureLoaderSpy = new (class implements StructurePrefectureDuDepartementLoader {
  async structurePrefectureDuDepartement(codeDepartement: string): Promise<null | number> {
    spiedCodeDepartementPrefecture = codeDepartement
    return Promise.resolve(structurePrefecture)
  }
})()
