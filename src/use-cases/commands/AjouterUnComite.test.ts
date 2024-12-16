import { FrozenDate } from '../testHelper'
import { AjouterUnComite } from './AjouterUnComite'
import { AddComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite, ComiteUid } from '@/domain/Comite'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { comiteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('ajouter un comité à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it.each([
    {
      commentaire,
      date,
      frequence: frequenceValide,
      intention: 'complètement',
      type: typeValide,
    },
    {
      commentaire: undefined,
      date: undefined,
      frequence: frequenceValide,
      intention: 'sans date ni commentaire',
      type: typeValide,
    },
  ])('étant donné une gouvernance existante, quand un comité est créé $intention par le gestionnaire de cette gouvernance, alors il est ajouté à cette gourvernance', async ({
    commentaire,
    date,
    frequence,
    type,
  }) => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    const dateDeCreation = new Date('2024-01-01')
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      dateDeCreation
    )

    // WHEN
    const result = await ajouterUnComite.execute({
      commentaire,
      date,
      frequence,
      type,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        comites: [new ComiteUid(String(dateDeCreation.getTime()))],
        noteDeContexte: undefined,
        uid: uidGouvernance,
      }).state
    )
    expect(spiedComiteToAdd?.state).toStrictEqual(
      comiteFactory({
        commentaire,
        date,
        dateDeCreation: dateDeCreation.toJSON(),
        dateDeModification: dateDeCreation.toJSON(),
        frequence,
        type,
        uid: String(dateDeCreation.getTime()),
        uidUtilisateurCourant: {
          email: 'martin.tartempion@example.net',
          value: 'userFooId',
        },
      }).state
    )
    expect(result).toBe('OK')
  })

  it.each([
    {
      date,
      dateDeCreation: date,
      expectedFailure: 'frequenceInvalide',
      frequence: 'frequenceInvalide',
      intention: 'd’une fréquence invalide',
      type: typeValide,
    },
    {
      date,
      dateDeCreation: date,
      expectedFailure: 'typeInvalide',
      frequence: frequenceValide,
      intention: 'd’un type invalide',
      type: 'typeInvalide',
    },
    {
      date: 'dateDuComiteInvalide',
      dateDeCreation: date,
      expectedFailure: 'dateDuComiteInvalide',
      frequence: frequenceValide,
      intention: 'de la date invalide',
      type: typeValide,
    },
    {
      date,
      dateDeCreation: 'dateDeCreationInvalide',
      expectedFailure: 'dateDeCreationInvalide',
      frequence: frequenceValide,
      intention: 'de la date de création invalide',
      type: typeValide,
    },
    {
      date: '2024-01-01',
      dateDeCreation: '2024-01-02',
      expectedFailure: 'dateDuComiteDoitEtreDansLeFutur',
      frequence: frequenceValide,
      intention: 'de la date de comité qui est dans le passé',
      type: typeValide,
    },
  ])('étant donné une gouvernance existante, quand un comité est créé par le gestionnaire de cette gouvernance mais que le comité n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ date, dateDeCreation, expectedFailure, frequence, type }) => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      new Date(dateDeCreation)
    )

    // WHEN
    const result = await ajouterUnComite.execute({
      date,
      frequence,
      type,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe(expectedFailure)
  })

  it('étant donné une gouvernance existante, quand un comité est créé par quelqu’un d’autre que le gestionnaire de cette gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceExistanteRepositorySpy(),
      new UtilisateurUsurpateurRepositorySpy(),
      new ComiteRepositorySpy()
    )

    // WHEN
    const result = await ajouterUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uidGouvernance,
      uidUtilisateurCourant: 'utilisateurUsurpateur',
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('utilisateurUsurpateur')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterComite')
  })

  it('étant donné une gouvernance inexistante, quand un comité est créé, alors une erreur est renvoyée', async () => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy()
    )

    // WHEN
    const result = await ajouterUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('gouvernanceInexistante')
  })

  it('étant donné un utilisateur inexistant, quand un comité est créé, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireInexistantRepositorySpy(),
      new ComiteRepositorySpy()
    )

    // WHEN
    const result = await ajouterUnComite.execute({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurInexistant')
  })
})

const commentaire = 'un commentaire'
const date = '2024-01-01'
const frequenceValide = 'Mensuelle'
const typeValide = 'Stratégique'
const uidGouvernance = 'gouvernanceFooId'
const uidUtilisateurCourant = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: string | null
let spiedComiteToAdd: Comite | null

class GouvernanceExistanteRepositorySpy implements FindGouvernanceRepository, UpdateGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        comites: undefined,
        noteDeContexte: undefined,
        uid: uidGouvernance,
      })
    )
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    spiedGouvernanceToUpdate = gouvernance
    return Promise.resolve()
  }
}

class GouvernanceInexistanteRepositorySpy extends GouvernanceExistanteRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory())
  }
}

class GestionnaireInexistantRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(null)
  }
}

class UtilisateurUsurpateurRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ uid: { email: 'utilisateurUsurpateur@example.com', value: 'utilisateurUsurpateur' } }))
  }
}

class ComiteRepositorySpy implements AddComiteRepository {
  async add(comite: Comite): Promise<void> {
    spiedComiteToAdd = comite
    return Promise.resolve()
  }
}
