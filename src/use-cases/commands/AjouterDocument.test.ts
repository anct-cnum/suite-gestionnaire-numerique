import { beforeEach, describe, expect, it } from 'vitest'

import { AjouterDocument } from './AjouterDocument'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { StockageDocumentGateway } from './shared/StockageDocumentGateway'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('ajouter un document à une feuille de route', () => {
  beforeEach(() => {
    spiedDocumentTeleverse = null
    spiedFeuilleDeRouteUidToFind = null
    spiedFeuilleDeRouteToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('quand un document est ajouté par son gestionnaire, alors il est téléversé puis enregistré', async () => {
    // GIVEN
    const uidEditeur = 'userFooId2'
    const ajouterDocument = new AjouterDocument(
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new StockageDocumentGatewaySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await ajouterDocument.handle({
      chemin,
      contenu,
      date: epochTime.toISOString(),
      nom,
      uidEditeur,
      uidFeuilleDeRoute,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedFeuilleDeRouteUidToFind).toStrictEqual(new FeuilleDeRouteUid(uidFeuilleDeRoute).state.value)
    expect(spiedDocumentTeleverse).toStrictEqual({ chemin, contenu })
    expect(spiedFeuilleDeRouteToUpdate?.state.document).toStrictEqual({ chemin, nom })
    expect(result).toBe('OK')
  })

  it('quand un document est ajouté alors qu’un document existait déjà, alors le nouveau devient le document courant sans suppression du stockage', async () => {
    // GIVEN
    const ancienChemin = 'user/feuilleDeRouteFooId/ancien-document.pdf'
    const ajouterDocument = new AjouterDocument(
      new FeuilleDeRouteAvecDocumentRepositorySpy(ancienChemin),
      new GouvernanceRepositorySpy(),
      new StockageDocumentGatewaySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await ajouterDocument.handle({
      chemin,
      contenu,
      date: epochTime.toISOString(),
      nom,
      uidEditeur: 'userFooId2',
      uidFeuilleDeRoute,
    })

    // THEN
    expect(spiedDocumentTeleverse).toStrictEqual({ chemin, contenu })
    expect(spiedFeuilleDeRouteToUpdate?.state.document).toStrictEqual({ chemin, nom })
    expect(result).toBe('OK')
  })

  it("quand un document est ajouté par un gestionnaire qui n'a pas ce droit, alors une erreur est renvoyée et rien n'est téléversé", async () => {
    // GIVEN
    const ajouterDocument = new AjouterDocument(
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new StockageDocumentGatewaySpy(),
      new GestionnaireAutreRepositorySpy()
    )

    // WHEN
    const result = await ajouterDocument.handle({
      chemin,
      contenu,
      date: epochTime.toISOString(),
      nom,
      uidEditeur: 'utilisateurUsurpateur',
      uidFeuilleDeRoute,
    })

    // THEN
    expect(spiedDocumentTeleverse).toBeNull()
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe('editeurNePeutPasAjouterDocument')
  })
})

const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
const chemin = 'user/feuilleDeRouteFooId/feuille-de-route-fake.pdf'
const nom = 'feuille-de-route-fake.pdf'
const contenu = Buffer.from('%PDF-1.4 contenu')
let spiedDocumentTeleverse: null | Readonly<{ chemin: string; contenu: Buffer }>
let spiedFeuilleDeRouteUidToFind: FeuilleDeRoute['uid']['state']['value'] | null
let spiedFeuilleDeRouteToUpdate: FeuilleDeRoute | null
let spiedUtilisateurUidToFind: null | string

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: {
          value: 'gouvernanceFooId',
        },
      })
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class StockageDocumentGatewaySpy implements StockageDocumentGateway {
  async televerser(cheminTeleverse: string, contenuTeleverse: Buffer): Promise<void> {
    spiedDocumentTeleverse = { chemin: cheminTeleverse, contenu: contenuTeleverse }
    return Promise.resolve()
  }
}

class FeuilleDeRouteAvecDocumentRepositorySpy extends FeuilleDeRouteRepositorySpy {
  readonly #ancienChemin: string

  constructor(ancienChemin: string) {
    super()
    this.#ancienChemin = ancienChemin
  }

  override async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        document: { chemin: this.#ancienChemin, nom: 'ancien-document.pdf' },
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: {
          value: 'gouvernanceFooId',
        },
      })
    )
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(
      utilisateurFactory({ codeOrganisation: 'gouvernanceFooId', role: 'Gestionnaire département' })
    )
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    return Promise.resolve(gouvernanceFactory({ uid: uid.state.value }))
  }
}
