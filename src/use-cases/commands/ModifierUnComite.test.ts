import { beforeEach, describe, expect, it } from 'vitest'

import { ModifierUnComite } from './ModifierUnComite'
import { GetComiteRepository, UpdateComiteRepository } from './shared/ComiteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite } from '@/domain/Comite'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { comiteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, epochTimePlusOneDay, invalidDate } from '@/shared/testHelper'

describe('modifier un comité', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedUtilisateurUidToFind = null
    spiedComiteToModify = null
    spiedComiteUidToFind = null
  })

  it.each([
    {
      commentaire,
      date,
      expectedDate: epochTime,
      frequence: frequenceValide,
      intention: 'complètement',
      type: typeValide,
    },
    {
      commentaire: undefined,
      date: undefined,
      expectedDate: undefined,
      frequence: frequenceValide,
      intention: 'sans date ni commentaire',
      type: typeValide,
    },
  ])('étant donné une gouvernance, quand un comité est modifié $intention par son gestionnaire, alors il est modifié', async ({
    commentaire,
    date,
    expectedDate,
    frequence,
    type,
  }) => {
    // GIVEN
    const dateDeModification = epochTime
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      dateDeModification
    )

    // WHEN
    const result = await modifierUnComite.handle({
      commentaire,
      date,
      frequence,
      type,
      uid: uidComite,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedComiteUidToFind).toBe(uidComite)
    expect(spiedComiteToModify?.state).toStrictEqual(
      comiteFactory({
        commentaire,
        date: expectedDate,
        dateDeCreation: epochTime,
        dateDeModification,
        frequence,
        type,
        uidEditeur: {
          email: emailEditeur,
          value: uidEditeur,
        },
        uidGouvernance: {
          value: uidGouvernance,
        },
      }).state
    )
    expect(result).toBe('OK')
  })

  it.each([
    {
      date,
      dateDeModification: epochTime,
      expectedFailure: 'frequenceInvalide',
      frequence: 'frequenceInvalide',
      intention: 'd’une fréquence invalide',
      type: typeValide,
    },
    {
      date,
      dateDeModification: epochTime,
      expectedFailure: 'typeInvalide',
      frequence: frequenceValide,
      intention: 'd’un type invalide',
      type: 'typeInvalide',
    },
    {
      date: 'dateDuComiteInvalide',
      dateDeModification: epochTime,
      expectedFailure: 'dateDuComiteInvalide',
      frequence: frequenceValide,
      intention: 'de la date invalide',
      type: typeValide,
    },
    {
      date,
      dateDeModification: invalidDate,
      expectedFailure: 'dateDeModificationInvalide',
      frequence: frequenceValide,
      intention: 'de la date de modification invalide',
      type: typeValide,
    },
    {
      date,
      dateDeModification: epochTimePlusOneDay,
      expectedFailure: 'dateDuComiteDoitEtreDansLeFutur',
      frequence: frequenceValide,
      intention: 'de la date de comité qui est dans le passé',
      type: typeValide,
    },
  ])('étant donné une gouvernance, quand un comité est modifié par son gestionnaire mais que le comité n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ date, dateDeModification, expectedFailure, frequence, type }) => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      dateDeModification
    )

    // WHEN
    const result = await modifierUnComite.handle({
      date,
      frequence,
      type,
      uid: uidComite,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedComiteToModify).toBeNull()
    expect(result).toBe(expectedFailure)
  })

  it('étant donné une gouvernance, quand un comité est modifié par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierUnComite.handle({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uid: uidComite,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedComiteToModify).toBeNull()
    expect(result).toBe('editeurNePeutPasModifierComite')
  })
})

const commentaire = 'un commentaire'
const date = epochTime.toISOString()
const frequenceValide = 'mensuelle'
const typeValide = 'strategique'
const uidComite = 'comiteFooId'
const uidGouvernance = 'gouvernanceFooId'
const emailEditeur = 'martin.tartempion@example.net'
const uidEditeur = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: null | UtilisateurUidState['value']
let spiedComiteToModify: Comite | null
let spiedComiteUidToFind: Comite['uid']['state']['value'] | null

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        noteDeContexte: undefined,
        uid: uidGouvernance,
      })
    )
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: emailEditeur, value: uidEditeur },
    }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class ComiteRepositorySpy implements GetComiteRepository, UpdateComiteRepository {
  async get(uid: Comite['uid']['state']['value']): Promise<Comite> {
    spiedComiteUidToFind = uid
    return Promise.resolve(comiteFactory({
      uid: { value: uidComite },
      uidEditeur: { email: emailEditeur, value: uidEditeur },
      uidGouvernance: { value: uidGouvernance },
    }))
  }

  async update(comite: Comite): Promise<void> {
    spiedComiteToModify = comite
    return Promise.resolve()
  }
}
