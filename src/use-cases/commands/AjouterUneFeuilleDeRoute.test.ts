
import { AjouterUneFeuilleDeRoute, FeuilleDeRouteRepository } from './AjouterUneFeuilleDeRoute'
import { GetGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, PerimetreGeographique } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, invalidDate } from '@/shared/testHelper'

describe('ajouter une feuille de route à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
    spiedFeuilleDeRouteToAdd = null
  })

  it('étant donné une gouvernance, quand une feuille de route est créée par son gestionnaire, alors elle est ajoutée à cette gourvernance', async () => {
    // GIVEN
    const ajouterFeuilleDeRoute = new AjouterUneFeuilleDeRoute(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterFeuilleDeRoute.handle({
      nom,
      perimetreGeographique,
      porteur,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedFeuilleDeRouteToAdd?.state).toStrictEqual(
      feuilleDeRouteFactory(
        {
          dateDeModification: epochTime,
          nom,
          perimetreGeographique,
          porteur,
          uid: {
            value: 'identifiantPourLaCreation',
          },
          uidEditeur: {
            email: 'martin.tartempion@example.net',
            value: uidEditeur,
          },
          uidGouvernance: {
            value: uidGouvernance,
          },
        }
      ).state
    )
    expect(result).toBe('OK')
  })

  it.each([
    {
      dateDeModification: invalidDate,
      expectedFailure: 'dateDeModificationInvalide',
      intention: 'd’une date de modification invalide',
      perimetreGeographique: 'départemental' as PerimetreGeographique,
    },
    {
      dateDeModification: epochTime,
      expectedFailure: 'perimetreGeographiqueInvalide',
      intention: 'd’un périmètre géographique invalide',
      perimetreGeographique: 'invalide' as PerimetreGeographique,
    },
  ])('étant donné une gouvernance, quand une feuille de route est créé par son gestionnaire n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ dateDeModification,expectedFailure,perimetreGeographique }) => {
    // GIVEN
    const ajouterFeuilleDeRoute = new AjouterUneFeuilleDeRoute(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      dateDeModification
    )

    // WHEN
    const result = await ajouterFeuilleDeRoute.handle({
      nom,
      perimetreGeographique,
      porteur,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedFeuilleDeRouteToAdd).toBeNull()
    expect(result).toBe(expectedFailure)
  })

  it('étant donné une gouvernance, quand une feuille de route est créée par un gestionnaire qui n’a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterFeuilleDeRoute = new AjouterUneFeuilleDeRoute(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterFeuilleDeRoute.handle({
      nom,
      perimetreGeographique,
      porteur,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterFeuilleDeRoute')
  })
})

const uidGouvernance = 'gouvernanceFooId'
const uidEditeur = 'userFooId'
const nom = 'Feuille de route 69'
const porteur = 'CC des Monts du Lyonnais'
const perimetreGeographique = 'départemental'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteToAdd: FeuilleDeRoute | null

class GouvernanceRepositorySpy implements GetGouvernanceRepository, UpdateGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        uid: uidGouvernance,
      })
    )
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    spiedGouvernanceToUpdate = gouvernance
    return Promise.resolve()
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

class FeuilleDeRouteRepositorySpy implements FeuilleDeRouteRepository {
  async add(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteToAdd = feuilleDeRoute
    return Promise.resolve()
  }
}
