import { DropComiteRepository, FindComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
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
    const result = await supprimerUnComite.execute({
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
    const result = await supprimerUnComite.execute({
      uid: uidComite,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('userFooId')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(result).toBe('editeurNePeutPasSupprimerComite')
    expect(spiedComiteToDrop).toBeNull()
  })
})

const uidComite = 'comiteFooId'
const uidGouvernance = 'gouvernanceFooId'
const emailEditeur = 'martin.tartempion@example.net'
const uidEditeur = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: UtilisateurUidState['value'] | null
let spiedComiteToDrop: Comite | null
let spiedComiteUidToFind: Comite['uid']['state']['value'] | null

class GouvernanceRepositorySpy implements FindGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Gouvernance> {
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

class GestionnaireRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: emailEditeur, value: uidEditeur },
    }))
  }
}

class GestionnaireAutreRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class ComiteRepositorySpy implements DropComiteRepository, FindComiteRepository {
  async find(uid: Comite['uid']['state']['value']): Promise<Comite> {
    spiedComiteUidToFind = uid
    return Promise.resolve(comiteFactory({
      uid: { value: uidComite },
      uidEditeur: { email: emailEditeur, value: uidEditeur },
      uidGouvernance: { value: uidGouvernance },
    }))
  }

  async drop(comite: Comite): Promise<void> {
    spiedComiteToDrop = comite
    return Promise.resolve()
  }
}
