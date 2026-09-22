import { describe, expect, it } from 'vitest'

import { LieuInclusion } from './LieuInclusion'
import { Roles } from './Role'
import { utilisateurFactory } from './testHelper'

describe('lieu d’inclusion (règles métier)', () => {
  it.each(Roles.map((role) => ({ attendu: role === 'Administrateur dispositif', role })))(
    'un $role peut créer un lieu : $attendu (#1495)',
    ({ attendu, role }) => {
      // GIVEN
      const utilisateur = utilisateurFactory({ role })

      // WHEN
      const peutCreer = LieuInclusion.peutEtreCreePar(utilisateur)

      // THEN
      expect(peutCreer).toBe(attendu)
    }
  )
})
