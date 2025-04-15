import { ModifierUneFeuilleDeRoute } from './ModifierUneFeuilleDeRoute'
import { FeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, PerimetreGeographiqueTypes } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, invalidDate } from '@/shared/testHelper'

describe('modifier une feuille de route', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedUtilisateurUidToFind = null
    spiedFeuilleDeRouteToUpdate = null
  })

  it('étant donné une gouvernance, quand une feuille de route est modifiée par son gestionnaire, alors elle est modifiée', async () => {
    // GIVEN
    const modifierFeuilleDeRoute = new ModifierUneFeuilleDeRoute(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierFeuilleDeRoute.handle({
      nom,
      perimetreGeographique,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedFeuilleDeRouteToUpdate?.state).toStrictEqual(
      feuilleDeRouteFactory(
        {
          dateDeModification: epochTime,
          nom,
          perimetreGeographique,
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
          uidPorteur: 'poteurFooId',
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
      perimetreGeographique: 'départemental' as PerimetreGeographiqueTypes,
    },
    {
      dateDeModification: epochTime,
      expectedFailure: 'perimetreGeographiqueInvalide',
      intention: 'd’un périmètre géographique invalide',
      perimetreGeographique: 'invalide' as PerimetreGeographiqueTypes,
    },
  ])('étant donné une gouvernance, quand une feuille de route est modifiée par son gestionnaire n’est pas valide à cause $intention, alors une erreur est renvoyée', async ({ dateDeModification,expectedFailure,perimetreGeographique }) => {
    // GIVEN
    const modifierFeuilleDeRoute = new ModifierUneFeuilleDeRoute(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      dateDeModification
    )

    // WHEN
    const result = await modifierFeuilleDeRoute.handle({
      nom,
      perimetreGeographique,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur,
    })

    // THEN
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe(expectedFailure)
  })

  it('étant donné une gouvernance, quand un comité est modifié par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierFeuilleDeRoute = new ModifierUneFeuilleDeRoute(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await modifierFeuilleDeRoute.handle({
      nom,
      perimetreGeographique,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur,
    })

    // THEN
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe('editeurNePeutPasModifierFeuilleDeRoute')
  })
})

const uidGouvernance = 'gouvernanceFooId'
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
const uidEditeur = 'userFooId'
const nom = 'Feuille de route 69'
const uidPorteur = 'poteurFooId'
const perimetreGeographique = 'departemental'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteToUpdate: FeuilleDeRoute | null
let spiedFeuilleDeRouteUidToFind: FeuilleDeRoute['uid']['state']['value'] | null

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

class FeuilleDeRouteRepositorySpy implements FeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory(
        {
          dateDeModification: epochTime,
          nom,
          perimetreGeographique,
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
          uidPorteur: 'poteurFooId',
        }
      )
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}
