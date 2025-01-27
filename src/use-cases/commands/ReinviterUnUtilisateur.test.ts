import { ReinviterUnUtilisateur } from './ReinviterUnUtilisateur'
import { EmailGateway } from './shared/EmailGateway'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('réinviter un utilisateur', () => {
  beforeEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToUpdate = null
  })

  it('étant donné que l’utilisateur courant peut gérer l’utilisateur à réinviter, quand il le réinvite, la date d’invitation est mise à jour puis un e-mail lui est envoyé', async () => {
    // GIVEN
    const date = new Date('2023-02-03')
    const repository = new RepositorySpy()
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(repository, emailGatewayFactorySpy, date)
    const command = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecMemeRole',
    }

    // WHEN
    const result = await reinviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      derniereConnexion: undefined,
      inviteLe: date,
      role: 'Gestionnaire structure',
      uid: { email: 'uidUtilisateurAReinviterInactif', value: 'uidUtilisateurAReinviterInactif' },
    }).state)
    expect(spiedDestinataire).toBe(spiedUtilisateurToUpdate?.state.emailDeContact)
  })

  it('étant donné que l’utilisateur courant ne peut pas gérer l’utilisateur à réinviter, quand il le réinvite, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(repository, emailGatewayFactorySpy, epochTime)
    const command = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecRoleDifferent',
    }

    // WHEN
    const result = await reinviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('utilisateurNePeutPasGererUtilisateurAReinviter')
    expect(spiedUidToFind).toBe('uidUtilisateurAReinviterInactif')
    expect(spiedUtilisateurToUpdate).toBeNull()
  })

  it('étant donné que le compte de l’utilisateur courant est inexistant, quand il réinvite un autre utilisateur, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(repository, emailGatewayFactorySpy, epochTime)
    const command = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'utilisateurInexistantUid',
    }

    // WHEN
    const result = await reinviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('utilisateurCourantInexistant')
    expect(spiedUidToFind).toBe('utilisateurInexistantUid')
    expect(spiedUtilisateurToUpdate).toBeNull()
  })

  it('étant donné que le compte de l’utilisateur à réinviter est déjà actif, quand il est réinvité, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(repository, emailGatewayFactorySpy, epochTime)
    const command = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterActif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecRoleDifferent',
    }

    // WHEN
    const result = await reinviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('utilisateurAReinviterDejaActif')
    expect(spiedUidToFind).toBe('uidUtilisateurAReinviterActif')
    expect(spiedUtilisateurToUpdate).toBeNull()
  })

  it('étant donné que le compte de l’utilisateur est inexistant, quand il est réinvité, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(repository, emailGatewayFactorySpy, epochTime)
    const command = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInexistant',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecRoleDifferent',
    }

    // WHEN
    const result = await reinviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('utilisateurAReinviterInexistant')
    expect(spiedUidToFind).toBe('uidUtilisateurAReinviterInexistant')
    expect(spiedUtilisateurToUpdate).toBeNull()
  })

  it('étant donné une date invalide d’invitation d’un utilisateur, quand il est réinvité, alors il y a une erreur', async () => {
    // GIVEN
    const dateDInvitationInvalide = new Date('foo')
    const repository = new RepositorySpy()
    const reinviterUnUtilisateur = new ReinviterUnUtilisateur(
      repository,
      emailGatewayFactorySpy,
      dateDInvitationInvalide
    )
    const command = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviterInactif',
      uidUtilisateurCourant: 'uidUtilisateurCourantAvecMemeRole',
    }

    // WHEN
    const asyncResult = reinviterUnUtilisateur.execute(command)

    // THEN
    await expect(asyncResult).rejects.toThrow('dateDInvitationInvalide')
  })
})

const utilisateursByUid: Record<string, Utilisateur> = {
  uidUtilisateurAReinviterActif: utilisateurFactory({
    derniereConnexion: new Date('2024-01-01'),
    inviteLe: new Date('2024-01-01'),
    role: 'Gestionnaire structure',
    uid: { email: 'uidUtilisateurAReinviterActif', value: 'uidUtilisateurAReinviterActif' },
  }),
  uidUtilisateurAReinviterInactif: utilisateurFactory({
    derniereConnexion: undefined,
    inviteLe: new Date('2024-01-01'),
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
let spiedUtilisateurToUpdate: Utilisateur | null
let spiedDestinataire: string

class RepositorySpy implements UpdateUtilisateurRepository, FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
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
    async send(destinataire: string): Promise<void> {
      spiedDestinataire = destinataire
      return Promise.resolve()
    }
  }()
}
