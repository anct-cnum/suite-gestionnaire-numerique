import { describe, expect, it } from 'vitest'

import { LieuInclusion } from './LieuInclusion'
import { Roles } from './Role'
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
      estDeLaStructureDuDemandeur: true,
      intention: 'un gestionnaire structure peut modifier un lieu de sa structure',
      utilisateur: utilisateurFactory({ codeOrganisation: '42', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      estDeLaStructureDuDemandeur: true,
      intention: 'un gestionnaire département ne tire aucun droit des lieux de sa structure de rattachement',
      utilisateur: utilisateurFactory({ codeOrganisation: '93', role: 'Gestionnaire département' }),
    },
    {
      attendu: true,
      departementsCoportes: ['75'],
      intention: 'un gestionnaire d’une structure co-porteuse peut modifier un lieu du département de sa gouvernance',
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      departementsCoportes: ['93'],
      intention:
        'un gestionnaire d’une structure co-porteuse d’un autre département ne peut pas modifier un lieu tiers',
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      intention: 'un gestionnaire structure sans gouvernance ne peut pas modifier un lieu d’une autre structure',
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: false,
      departementsCoportes: ['75'],
      intention: 'un lieu sans département n’est modifiable par aucun gestionnaire',
      lieuSansDepartement: true,
      utilisateur: utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' }),
    },
    {
      attendu: true,
      intention: 'un gestionnaire région peut modifier un lieu de sa région',
      utilisateur: utilisateurFactory({ codeOrganisation: '11', role: 'Gestionnaire région' }),
    },
    {
      attendu: false,
      intention: 'un gestionnaire région ne peut pas modifier un lieu d’une autre région',
      utilisateur: utilisateurFactory({ codeOrganisation: '84', role: 'Gestionnaire région' }),
    },
    {
      attendu: false,
      intention: 'un lieu sans département n’est modifiable par aucun gestionnaire région',
      lieuSansDepartement: true,
      utilisateur: utilisateurFactory({ codeOrganisation: '11', role: 'Gestionnaire région' }),
    },
  ])(
    '$intention',
    ({
      attendu,
      departementsCoportes = [],
      estDeLaStructureDuDemandeur = false,
      lieuSansDepartement = false,
      utilisateur,
    }) => {
      // GIVEN un lieu de Paris (département 75, région 11)
      const lieu = lieuSansDepartement
        ? { estDeLaStructureDuDemandeur }
        : { codeDepartement: '75', codeRegion: '11', estDeLaStructureDuDemandeur }

      // WHEN
      const peutModifier = LieuInclusion.peutEtreModifiePar(utilisateur, lieu, departementsCoportes)

      // THEN
      expect(peutModifier).toBe(attendu)
    }
  )
})

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
