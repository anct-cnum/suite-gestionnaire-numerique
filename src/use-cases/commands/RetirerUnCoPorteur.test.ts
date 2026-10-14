import { beforeEach, describe, expect, it } from 'vitest'

import { RetirerUnCoPorteur } from './RetirerUnCoPorteur'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetMembreRepository, UpdateMembreRepository } from './shared/MembreRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { Membre } from '@/domain/Membre'
import {
  gouvernanceFactory,
  membreConfirmeFactory,
  membrePotentielFactory,
  utilisateurFactory,
} from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('retirer un coporteur', () => {
  beforeEach(() => {
    spiedMembreToUpdate = null
  })

  it('quand le gestionnaire de la gouvernance retire le rôle coporteur d’un membre de cette gouvernance, alors le membre est mis à jour sans ce rôle', async () => {
    // GIVEN
    const membre = membreConfirmeFactory({ roles: ['observateur', 'coporteur'], uid: { value: 'membreUid' } })

    // WHEN
    const result = await new RetirerUnCoPorteur(
      new MembreRepositorySpy(membre),
      new UtilisateurRepositorySpy(gestionnaireDeLaGouvernance),
      new GouvernanceRepositorySpy()
    ).handle(command)

    // THEN
    expect(result).toBe('OK')
    expect(spiedMembreToUpdate?.state.roles).toStrictEqual(['observateur'])
    expect(spiedMembreToUpdate?.state.uidGouvernance.value).toBe('gouvernanceFooId')
  })

  it.each([
    {
      attendu: 'UtilisateurNonAutorise',
      intention: 'l’utilisateur n’est pas gestionnaire de la gouvernance',
      membre: membreConfirmeFactory({ roles: ['observateur', 'coporteur'], uid: { value: 'membreUid' } }),
      utilisateur: utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }),
    },
    {
      attendu: 'MembreNonAssocieALaGouvernance',
      intention: 'le membre est rattaché à une autre gouvernance',
      membre: membreConfirmeFactory({
        roles: ['observateur', 'coporteur'],
        uid: { value: 'membreUid' },
        uidGouvernance: { value: 'autreGouvernanceId' },
      }),
      utilisateur: gestionnaireDeLaGouvernance,
    },
    {
      attendu: 'MembreDoitEtreConfirmer',
      intention: 'le membre est encore candidat',
      membre: membrePotentielFactory({ uid: { value: 'membreUid' } }),
      utilisateur: gestionnaireDeLaGouvernance,
    },
    {
      attendu: 'MembreDéjàNonCoPorteur',
      intention: 'le membre n’est pas coporteur',
      membre: membreConfirmeFactory({ roles: ['observateur'], uid: { value: 'membreUid' } }),
      utilisateur: gestionnaireDeLaGouvernance,
    },
  ])(
    'quand $intention, alors une erreur est renvoyée et rien n’est modifié',
    async ({ attendu, membre, utilisateur }) => {
      // WHEN
      const result = await new RetirerUnCoPorteur(
        new MembreRepositorySpy(membre),
        new UtilisateurRepositorySpy(utilisateur),
        new GouvernanceRepositorySpy()
      ).handle(command)

      // THEN
      expect(result).toBe(attendu)
      expect(spiedMembreToUpdate).toBeNull()
    }
  )
})

const command = {
  uidGouvernance: 'gouvernanceFooId',
  uidMembre: 'membreUid',
  uidUtilisateurConnecte: 1,
}
const gestionnaireDeLaGouvernance = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
let spiedMembreToUpdate: Membre | null

class MembreRepositorySpy implements GetMembreRepository, UpdateMembreRepository {
  readonly #membre: Membre

  constructor(membre: Membre) {
    this.#membre = membre
  }

  async get(): Promise<Membre> {
    return Promise.resolve(this.#membre)
  }

  async update(membre: Membre): Promise<void> {
    spiedMembreToUpdate = membre
    return Promise.resolve()
  }
}

class UtilisateurRepositorySpy implements GetUtilisateurRepository {
  readonly #utilisateur: Utilisateur

  constructor(utilisateur: Utilisateur) {
    this.#utilisateur = utilisateur
  }

  async get(): Promise<Utilisateur> {
    return Promise.resolve(this.#utilisateur)
  }
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    return Promise.resolve(gouvernanceFactory({ uid: uid.state.value }))
  }
}
