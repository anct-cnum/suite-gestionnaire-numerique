import { AccepterUnMembre } from './AccepterUnMembre'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetMembreRepository, UpdateMembreRepository } from './shared/MembreRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { Membre, MembreState } from '@/domain/Membre'
import { gouvernanceFactory, membreInvalideFactory, membreValideFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('accepter un membre', () => {
  beforeEach(() => {
    spiedMembreInvalideToUpdate = null
  })

  it('en tant que gestionnaire d’une gouvernance, quand un membre invalide non associé à celle-ci y est ajouté, alors une erreur est renvoyée', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreInvalideDUneAutreGouvernanceRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembreInvalide,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedMembreInvalideUidToFind).toBe(uidMembreInvalide)
    expect(spiedGouvernanceUidToFind.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedMembreInvalideToUpdate).toBeNull()
    expect(result).toBe('membreInvalideNonAssocieALaGouvernance')
  })

  it('en tant que gestionnaire n’appartenant pas à la gouvernance, quand un membre invalide y est ajouté, alors une erreur est renvoyée', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireAutreRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreInvalideRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembreInvalide,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedMembreInvalideUidToFind).toBe(uidMembreInvalide)
    expect(spiedGouvernanceUidToFind.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedMembreInvalideToUpdate).toBeNull()
    expect(result).toBe('gestionnaireNePeutPasAccepterLeMembreInvalide')
  })

  it('en tant que gestionnaire d’une gouvernance, quand un membre invalide y est ajouté, alors il devient membre validé de celle-ci', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreInvalideRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembreInvalide,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedMembreInvalideUidToFind).toBe(uidMembreInvalide)
    expect(spiedGouvernanceUidToFind.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedMembreInvalideToUpdate?.state).toStrictEqual(
      membreValideFactory({
        nom: 'La Poste',
        roles: ['observateur'],
        statut: 'valide',
        uid: {
          value: uidMembreInvalide,
        },
        uidGouvernance: {
          value: uidGouvernance,
        },
      }).state
    )
    expect(result).toBe('OK')
  })

  it('en tant que gestionnaire d’une gouvernance, quand un membre déjà validé y est ajouté, alors une erreur est renvoyée', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembreInvalide,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedMembreInvalideUidToFind).toBe(uidMembreInvalide)
    expect(spiedGouvernanceUidToFind.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedMembreInvalideToUpdate).toBeNull()
    expect(result).toBe('membreDejaValide')
  })
})

const uidGestionnaire = 'userFooId'
const uidGouvernance = 'gouvernanceFooId'
const uidMembreInvalide = 'membreInvalideFooId'
let spiedGouvernanceUidToFind: GouvernanceUid
let spiedMembreInvalideUidToFind: MembreState['uid']['value']
let spiedMembreInvalideToUpdate: Membre | null
let spiedUtilisateurUidToFind: string

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory())
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

class MembreInvalideRepositorySpy implements GetMembreRepository, UpdateMembreRepository {
  async get(uid: MembreState['uid']['value']): Promise<Membre> {
    spiedMembreInvalideUidToFind = uid
    return Promise.resolve(membreInvalideFactory({ nom: 'La Poste', uidGouvernance: { value: uidGouvernance } }))
  }

  async update(membre: Membre): Promise<void> {
    spiedMembreInvalideToUpdate = membre
    return Promise.resolve()
  }
}

class MembreRepositorySpy extends MembreInvalideRepositorySpy {
  override async get(uid: MembreState['uid']['value']): Promise<Membre> {
    spiedMembreInvalideUidToFind = uid
    return Promise.resolve(membreValideFactory({ uidGouvernance: { value: uidGouvernance } }))
  }
}

class MembreInvalideDUneAutreGouvernanceRepositorySpy extends MembreInvalideRepositorySpy {
  override async get(uid: MembreState['uid']['value']): Promise<Membre> {
    spiedMembreInvalideUidToFind = uid
    return Promise.resolve(membreInvalideFactory({ uidGouvernance: { value: 'autreGouvernanceFooId' } }))
  }
}
