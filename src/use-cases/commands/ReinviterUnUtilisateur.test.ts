import { beforeEach, describe, expect, it } from 'vitest'

import { ReinviterUnUtilisateur } from './ReinviterUnUtilisateur'
import { EmailGateway } from './shared/EmailGateway'
import { GetUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { Destinataire } from '@/gateways/emails/invitationEmail'
import { epochTime, epochTimeMinusOneDay, invalidDate } from '@/shared/testHelper'

describe('réinviter un utilisateur', () => {
  beforeEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToUpdate = null
  })

  it('étant donné que l’utilisateur courant peut gérer l’utilisateur à réinviter, quand il le réinvite, la date d’invitation est mise à jour puis un e-mail lui est envoyé', async () => {
    // GIVEN
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(
      new RepositorySpy(),
      emailGatewayFactorySpy,
      epochTimeMinusOneDay
    )

    // WHEN
    const result = await reinviterUnUtilisateur.handle({
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecMemeRole',
    })

    // THEN
    expect(spiedDestinataire).toStrictEqual({
      email: spiedUtilisateurToUpdate?.state.emailDeContact,
      nom: spiedUtilisateurToUpdate?.state.nom,
      prenom: spiedUtilisateurToUpdate?.state.prenom,
    })
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      derniereConnexion: undefined,
      inviteLe: epochTimeMinusOneDay,
      role: 'Gestionnaire structure',
      uid: { email: 'uidUtilisateurAReinviterInactif', value: 'uidUtilisateurAReinviterInactif' },
    }).state)
    expect(result).toBe('OK')
  })

  it('étant donné que l’utilisateur courant ne peut pas gérer l’utilisateur à réinviter, quand il le réinvite, alors il y a une erreur', async () => {
    // GIVEN
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(
      new RepositorySpy(),
      emailGatewayFactorySpy,
      epochTime
    )

    // WHEN
    const result = await reinviterUnUtilisateur.handle({
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecRoleDifferent',
    })

    // THEN
    expect(spiedUidToFind).toBe('uidUtilisateurAReinviterInactif')
    expect(spiedUtilisateurToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasGererUtilisateurAReinviter')
  })

  it('étant donné que le compte de l’utilisateur à réinviter est déjà actif, quand il est réinvité, alors il y a une erreur', async () => {
    // GIVEN
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(
      new RepositorySpy(),
      emailGatewayFactorySpy,
      epochTime
    )

    // WHEN
    const result = await reinviterUnUtilisateur.handle({
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterActif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecRoleDifferent',
    })

    // THEN
    expect(spiedUidToFind).toBe('uidUtilisateurAReinviterActif')
    expect(spiedUtilisateurToUpdate).toBeNull()
    expect(result).toBe('utilisateurAReinviterDejaActif')
  })

  it('étant donné une date invalide d’invitation d’un utilisateur, quand il est réinvité, alors il y a une erreur', async () => {
    // GIVEN
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(
      new RepositorySpy(),
      emailGatewayFactorySpy,
      invalidDate
    )

    // WHEN
    const asyncResult = reinviterUnUtilisateur.handle({
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecMemeRole',
    })

    // THEN
    await expect(asyncResult).rejects.toThrow('dateDInvitationInvalide')
  })
})

const utilisateursByUid: Record<string, Utilisateur> = {
  uidUtilisateurAReinviterActif: utilisateurFactory({
    derniereConnexion: epochTime,
    inviteLe: epochTime,
    role: 'Gestionnaire structure',
    uid: { email: 'uidUtilisateurAReinviterActif', value: 'uidUtilisateurAReinviterActif' },
  }),
  uidUtilisateurAReinviterInactif: utilisateurFactory({
    derniereConnexion: undefined,
    inviteLe: epochTime,
    role: 'Gestionnaire structure',
    uid: { email: 'uidUtilisateurAReinviterInactif', value: 'uidUtilisateurAReinviterInactif' },
  }),
  uidUtilisateurCourantAvecMemeRole: utilisateurFactory({
    role: 'Gestionnaire structure',
    uid: { email: 'uidUtilisateurCourantAvecMemeRole', value: 'uidUtilisateurCourantAvecMemeRole' },
  }),
  uidUtilisateurCourantAvecRoleDifferent: utilisateurFactory({
    role: 'Gestionnaire département',
    uid: { email: 'uidUtilisateurCourantAvecRoleDifferent', value: 'uidUtilisateurCourantAvecRoleDifferent' },
  }),
}

let spiedUidToFind: string
let spiedUtilisateurToUpdate: null | Utilisateur
let spiedDestinataire: Destinataire

class RepositorySpy implements GetUtilisateurRepository, UpdateUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateursByUid[uid])
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}

function emailGatewayFactorySpy(): EmailGateway {
  return new class implements EmailGateway {
    async send(destinataire: Destinataire): Promise<void> {
      spiedDestinataire = destinataire
      return Promise.resolve()
    }
  }()
}
