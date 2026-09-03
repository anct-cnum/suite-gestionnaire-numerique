import { beforeEach, describe, expect, it } from 'vitest'

import { ChangerMaRegion } from './ChangerMaRegion'
import { GetUtilisateurRepository, UpdateRegionUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('changer ma région', () => {
  beforeEach(() => {
    spiedUidAndCodeRegion = null
  })

  it('ayant le rôle super admin quand un utilisateur change de région alors la région est modifiée', async () => {
    // GIVEN
    const changerMaRegion = new ChangerMaRegion(utilisateurRepository)

    // WHEN
    const result = await changerMaRegion.handle({
      nouveauCodeRegion: '84',
      uidUtilisateurCourant: 1,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUidAndCodeRegion).toStrictEqual({ codeRegion: '84', uid: 1 })
  })

  it('n’ayant pas le rôle super admin quand un utilisateur change de région alors la région n’est pas modifiée', async () => {
    // GIVEN
    const changerMaRegion = new ChangerMaRegion(utilisateurRepository)

    // WHEN
    const result = await changerMaRegion.handle({
      nouveauCodeRegion: '84',
      uidUtilisateurCourant: 2,
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSaRegion')
    expect(spiedUidAndCodeRegion).toBeNull()
  })
})

let spiedUidAndCodeRegion: null | Readonly<{ codeRegion: string; uid: number }>

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

const utilisateurRepository = new (class implements GetUtilisateurRepository, UpdateRegionUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurByUid[uid])
  }

  async updateRegion(uid: UtilisateurUidState['value'], codeRegion: string): Promise<void> {
    spiedUidAndCodeRegion = { codeRegion, uid }
    return Promise.resolve()
  }
})()
