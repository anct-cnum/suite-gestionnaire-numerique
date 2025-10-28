/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable vitest/require-mock-type-parameters */
import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DefinirUnCoPorteur } from './DefinirUnCoPorteur'
import { EmailGateway } from './shared/EmailGateway'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import {
  GetMembreContactsRepository,
  GetMembreRepository,
  MembreContacts,
  UpdateMembreRepository,
} from './shared/MembreRepository'
import {
  AddUtilisateurRepository,
  FindUtilisateurByEmailRepository,
  GetUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { Membre, MembreState } from '@/domain/Membre'
import { gouvernanceFactory, membreConfirmeFactory, membrePotentielFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'
import { Destinataire } from '@/gateways/emails/invitationEmail'
import { epochTime } from '@/shared/testHelper'

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({

  captureMessage: vi.fn(),
}))

describe('définir un coporteur', () => {
  beforeEach(() => {
    spiedMembreToUpdate = null
    spiedUtilisateurToAdd = []
    spiedDestinataires = []
    vi.clearAllMocks()
  })

  describe('cas d\'erreur', () => {
    it('utilisateur non autorisé à gérer la gouvernance', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ role: 'Gestionnaire structure' })
      const membre = membreConfirmeFactory({ uid: { value: 'membreUid' } })

      const membreRepository = new MembreRepositorySpy(membre)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur)
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('UtilisateurNonAutorise')
      expect(spiedMembreToUpdate).toBeNull()
      expect(spiedUtilisateurToAdd).toHaveLength(0)
    })

    it('membre doit être confirmé', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membreCandidat = membrePotentielFactory({ uid: { value: 'membreUid' } })

      const membreRepository = new MembreRepositorySpy(membreCandidat)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur)
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('MembreDoitEtreConfirmer')
      expect(spiedMembreToUpdate).toBeNull()
      expect(spiedUtilisateurToAdd).toHaveLength(0)
    })

    it('membre déjà coporteur', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membre = membreConfirmeFactory({
        roles: ['observateur', 'coporteur'],
        uid: { value: 'membreUid' },
      })

      const membreRepository = new MembreRepositorySpy(membre)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur)
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('MembreDéjàCoPorteur')
      expect(spiedMembreToUpdate).toBeNull()
      expect(spiedUtilisateurToAdd).toHaveLength(0)
    })
  })

  describe('succès du passage en coporteur', () => {
    it('quand aucun utilisateur n\'existe, les 2 contacts (référent et technique) sont créés et invités', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membre = membreConfirmeFactory({
        roles: ['observateur'],
        uid: { value: 'membreUid' },
        uidStructure: { value: 123 },
      })

      const contacts: MembreContacts = {
        contact: {
          email: 'referent@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Jean',
        },
        contactTechnique: {
          email: 'technique@example.com',
          fonction: 'Responsable IT',
          nom: 'Martin',
          prenom: 'Sophie',
        },
      }

      const membreRepository = new MembreRepositorySpy(membre, contacts)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur)
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('OK')

      // Vérifier que le membre a été mis à jour avec le rôle coporteur
      expect(spiedMembreToUpdate?.state.roles).toContain('coporteur')
      expect(spiedMembreToUpdate?.state.roles).toContain('observateur')

      // Vérifier que 2 utilisateurs ont été créés
      expect(spiedUtilisateurToAdd).toHaveLength(2)

      // Vérifier l'utilisateur référent
      const utilisateurReferent = spiedUtilisateurToAdd[0]
      expect(utilisateurReferent?.state.uid.email).toBe('referent@example.com')
      expect(utilisateurReferent?.state.nom).toBe('Dupont')
      expect(utilisateurReferent?.state.prenom).toBe('Jean')
      expect(utilisateurReferent?.state.structureUid?.value).toBe(123)
      expect(utilisateurReferent?.state.role.nom).toBe('Gestionnaire structure')

      // Vérifier l'utilisateur technique
      const utilisateurTechnique = spiedUtilisateurToAdd[1]
      expect(utilisateurTechnique?.state.uid.email).toBe('technique@example.com')
      expect(utilisateurTechnique?.state.nom).toBe('Martin')
      expect(utilisateurTechnique?.state.prenom).toBe('Sophie')
      expect(utilisateurTechnique?.state.structureUid?.value).toBe(123)
      expect(utilisateurTechnique?.state.role.nom).toBe('Gestionnaire structure')

      // Vérifier que 2 emails d'invitation ont été envoyés
      expect(spiedDestinataires).toHaveLength(2)
      expect(spiedDestinataires[0]).toStrictEqual({
        email: 'referent@example.com',
        nom: 'Dupont',
        prenom: 'Jean',
      })
      expect(spiedDestinataires[1]).toStrictEqual({
        email: 'technique@example.com',
        nom: 'Martin',
        prenom: 'Sophie',
      })
    })

    it('quand seul le contact référent existe (sans contact technique), seul le référent est créé', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membre = membreConfirmeFactory({
        roles: ['observateur'],
        uid: { value: 'membreUid' },
        uidStructure: { value: 123 },
      })

      const contacts: MembreContacts = {
        contact: {
          email: 'referent@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Jean',
        },
        contactTechnique: undefined,
      }

      const membreRepository = new MembreRepositorySpy(membre, contacts)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur)
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('OK')
      expect(spiedUtilisateurToAdd).toHaveLength(1)
      expect(spiedUtilisateurToAdd[0]?.state.uid.email).toBe('referent@example.com')
      expect(spiedDestinataires).toHaveLength(1)
    })

    it('quand le contact référent existe déjà lié à la même structure, il n\'est pas créé', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membre = membreConfirmeFactory({
        roles: ['observateur'],
        uid: { value: 'membreUid' },
        uidStructure: { value: 123 },
      })

      const utilisateurExistant = utilisateurFactory({
        emailDeContact: 'referent@example.com',
        nom: 'Dupont',
        prenom: 'Jean',
        structureUid: 123,
        uid: { email: 'referent@example.com', value: 'referent@example.com' },
      })

      const contacts: MembreContacts = {
        contact: {
          email: 'referent@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Jean',
        },
        contactTechnique: {
          email: 'technique@example.com',
          fonction: 'Responsable IT',
          nom: 'Martin',
          prenom: 'Sophie',
        },
      }

      const membreRepository = new MembreRepositorySpy(membre, contacts)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur, [utilisateurExistant])
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('OK')
      // Seul le contact technique est créé
      expect(spiedUtilisateurToAdd).toHaveLength(1)
      expect(spiedUtilisateurToAdd[0]?.state.uid.email).toBe('technique@example.com')
      expect(spiedDestinataires).toHaveLength(1)
      expect(spiedDestinataires[0]?.email).toBe('technique@example.com')
    })

    it('quand le contact existe lié à une autre structure, un message Sentry est envoyé et l\'utilisateur n\'est pas créé', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membre = membreConfirmeFactory({
        roles: ['observateur'],
        uid: { value: 'membreUid' },
        uidStructure: { value: 123 },
      })

      const utilisateurAutreStructure = utilisateurFactory({
        emailDeContact: 'referent@example.com',
        nom: 'Dupont',
        prenom: 'Jean',
        structureUid: 456, // Autre structure
        uid: { email: 'referent@example.com', value: 'referent@example.com' },
      })

      const contacts: MembreContacts = {
        contact: {
          email: 'referent@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Jean',
        },
        contactTechnique: {
          email: 'technique@example.com',
          fonction: 'Responsable IT',
          nom: 'Martin',
          prenom: 'Sophie',
        },
      }

      const membreRepository = new MembreRepositorySpy(membre, contacts)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur, [utilisateurAutreStructure])
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('OK')

      // Seul le contact technique est créé (le référent est dans une autre structure)
      expect(spiedUtilisateurToAdd).toHaveLength(1)
      expect(spiedUtilisateurToAdd[0]?.state.uid.email).toBe('technique@example.com')

      // Vérifier que Sentry a été appelé
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Contact coporteur déjà utilisateur d\'une autre structure',
        expect.objectContaining({
          extra: expect.objectContaining({
            contactEmail: 'referent@example.com',
            membreUid: 'membreUid',
            structureActuelle: 456,
            structureCible: 123,
            typeContact: 'referent',
          }),
          level: 'warning',
          tags: expect.objectContaining({
            location: 'DefinirUnCoPorteur',
            scenario: 'contact_utilisateur_autre_structure',
          }),
        })
      )
    })

    it('quand les 2 contacts existent dans des structures différentes, 2 messages Sentry sont envoyés', async () => {
      // GIVEN
      const gouvernance = gouvernanceFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' } })
      const utilisateur = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      const membre = membreConfirmeFactory({
        roles: ['observateur'],
        uid: { value: 'membreUid' },
        uidStructure: { value: 123 },
      })

      const utilisateurReferentAutreStructure = utilisateurFactory({
        emailDeContact: 'referent@example.com',
        nom: 'Dupont',
        prenom: 'Jean',
        structureUid: 456,
        uid: { email: 'referent@example.com', value: 'referent@example.com' },
      })

      const utilisateurTechniqueAutreStructure = utilisateurFactory({
        emailDeContact: 'technique@example.com',
        nom: 'Martin',
        prenom: 'Sophie',
        structureUid: 789,
        uid: { email: 'technique@example.com', value: 'technique@example.com' },
      })

      const contacts: MembreContacts = {
        contact: {
          email: 'referent@example.com',
          fonction: 'Directeur',
          nom: 'Dupont',
          prenom: 'Jean',
        },
        contactTechnique: {
          email: 'technique@example.com',
          fonction: 'Responsable IT',
          nom: 'Martin',
          prenom: 'Sophie',
        },
      }

      const membreRepository = new MembreRepositorySpy(membre, contacts)
      const utilisateurRepository = new UtilisateurRepositorySpy(utilisateur, [
        utilisateurReferentAutreStructure,
        utilisateurTechniqueAutreStructure,
      ])
      const gouvernanceRepository = new GouvernanceRepositorySpy(gouvernance)

      // WHEN
      const result = await new DefinirUnCoPorteur(
        membreRepository,
        utilisateurRepository,
        gouvernanceRepository,
        emailGatewayFactorySpy,
        epochTime
      ).handle({
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membreUid',
        uidUtilisateurConnecte: 'userFooId',
      })

      // THEN
      expect(result).toBe('OK')

      // Aucun utilisateur créé
      expect(spiedUtilisateurToAdd).toHaveLength(0)

      // Vérifier que Sentry a été appelé 2 fois
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(2)
    })
  })
})

let spiedMembreToUpdate: Membre | null
let spiedUtilisateurToAdd: Array<null | Utilisateur>
let spiedDestinataires: Array<Destinataire>

class MembreRepositorySpy
implements GetMembreContactsRepository, GetMembreRepository, UpdateMembreRepository
{
  readonly #contacts: MembreContacts
  readonly #membre: Membre

  constructor(membre: Membre, contacts?: MembreContacts) {
    this.#membre = membre
    this.#contacts = contacts ?? {
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Dupont',
        prenom: 'Jean',
      },
    }
  }

  async get(_uid: string, _tx?: Prisma.TransactionClient): Promise<Membre> {
    return Promise.resolve(this.#membre)
  }

  async getContacts(_uid: MembreState['uid']['value'], _tx?: Prisma.TransactionClient): Promise<MembreContacts> {
    return Promise.resolve(this.#contacts)
  }

  async update(membre: Membre, _tx?: Prisma.TransactionClient): Promise<void> {
    spiedMembreToUpdate = membre
    return Promise.resolve()
  }
}

class UtilisateurRepositorySpy
implements AddUtilisateurRepository, FindUtilisateurByEmailRepository, GetUtilisateurRepository
{
  readonly #utilisateurCourant: Utilisateur
  readonly #utilisateursExistants: Array<Utilisateur>

  constructor(utilisateurCourant: Utilisateur, utilisateursExistants?: Array<Utilisateur>) {
    this.#utilisateurCourant = utilisateurCourant
    this.#utilisateursExistants = utilisateursExistants ?? []
  }

  async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToAdd.push(utilisateur)
    return Promise.resolve(true)
  }

  async findByEmail(email: string): Promise<undefined | Utilisateur> {
    return Promise.resolve(this.#utilisateursExistants.find((utilisateur) => utilisateur.state.uid.email === email))
  }

  async get(_uid: string): Promise<Utilisateur> {
    return Promise.resolve(this.#utilisateurCourant)
  }
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  readonly #gouvernance: ReturnType<typeof gouvernanceFactory>

  constructor(gouvernance: ReturnType<typeof gouvernanceFactory>) {
    this.#gouvernance = gouvernance
  }

  async get(_uid: GouvernanceUid): Promise<ReturnType<typeof gouvernanceFactory>> {
    return Promise.resolve(this.#gouvernance)
  }
}

function emailGatewayFactorySpy(_: boolean): EmailGateway {
  return new class implements EmailGateway {
    async send(destinataire: Destinataire): Promise<void> {
      spiedDestinataires.push(destinataire)
      return Promise.resolve()
    }
  }()
}
