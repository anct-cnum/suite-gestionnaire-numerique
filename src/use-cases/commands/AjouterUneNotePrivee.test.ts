import { AjouterUneNotePrivee } from './AjouterUneNotePrivee'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('ajouter une note privée à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une gouvernance existante, quand une note privée est créée par son gestionnaire, alors elle est ajoutée à cette gourvernance', async () => {
    // GIVEN
    const ajouterNotePrivee = new AjouterUneNotePrivee(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({
      contenu,
      uidGouvernance,
      uidUtilisateurCourant,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        notePrivee: {
          contenu,
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: uidUtilisateurCourant } }).state.uid
          ),
        },
        uid: uidGouvernance,
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une gouvernance existante, quand un note privée est créée par un gestionnaire qui n’a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new AjouterUneNotePrivee(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({ contenu, uidGouvernance, uidUtilisateurCourant: 'utilisateurUsurpateur' })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('utilisateurUsurpateur')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterNotePrivee')
  })

  it('étant donné une gouvernance existante, quand un note privée est créée par un gestionnaire département mais qu’une note privée existe déjà, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new AjouterUneNotePrivee(
      new GouvernanceAvecNotePriveeRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({ contenu, uidGouvernance, uidUtilisateurCourant })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateurCourant)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('notePriveeDejaExistante')
  })

  it('étant donné une gouvernance inexistante, quand une note privée est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new AjouterUneNotePrivee(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({
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

  it('étant donné un utilisateur inexistant, quand une note privée est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new AjouterUneNotePrivee(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireInexistantRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({
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

const contenu = 'Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.'
const uidGouvernance = 'gouvernanceFooId'
const uidUtilisateurCourant = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: string | null

class GouvernanceRepositorySpy implements FindGouvernanceRepository, UpdateGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        notePrivee: undefined,
        uid: uidGouvernance,
      })
    )
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    spiedGouvernanceToUpdate = gouvernance
    return Promise.resolve()
  }
}

class GouvernanceInexistanteRepositorySpy extends GouvernanceRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(null)
  }
}

class GouvernanceAvecNotePriveeRepositorySpy extends GouvernanceRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        notePrivee: {
          contenu: 'contenu',
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: uidUtilisateurCourant } }).state.uid
          ),
        },
      })
    )
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
