import { AccepterUnMembre } from './AccepterUnMembre'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetMembreRepository, UpdateMembreRepository } from './shared/MembreRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { Membre, MembreState } from '@/domain/Membre'
import { gouvernanceFactory, membreConfirmeFactory, membrePotentielFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('accepter un membre', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedMembrePotentielUidToFind = null
    spiedMembrePotentielToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné un gestionnaire de gouvernance, quand il accepte un membre potentiel, alors il devient membre confirmé de celle-ci', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembrePotentielRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembrePotentiel,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedMembrePotentielUidToFind).toBe(uidMembrePotentiel)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedMembrePotentielToUpdate?.state).toStrictEqual(
      membreConfirmeFactory({
        nom: 'La Poste',
        roles: [],
        statut: 'confirme',
        uid: {
          value: uidMembrePotentiel,
        },
        uidGouvernance: {
          value: uidGouvernance,
        },
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné un gestionnaire de gouvernance, quand il accepte un membre potentiel non associé à celle-ci, alors l’action échoue', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembrePotentielDUneAutreGouvernanceRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembrePotentiel,
    })

    // THEN
    expect(spiedMembrePotentielToUpdate).toBeNull()
    expect(result).toBe('membrePotentielNonAssocieALaGouvernance')
  })

  it('étant donné un gestionnaire de gouvernance sans droit, quand il accepte un membre potentiel, alors l’action échoue', async () => {
    // GIVEN
    const accepterUnMembre = new AccepterUnMembre(
      new GestionnaireSansDroitRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembrePotentielRepositorySpy()
    )

    // WHEN
    const result = await accepterUnMembre.handle({
      uidGestionnaire,
      uidGouvernance,
      uidMembrePotentiel,
    })

    // THEN
    expect(spiedMembrePotentielToUpdate).toBeNull()
    expect(result).toBe('gestionnaireNePeutPasAccepterLeMembrePotentiel')
  })

  it('étant donné un gestionnaire de gouvernance, quand il accepte un membre confirmé, alors l’action échoue', async () => {
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
      uidMembrePotentiel,
    })

    // THEN
    expect(spiedMembrePotentielToUpdate).toBeNull()
    expect(result).toBe('membreDejaConfirme')
  })
})

const uidGestionnaire = 'userFooId'
const uidGouvernance = 'gouvernanceFooId'
const uidMembrePotentiel = 'membrePotentielFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedMembrePotentielUidToFind: MembreState['uid']['value'] | null
let spiedMembrePotentielToUpdate: Membre | null
let spiedUtilisateurUidToFind: null | string

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ departement: { code: '75', codeRegion: '11', nom: 'Paris' }, role: 'Gestionnaire département' }))
  }
}

class GestionnaireSansDroitRepositorySpy implements GetUtilisateurRepository {
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

class MembrePotentielRepositorySpy implements GetMembreRepository, UpdateMembreRepository {
  async get(uid: MembreState['uid']['value']): Promise<Membre> {
    spiedMembrePotentielUidToFind = uid
    return Promise.resolve(membrePotentielFactory({ nom: 'La Poste', uidGouvernance: { value: uidGouvernance } }))
  }

  async update(membre: Membre): Promise<void> {
    spiedMembrePotentielToUpdate = membre
    return Promise.resolve()
  }
}

class MembreRepositorySpy extends MembrePotentielRepositorySpy {
  override async get(uid: MembreState['uid']['value']): Promise<Membre> {
    spiedMembrePotentielUidToFind = uid
    return Promise.resolve(membreConfirmeFactory({ uidGouvernance: { value: uidGouvernance } }))
  }
}

class MembrePotentielDUneAutreGouvernanceRepositorySpy extends MembrePotentielRepositorySpy {
  override async get(uid: MembreState['uid']['value']): Promise<Membre> {
    spiedMembrePotentielUidToFind = uid
    return Promise.resolve(membrePotentielFactory({ uidGouvernance: { value: 'autreGouvernanceFooId' } }))
  }
}
