import { describe, expect, it } from 'vitest'

import { LieuInclusion } from './LieuInclusion'
import { utilisateurFactory } from './testHelper'

describe('lieu d’inclusion : qui peut le modifier', () => {
  it.each([
    {
      attendu: true,
      intention: 'un administrateur dispositif peut modifier n’importe quel lieu',
      utilisateur: utilisateurFactory({ role: 'Administrateur dispositif' }),
    },
    {
      attendu: true,
      intention: 'un gestionnaire département peut modifier un lieu de son département',
      utilisateur: utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }),
    },
    {
      attendu: false,
      intention: 'un gestionnaire département ne peut pas modifier un lieu d’un autre département',
      utilisateur: utilisateurFactory({ codeOrganisation: '93', role: 'Gestionnaire département' }),
    },
    {
      attendu: true,
      intention: 'un gestionnaire structure peut modifier un lieu de sa structure où une personne est affectée',
      nombrePersonnesAffectees: 1,
      utilisateur: utilisateurFactory({ codeOrganisation: '42', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      intention: 'un gestionnaire structure ne peut pas modifier un lieu de sa structure sans personne affectée',
      nombrePersonnesAffectees: 0,
      utilisateur: utilisateurFactory({ codeOrganisation: '42', role: 'Gestionnaire structure' }),
    },
    {
      attendu: true,
      departementsGouvernances: ['75'],
      intention:
        'un gestionnaire structure membre d’une gouvernance peut modifier un lieu du département de cette gouvernance',
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      departementsGouvernances: ['93'],
      intention:
        'un gestionnaire structure membre d’une gouvernance d’un autre département ne peut pas modifier un lieu tiers',
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      intention: 'un gestionnaire structure sans gouvernance ne peut pas modifier un lieu d’une autre structure',
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      departementsGouvernances: ['75'],
      intention: 'un lieu sans département n’est modifiable par aucun gestionnaire',
      lieuSansDepartement: true,
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      intention: 'un gestionnaire région ne peut pas modifier un lieu',
      utilisateur: utilisateurFactory({ codeOrganisation: '11', role: 'Gestionnaire région' }),
    },
  ])(
    '$intention',
    ({
      attendu,
      departementsGouvernances = [],
      lieuSansDepartement = false,
      nombrePersonnesAffectees = 0,
      utilisateur,
    }) => {
      // WHEN
      const peutModifier = LieuInclusion.peutEtreModifiePar(
        utilisateur,
        lieuSansDepartement ? undefined : '75',
        42,
        nombrePersonnesAffectees,
        departementsGouvernances
      )

      // THEN
      expect(peutModifier).toBe(attendu)
    }
  )
})
