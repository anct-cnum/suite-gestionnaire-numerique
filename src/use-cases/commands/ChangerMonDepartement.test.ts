import { beforeEach, describe, expect, it } from 'vitest'

import { ChangerMonDepartement, StructureDuDepartementLoader } from './ChangerMonDepartement'
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
    spiedCodeDepartementDemande = ''
    spiedIdStructure = 0
    spiedUid = ''
    spiedUidExclu = ''
    structureDuDepartement = null
  })

  it('étant superadmin quand je change de département alors le département et la structure du premier gestionnaire de ce département sont mis à jour', async () => {
    // GIVEN
    structureDuDepartement = 162
    const changerMonDepartement = new ChangerMonDepartement(utilisateurRepository, structureDuDepartementLoader)

    // WHEN
    const result = await changerMonDepartement.handle({
      nouveauCodeDepartement: '02',
      uidUtilisateurCourant: 'utilisateurSuperAdminUid',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUid).toBe('utilisateurSuperAdminUid')
    expect(spiedCodeDepartement).toBe('02')
    expect(spiedCodeDepartementDemande).toBe('02')
    expect(spiedIdStructure).toBe(162)
    expect(spiedUidExclu).toBe('utilisateurSuperAdminUid')
  })

  it('étant superadmin quand je change de département sans gestionnaire rattaché à une structure alors la structure est remise à null', async () => {
    // GIVEN
    structureDuDepartement = null
    const changerMonDepartement = new ChangerMonDepartement(utilisateurRepository, structureDuDepartementLoader)

    // WHEN
    const result = await changerMonDepartement.handle({
      nouveauCodeDepartement: '02',
      uidUtilisateurCourant: 'utilisateurSuperAdminUid',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedIdStructure).toBeNull()
  })

  it('n’étant pas superadmin quand je change de département alors rien n’est mis à jour', async () => {
    // GIVEN
    const changerMonDepartement = new ChangerMonDepartement(utilisateurRepository, structureDuDepartementLoader)

    // WHEN
    const result = await changerMonDepartement.handle({
      nouveauCodeDepartement: '02',
      uidUtilisateurCourant: 'utilisateurNonSuperAdminUid',
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSonDepartement')
    expect(spiedCodeDepartement).toBe('')
    expect(spiedIdStructure).toBe(0)
  })
})

let spiedCodeDepartement: string
let spiedCodeDepartementDemande: string
let spiedIdStructure: null | number
let spiedUid: string
let spiedUidExclu: string
let structureDuDepartement: null | number

const utilisateurByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurNonSuperAdminUid: utilisateurFactory({
    isSuperAdmin: false,
    uid: { email: 'martin.tartempion@example.fr', value: 'utilisateurNonSuperAdminUid' },
  }),
  utilisateurSuperAdminUid: utilisateurFactory({
    isSuperAdmin: true,
    uid: { email: 'martin.tartempion@example.fr', value: 'utilisateurSuperAdminUid' },
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

const structureDuDepartementLoader = new (class implements StructureDuDepartementLoader {
  async structureDuPremierGestionnaireDepartement(
    codeDepartement: string,
    uidUtilisateurExclu: string
  ): Promise<null | number> {
    spiedCodeDepartementDemande = codeDepartement
    spiedUidExclu = uidUtilisateurExclu
    return Promise.resolve(structureDuDepartement)
  }
})()
