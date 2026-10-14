import { beforeEach, describe, expect, it } from 'vitest'

import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetMembreRepository, UpdateMembreRepository } from './shared/MembreRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUnMembreOuCandidat } from './SupprimerUnMembreOuCandidat'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { Membre } from '@/domain/Membre'
import {
  gouvernanceFactory,
  membreConfirmeFactory,
  membrePotentielFactory,
  utilisateurFactory,
} from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('supprimer un membre ou un candidat', () => {
  beforeEach(() => {
    spiedMembreToUpdate = null
  })

  it.each([
    { intention: 'un membre confirmé', membre: membreConfirmeFactory({ uid: { value: 'membreUid' } }) },
    { intention: 'un candidat', membre: membrePotentielFactory({ uid: { value: 'membreUid' } }) },
  ])(
    'quand le gestionnaire de la gouvernance supprime $intention de cette gouvernance, alors le membre est marqué supprimé à la date donnée',
    async ({ membre }) => {
      // WHEN
      const result = await new SupprimerUnMembreOuCandidat(
        new MembreRepositorySpy(membre),
        new UtilisateurRepositorySpy(gestionnaireDeLaGouvernance),
        new GouvernanceRepositorySpy()
      ).handle(command)

      // THEN
      expect(result).toBe('OK')
      expect(spiedMembreToUpdate?.state.dateSuppression).toStrictEqual(epochTime)
      expect(spiedMembreToUpdate?.state.uidGouvernance.value).toBe('gouvernanceFooId')
    }
  )

  it.each([
    {
      attendu: 'UtilisateurNonAutorise',
      intention: 'l’utilisateur n’est pas gestionnaire de la gouvernance',
      membre: membreConfirmeFactory({ uid: { value: 'membreUid' } }),
      utilisateur: utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }),
    },
    {
      attendu: 'MembreNonAssocieALaGouvernance',
      intention: 'le membre est rattaché à une autre gouvernance',
      membre: membreConfirmeFactory({ uid: { value: 'membreUid' }, uidGouvernance: { value: 'autreGouvernanceId' } }),
      utilisateur: gestionnaireDeLaGouvernance,
    },
  ])(
    'quand $intention, alors une erreur est renvoyée et rien n’est modifié',
    async ({ attendu, membre, utilisateur }) => {
      // WHEN
      const result = await new SupprimerUnMembreOuCandidat(
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
  date: epochTime,
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
