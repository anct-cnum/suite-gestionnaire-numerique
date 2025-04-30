import { PrismaMembreDepartementRepository } from './PrismaMembreDepartementRepository'
import { creerUnContact, creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreDepartement } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('membre repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('récupérer un membre existant avec ses rôles', async () => {
    // GIVEN
    const departementCode = '69'
    const membreId = 'membre-test-id'

    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUneGouvernance({ departementCode })
    await creerUnContact()
    await creerUnMembre({
      gouvernanceDepartementCode: departementCode,
      id: membreId,
      statut: 'confirme',
    })
    await creerUnMembreDepartement({
      departementCode,
      membreId,
      role: 'Observateur',
    })

    const repository = new PrismaMembreDepartementRepository()

    // WHEN
    const membre = await repository.get(membreId, departementCode)

    // THEN
    expect(membre).not.toBeNull()
    expect(membre?.state.roles).toContain('Observateur')
  })

  it('ajouter un nouveau rôle à un membre', async () => {
    // GIVEN
    const departementCode = '69'
    const membreId = 'membre-test-id'
    const nouveauRole = 'Financeur'

    await creerUneRegion()
    await creerUnDepartement({ code: departementCode })
    await creerUneGouvernance({ departementCode })
    await creerUnContact()
    await creerUnMembre({
      gouvernanceDepartementCode: departementCode,
      id: membreId,
      statut: 'confirme',
    })
    await creerUnMembreDepartement({
      departementCode,
      membreId,
      role: 'Observateur',
    })

    const repository = new PrismaMembreDepartementRepository()

    // WHEN
    await repository.add(membreId, departementCode, nouveauRole)
    const membreApresAjout = await repository.get(membreId, departementCode)

    // THEN
    expect(membreApresAjout).not.toBeNull()
    expect(membreApresAjout?.state.roles).toContain('Observateur')
    expect(membreApresAjout?.state.roles).toContain(nouveauRole)
  })
})
