import { AjouterNoteDeContexteAGouvernance } from './AjouterNoteDeContexteAGouvernance'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('ajouter une note de contexte à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une gouvernance existante, quand une note de contexte est créée par son gestionnaire, alors elle est ajoutée à cette gourvernance', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        noteDeContexte: {
          contenu,
          dateDeModification: epochTime,
          uidUtilisateurLAyantModifiee: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: uidUtilisateurCourant } }).state.uid
          ),
        },
        uid: uidGouvernance,
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une gouvernance existante, quand un comité est créé par un rôle appartenant au groupe admin, alors elle est ajoutée à cette gourvernance', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireGroupeAdminRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        noteDeContexte: {
          contenu,
          dateDeModification: epochTime,
          uidUtilisateurLAyantModifiee: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: uidUtilisateurCourant } }).state.uid
          ),
        },
        uid: uidGouvernance,
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une gouvernance existante, quand un comité est créé par un gestionnaire département mais qui n’a pas le même département que celui de la gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireAutreDepartementRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uidGouvernance, uidUtilisateurCourant: 'utilisateurUsurpateur' })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('utilisateurUsurpateur')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterNoteDeContexte')
  })

  it('étant donné une gouvernance inexistante, quand une note de contexte est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('gouvernanceInexistante')
  })

  it('étant donné un utilisateur inexistant, quand une note de contexte est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireInexistantRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurCourantInexistant')
  })
})

const contenu = '<p>Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.</p>'
const uidGouvernance = '1'
const uidUtilisateurCourant = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: string | null

class GouvernanceExistanteRepositorySpy implements FindGouvernanceRepository, UpdateGouvernanceRepository {
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
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }))
  }
}

class GestionnaireInexistantRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireGroupeAdminRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ role: 'Administrateur dispositif' }))
  }
}

class GestionnaireAutreDepartementRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}
