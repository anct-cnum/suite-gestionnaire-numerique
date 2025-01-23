import { ModifierUnComite } from './ModifierUnComite'
import { FindComiteRepository, UpdateComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite } from '@/domain/Comite'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { comiteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

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
      expectedDate: new Date(date),
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
  ])('étant donné une gouvernance existante, quand un comité est modifié $intention par son gestionnaire, alors il est modifié', async ({
    commentaire,
    date,
    expectedDate,
    frequence,
    type,
  }) => {
    // GIVEN
    const dateDeModification = new Date('2024-01-01')
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      dateDeModification
    )

    // WHEN
    const result = await modifierUnComite.execute({
      commentaire,
      date,
      frequence,
      type,
      uid: uidComite,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedComiteUidToFind).toBe(uidComite)
    expect(spiedComiteToModify?.state).toStrictEqual(
      comiteFactory({
        commentaire,
        date: expectedDate,
        dateDeCreation: new Date(epochTime),
        dateDeModification,
        frequence,
        type,
        uidEditeur: {
          email: emailUtilisateurCourant,
          value: uidUtilisateurCourant,
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
      dateDeModification: date,
      expectedFailure: 'frequenceInvalide',
      frequence: 'frequenceInvalide',
      intention: 'd’une fréquence invalide',
      type: typeValide,
    },
    {
      date,
      dateDeModification: date,
      expectedFailure: 'typeInvalide',
      frequence: frequenceValide,
      intention: 'd’un type invalide',
      type: 'typeInvalide',
    },
    {
      date: 'dateDuComiteInvalide',
      dateDeModification: date,
      expectedFailure: 'dateDuComiteInvalide',
      frequence: frequenceValide,
      intention: 'de la date invalide',
      type: typeValide,
    },
    {
      date,
      dateDeModification: 'dateDeModificationInvalide',
      expectedFailure: 'dateDeModificationInvalide',
      frequence: frequenceValide,
      intention: 'de la date de modification invalide',
      type: typeValide,
    },
    {
      date: '2024-01-01',
      dateDeModification: '2024-01-02',
      expectedFailure: 'dateDuComiteDoitEtreDansLeFutur',
      frequence: frequenceValide,
      intention: 'de la date de comité qui est dans le passé',
      type: typeValide,
    },
  ])('étant donné une gouvernance existante, quand un comité est modifié par son gestionnaire mais que le comité n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ date, dateDeModification, expectedFailure, frequence, type }) => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      new Date(dateDeModification)
    )

    // WHEN
    const result = await modifierUnComite.execute({
      date,
      frequence,
      type,
      uid: uidComite,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe(expectedFailure)
    expect(spiedComiteToModify).toBeNull()
  })

  it('étant donné une gouvernance existante, quand un comité est modifié par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uid: uidComite,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('userFooId')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe('utilisateurNePeutPasModifierComite')
    expect(spiedComiteToModify).toBeNull()
  })

  it('étant donné une gouvernance inexistante, quand un comité est modifié, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uid: uidComite,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe('gouvernanceInexistante')
    expect(spiedComiteToModify).toBeNull()
  })

  it('étant donné un utilisateur inexistant, quand un comité est modifié, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireInexistantRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uid: uidComite,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(result).toBe('utilisateurInexistant')
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedComiteToModify).toBeNull()
  })

  it('étant donné un comité inexistant, quand un comité est modifié, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUnComite = new ModifierUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteInexistantRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uid: uidComite,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedComiteUidToFind).toBe(uidComite)
    expect(result).toBe('comiteInexistant')
    expect(spiedComiteToModify).toBeNull()
  })
})

const commentaire = 'un commentaire'
const date = '2024-01-01'
const frequenceValide = 'mensuelle'
const typeValide = 'strategique'
const uidComite = 'comiteFooId'
const uidGouvernance = 'gouvernanceFooId'
const emailUtilisateurCourant = 'martin.tartempion@example.net'
const uidUtilisateurCourant = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: UtilisateurUidState['value'] | null
let spiedComiteToModify: Comite | null
let spiedComiteUidToFind: Comite['uid']['state']['value'] | null

class GouvernanceRepositorySpy implements FindGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
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

class GouvernanceInexistanteRepositorySpy extends GouvernanceRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: emailUtilisateurCourant, value: uidUtilisateurCourant },
    }))
  }
}

class GestionnaireInexistantRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireAutreRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class ComiteRepositorySpy implements UpdateComiteRepository, FindComiteRepository {
  async find(uid: Comite['uid']['state']['value']): Promise<Comite | null> {
    spiedComiteUidToFind = uid
    return Promise.resolve(comiteFactory({
      uid: { value: uidComite },
      uidEditeur: { email: emailUtilisateurCourant, value: uidUtilisateurCourant },
      uidGouvernance: { value: uidGouvernance },
    }))
  }

  async update(comite: Comite): Promise<void> {
    spiedComiteToModify = comite
    return Promise.resolve()
  }
}

class ComiteInexistantRepositorySpy extends ComiteRepositorySpy {
  override async find(uid: Comite['uid']['state']['value']): Promise<Comite | null> {
    spiedComiteUidToFind = uid
    return Promise.resolve(null)
  }
}
