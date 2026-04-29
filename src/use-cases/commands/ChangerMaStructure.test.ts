import { beforeEach, describe, expect, it } from 'vitest'

import { ChangerMaStructure } from './ChangerMaStructure'
import { GetUtilisateurRepository, UpdateStructureUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('changer ma structure', () => {
  beforeEach(() => {
    spiedIdStructure = 0
    spiedUid = ''
  })

  it('étant superadmin quand je change de structure alors la structure est mise à jour', async () => {
    // GIVEN
    const changerMaStructure = new ChangerMaStructure(utilisateurRepository)

    // WHEN
    const result = await changerMaStructure.handle({
      idStructure: 42,
      uidUtilisateurCourant: 'utilisateurSuperAdminUid',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedIdStructure).toBe(42)
    expect(spiedUid).toBe('utilisateurSuperAdminUid')
  })

  it('n\u2019étant pas superadmin quand je change de structure alors la structure n\u2019est pas mise à jour', async () => {
    // GIVEN
    const changerMaStructure = new ChangerMaStructure(utilisateurRepository)

    // WHEN
    const result = await changerMaStructure.handle({
      idStructure: 42,
      uidUtilisateurCourant: 'utilisateurNonSuperAdminUid',
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSaStructure')
    expect(spiedIdStructure).toBe(0)
  })
})

let spiedIdStructure: number
let spiedUid: string

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

const utilisateurRepository = new (class implements GetUtilisateurRepository, UpdateStructureUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurByUid[uid])
  }

  async updateStructure(uid: UtilisateurUidState['value'], idStructure: number): Promise<void> {
    spiedIdStructure = idStructure
    spiedUid = uid
    return Promise.resolve()
  }
})()
