import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaGouvernanceStructureLoader } from './PrismaGouvernanceStructureLoader'
import { creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUneStructure, creerUnMembre } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('prisma gouvernance structure loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it(
    'je récupère la gouvernance des structures membres, avec territoires dédupliqués, en ignorant les structures ' +
      'sans membre ou hors périmètre demandé',
    async () => {
      // GIVEN
      await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
      await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
      await creerUnDepartement({ code: '75', nom: 'Paris', regionCode: '84' })
      await creerUneGouvernance({ departementCode: '69' })
      await creerUneGouvernance({ departementCode: '75' })

      await creerUneStructure({ id: 1, nom: 'Structure Coporteuse', siret: '11111111111111' })
      await creerUnMembre({
        gouvernanceDepartementCode: '69',
        id: 'membre-coporteur',
        isCoporteur: true,
        structureId: 1,
      })

      await creerUneStructure({
        denomination_antenne: 'Antenne Lyon',
        id: 2,
        nom: 'Structure Membre',
        siret: '22222222222222',
      })
      await creerUnMembre({ gouvernanceDepartementCode: '75', id: 'membre-simple', structureId: 2 })

      await creerUneStructure({ id: 3, nom: 'Structure Candidate', siret: '33333333333333' })
      await creerUnMembre({
        gouvernanceDepartementCode: '69',
        id: 'membre-candidat',
        statut: 'candidat',
        structureId: 3,
      })

      await creerUneStructure({ id: 4, nom: 'Structure Sans Membre', siret: '44444444444444' })

      await creerUneStructure({ id: 5, nom: 'Structure Hors Périmètre', siret: '55555555555555' })
      await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-hors-perimetre', structureId: 5 })

      await creerUneStructure({ id: 6, nom: 'Structure Multi Territoires', siret: '66666666666666' })
      await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-multi-1', structureId: 6 })
      await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-multi-2', structureId: 6 })
      await creerUnMembre({ gouvernanceDepartementCode: '75', id: 'membre-multi-3', structureId: 6 })

      // WHEN
      const gouvernanceParStructure = await new PrismaGouvernanceStructureLoader().recupererGouvernanceDesStructures([
        1, 2, 3, 4, 6,
      ])

      // THEN
      expect(gouvernanceParStructure).toStrictEqual(
        new Map([
          [
            1,
            {
              roleGouvernance: 'coporteur',
              siret: '11111111111111',
              statutStructure: 'validée',
              territoires: ['Rhône'],
            },
          ],
          [
            2,
            { roleGouvernance: 'membre', siret: '22222222222222', statutStructure: 'validée', territoires: ['Paris'] },
          ],
          [
            3,
            {
              roleGouvernance: 'membre',
              siret: '33333333333333',
              statutStructure: 'candidate',
              territoires: ['Rhône'],
            },
          ],
          [
            6,
            {
              roleGouvernance: 'membre',
              siret: '66666666666666',
              statutStructure: 'validée',
              territoires: ['Rhône', 'Paris'],
            },
          ],
        ])
      )
      expect(gouvernanceParStructure.has(4)).toBe(false)
      expect(gouvernanceParStructure.has(5)).toBe(false)
    }
  )

  it('quand aucune structure n’a de membre de gouvernance alors je récupère une map vide', async () => {
    // GIVEN
    await creerUneStructure({ id: 1, nom: 'Structure Sans Membre' })

    // WHEN
    const gouvernanceParStructure = await new PrismaGouvernanceStructureLoader().recupererGouvernanceDesStructures([1])

    // THEN
    expect(gouvernanceParStructure).toStrictEqual(new Map())
  })
})
