import { AjouterUnComite } from './AjouterUnComite'
import { AddComiteRepository } from './shared/ComiteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite } from '@/domain/Comite'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { comiteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, epochTimePlusOneDay, invalidDate } from '@/shared/testHelper'

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
  ])('étant donné une gouvernance, quand un comité est créé $intention par son gestionnaire, alors il est ajouté à cette gourvernance', async ({
    commentaire,
    date,
    expectedDate,
    frequence,
    type,
  }) => {
    // GIVEN
    const dateDeCreation = epochTime
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      dateDeCreation
    )

    // WHEN
    const result = await ajouterUnComite.handle({
      commentaire,
      date,
      frequence,
      type,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
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
      dateDeCreation: epochTime,
      expectedFailure: 'frequenceInvalide',
      frequence: 'frequenceInvalide',
      intention: 'd’une fréquence invalide',
      type: typeValide,
    },
    {
      date,
      dateDeCreation: epochTime,
      expectedFailure: 'typeInvalide',
      frequence: frequenceValide,
      intention: 'd’un type invalide',
      type: 'typeInvalide',
    },
    {
      date: 'dateDuComiteInvalide',
      dateDeCreation: epochTime,
      expectedFailure: 'dateDuComiteInvalide',
      frequence: frequenceValide,
      intention: 'de la date invalide',
      type: typeValide,
    },
    {
      date,
      dateDeCreation: invalidDate,
      expectedFailure: 'dateDeCreationInvalide',
      frequence: frequenceValide,
      intention: 'de la date de création invalide',
      type: typeValide,
    },
    {
      date,
      dateDeCreation: epochTimePlusOneDay,
      expectedFailure: 'dateDuComiteDoitEtreDansLeFutur',
      frequence: frequenceValide,
      intention: 'de la date de comité qui est dans le passé',
      type: typeValide,
    },
  ])('étant donné une gouvernance, quand un comité est créé par son gestionnaire mais que le comité n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ date, dateDeCreation, expectedFailure, frequence, type }) => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy(),
      dateDeCreation
    )

    // WHEN
    const result = await ajouterUnComite.handle({
      date,
      frequence,
      type,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe(expectedFailure)
    expect(spiedComiteToAdd).toBeNull()
  })

  it('étant donné une gouvernance, quand un comité est créé par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterUnComite = new AjouterUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ComiteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterUnComite.handle({
      commentaire,
      date,
      frequence: frequenceValide,
      type: typeValide,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('userFooId')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe('editeurNePeutPasAjouterComite')
    expect(spiedComiteToAdd).toBeNull()
  })
})

const commentaire = 'un commentaire'
const date = epochTime.toISOString()
const frequenceValide = 'mensuelle'
const typeValide = 'strategique'
const uidGouvernance = 'gouvernanceFooId'
const uidEditeur = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: string | null
let spiedComiteToAdd: Comite | null

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
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
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
