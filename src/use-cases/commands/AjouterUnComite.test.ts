import { AjouterUnComite } from './AjouterUnComite'
import { AddComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite } from '@/domain/Comite'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { comiteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('ajouter un comité à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedUtilisateurUidToFind = null
    spiedComiteToAdd = null
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
  ])('étant donné une gouvernance existante, quand un comité est créé $intention par son gestionnaire, alors il est ajouté à cette gourvernance', async ({
    commentaire,
    date,
    expectedDate,
    frequence,
    type,
  }) => {
    // GIVEN
    const dateDeCreation = new Date('2024-01-01')
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
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
    expect(spiedComiteToAdd?.state).toStrictEqual(
      comiteFactory({
        commentaire,
        date: expectedDate,
        dateDeCreation,
        dateDeModification: dateDeCreation,
        frequence,
        type,
        uid: {
          value: 'identifiantPourLaCreation',
        },
        uidEditeur: {
          email: 'martin.tartempion@example.net',
          value: 'userFooId',
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
  ])('étant donné une gouvernance existante, quand un comité est créé par son gestionnaire mais que le comité n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ date, dateDeCreation, expectedFailure, frequence, type }) => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
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
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe(expectedFailure)
    expect(spiedComiteToAdd).toBeNull()
  })

  it('étant donné une gouvernance existante, quand un comité est créé par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
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
    expect(spiedUtilisateurUidToFind).toBe('userFooId')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe('utilisateurNePeutPasAjouterComite')
    expect(spiedComiteToAdd).toBeNull()
  })

  it('étant donné une gouvernance inexistante, quand un comité est créé, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
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
    expect(result).toBe('gouvernanceInexistante')
    expect(spiedComiteToAdd).toBeNull()
  })

  it('étant donné un utilisateur inexistant, quand un comité est créé, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireInexistantRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
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
    expect(result).toBe('utilisateurInexistant')
    expect(spiedComiteToAdd).toBeNull()
  })
})

const commentaire = 'un commentaire'
const date = '2024-01-01'
const frequenceValide = 'mensuelle'
const typeValide = 'strategique'
const uidGouvernance = 'gouvernanceFooId'
const uidUtilisateurCourant = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: string | null
let spiedComiteToAdd: Comite | null

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
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }))
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

class ComiteRepositorySpy implements AddComiteRepository {
  async add(comite: Comite): Promise<boolean> {
    spiedComiteToAdd = comite
    return Promise.resolve(true)
  }
}
