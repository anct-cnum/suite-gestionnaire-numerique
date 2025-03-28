import { DropComiteRepository, GetComiteRepository } from './shared/ComiteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUnComite } from './SupprimerUnComite'
import { Comite } from '@/domain/Comite'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { comiteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('supprimer un comité', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedUtilisateurUidToFind = null
    spiedComiteToDrop = null
    spiedComiteUidToFind = null
  })

  it('étant donné une gouvernance, quand un comité est supprimé par son gestionnaire, alors il est supprimé', async () => {
    // GIVEN
    const supprimerUnComite = new SupprimerUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ComiteRepositorySpy()
    )

    // WHEN
    const result = await supprimerUnComite.handle({
      uid: uidComite,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedComiteUidToFind).toBe(uidComite)
    expect(spiedComiteToDrop?.state).toStrictEqual(
      comiteFactory({
        uid: {
          value: uidComite,
        },
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

  it('étant donné une gouvernance, quand un comité est supprimé par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const supprimerUnComite = new SupprimerUnComite(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ComiteRepositorySpy()
    )

    // WHEN
    const result = await supprimerUnComite.handle({
      uid: uidComite,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedComiteToDrop).toBeNull()
    expect(result).toBe('editeurNePeutPasSupprimerComite')
  })
})

const uidComite = 'comiteFooId'
const uidGouvernance = 'gouvernanceFooId'
const emailEditeur = 'martin.tartempion@example.net'
const uidEditeur = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: null | UtilisateurUidState['value']
let spiedComiteToDrop: Comite | null
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

class ComiteRepositorySpy implements DropComiteRepository, GetComiteRepository {
  async drop(comite: Comite): Promise<void> {
    spiedComiteToDrop = comite
    return Promise.resolve()
  }

  async get(uid: Comite['uid']['state']['value']): Promise<Comite> {
    spiedComiteUidToFind = uid
    return Promise.resolve(comiteFactory({
      uid: { value: uidComite },
      uidEditeur: { email: emailEditeur, value: uidEditeur },
      uidGouvernance: { value: uidGouvernance },
    }))
  }
}
