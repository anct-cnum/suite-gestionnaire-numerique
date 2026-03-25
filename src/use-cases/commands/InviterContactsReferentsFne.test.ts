import { beforeEach, describe, expect, it } from 'vitest'

import {
  ContactReferentFne,
  ContactReferentFneLoader,
  InviterContactsReferentsFne,
} from './InviterContactsReferentsFne'
import { EmailGateway } from './shared/EmailGateway'
import {
  AddUtilisateurRepository,
  FindUtilisateurByEmailRepository,
  GetUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { Destinataire } from '@/gateways/emails/invitationEmail'
import { epochTime } from '@/shared/testHelper'

describe('inviter les contacts référents FNE', () => {
  beforeEach(() => {
    spiedContactsReferentFneStructureId = null
    spiedUtilisateursAjoutes = []
    spiedDestinataires = []
    spiedEmailsRecherches = []
  })

  it('quand il y a des contacts référents FNE non utilisateurs, alors ils sont tous invités', async () => {
    // GIVEN
    const inviterContactsReferentsFne = new InviterContactsReferentsFne(
      new UtilisateurRepositorySpy(),
      new ContactReferentFneLoaderAvecContactsSpy(),
      emailGatewayFactorySpy,
      epochTime
    )

    // WHEN
    const result = await inviterContactsReferentsFne.handle({
      structureId: 1,
      uidUtilisateurCourant: 'userFooId',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedContactsReferentFneStructureId).toBe(1)
    expect(spiedEmailsRecherches).toStrictEqual(['jean.dupont@example.net', 'marie.durand@example.net'])
    expect(spiedUtilisateursAjoutes).toHaveLength(2)
    expect(spiedUtilisateursAjoutes[0]?.state.emailDeContact).toBe('jean.dupont@example.net')
    expect(spiedUtilisateursAjoutes[0]?.state.nom).toBe('Dupont')
    expect(spiedUtilisateursAjoutes[0]?.state.prenom).toBe('Jean')
    expect(spiedUtilisateursAjoutes[0]?.state.role.nom).toBe('Gestionnaire structure')
    expect(spiedUtilisateursAjoutes[1]?.state.emailDeContact).toBe('marie.durand@example.net')
    expect(spiedDestinataires).toStrictEqual([
      { email: 'jean.dupont@example.net', nom: 'Dupont', prenom: 'Jean' },
      { email: 'marie.durand@example.net', nom: 'Durand', prenom: 'Marie' },
    ])
  })

  it('quand un contact référent FNE est déjà utilisateur, alors seuls les non-utilisateurs sont invités', async () => {
    // GIVEN
    const inviterContactsReferentsFne = new InviterContactsReferentsFne(
      new UtilisateurRepositoryAvecUtilisateurExistantSpy(),
      new ContactReferentFneLoaderAvecContactsSpy(),
      emailGatewayFactorySpy,
      epochTime
    )

    // WHEN
    const result = await inviterContactsReferentsFne.handle({
      structureId: 1,
      uidUtilisateurCourant: 'userFooId',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateursAjoutes).toHaveLength(1)
    expect(spiedUtilisateursAjoutes[0]?.state.emailDeContact).toBe('marie.durand@example.net')
    expect(spiedDestinataires).toStrictEqual([{ email: 'marie.durand@example.net', nom: 'Durand', prenom: 'Marie' }])
  })

  it("quand il n'y a aucun contact référent FNE, alors aucune invitation n'est envoyée", async () => {
    // GIVEN
    const inviterContactsReferentsFne = new InviterContactsReferentsFne(
      new UtilisateurRepositorySpy(),
      new ContactReferentFneLoaderSansContactsSpy(),
      emailGatewayFactorySpy,
      epochTime
    )

    // WHEN
    const result = await inviterContactsReferentsFne.handle({
      structureId: 1,
      uidUtilisateurCourant: 'userFooId',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateursAjoutes).toHaveLength(0)
    expect(spiedDestinataires).toHaveLength(0)
  })
})

let spiedContactsReferentFneStructureId: null | number
let spiedUtilisateursAjoutes: Array<Utilisateur>
let spiedDestinataires: Array<Destinataire>
let spiedEmailsRecherches: Array<string>

const contacts: ReadonlyArray<ContactReferentFne> = [
  { email: 'jean.dupont@example.net', nom: 'Dupont', prenom: 'Jean', telephone: '0102030405' },
  { email: 'marie.durand@example.net', nom: 'Durand', prenom: 'Marie', telephone: '0607080910' },
]

class UtilisateurRepositorySpy
  implements AddUtilisateurRepository, FindUtilisateurByEmailRepository, GetUtilisateurRepository
{
  async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateursAjoutes.push(utilisateur)
    return Promise.resolve(true)
  }

  async findByEmail(email: string): Promise<undefined | Utilisateur> {
    spiedEmailsRecherches.push(email)
    return Promise.resolve(undefined)
  }

  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(
      utilisateurFactory({ role: 'Gestionnaire département', uid: { email: 'admin@example.net', value: uid } })
    )
  }
}

class UtilisateurRepositoryAvecUtilisateurExistantSpy extends UtilisateurRepositorySpy {
  override async findByEmail(email: string): Promise<undefined | Utilisateur> {
    spiedEmailsRecherches.push(email)
    if (email === 'jean.dupont@example.net') {
      return Promise.resolve(utilisateurFactory({ uid: { email, value: email } }))
    }
    return Promise.resolve(undefined)
  }
}

class ContactReferentFneLoaderAvecContactsSpy implements ContactReferentFneLoader {
  async getContactsReferentFne(structureId: number): Promise<ReadonlyArray<ContactReferentFne>> {
    spiedContactsReferentFneStructureId = structureId
    return Promise.resolve(contacts)
  }
}

class ContactReferentFneLoaderSansContactsSpy implements ContactReferentFneLoader {
  async getContactsReferentFne(structureId: number): Promise<ReadonlyArray<ContactReferentFne>> {
    spiedContactsReferentFneStructureId = structureId
    return Promise.resolve([])
  }
}

function emailGatewayFactorySpy(): EmailGateway {
  return new (class implements EmailGateway {
    async send(destinataire: Destinataire): Promise<void> {
      spiedDestinataires.push(destinataire)
      return Promise.resolve()
    }
  })()
}
