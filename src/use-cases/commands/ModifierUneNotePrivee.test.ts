import { ModifierUneNotePrivee } from './ModifierUneNotePrivee'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('modifier une note privée à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une gouvernance existante, quand une note privée est modifiée par son gestionnaire, alors elle est modifiée', async () => {
    // GIVEN
    const dateDeModification = new Date('3000-01-01')
    const uidEditeur = 'userFooId2'
    const ajouterNotePrivee = new ModifierUneNotePrivee(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      dateDeModification
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({
      contenu,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        notePrivee: {
          contenu,
          dateDeModification,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'michel.tartempion@example.net', value: uidEditeur } }).state.uid
          ),
        },
        uid: uidGouvernance,
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une gouvernance existante, quand un note privée est modifiée par un gestionnaire qui n’a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new ModifierUneNotePrivee(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({ contenu, uidEditeur: 'utilisateurUsurpateur', uidGouvernance })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('utilisateurUsurpateur')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('editeurNePeutPasAjouterNotePrivee')
  })

  it('étant donné une gouvernance existante, quand un note privée est modifiée par un gestionnaire département mais qu’une note privée n’existe pas, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new ModifierUneNotePrivee(
      new GouvernanceSansNotePriveeRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({ contenu, uidEditeur, uidGouvernance })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('notePriveeInexistante')
  })

  it('étant donné une gouvernance inexistante, quand une note privée est modifiée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new ModifierUneNotePrivee(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({
      contenu,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('gouvernanceInexistante')
  })

  it('étant donné un utilisateur inexistant, quand une note privée est modifiée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNotePrivee = new ModifierUneNotePrivee(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireInexistantRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNotePrivee.execute({
      contenu,
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('editeurInexistant')
  })
})

const contenu = 'Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.'
const uidGouvernance = 'gouvernanceFooId'
const emailEditeur = 'martin.tartempion@example.com'
const uidEditeur = 'userFooId'
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
        notePrivee: {
          contenu: 'un contenu',
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: emailEditeur, value: uidEditeur } }).state.uid
          ),
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

class GouvernanceInexistanteRepositorySpy extends GouvernanceRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(null)
  }
}

class GouvernanceSansNotePriveeRepositorySpy extends GouvernanceRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        notePrivee: undefined,
      })
    )
  }
}

class GestionnaireRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: 'michel.tartempion@example.net', value: 'userFooId2' },
    }))
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
