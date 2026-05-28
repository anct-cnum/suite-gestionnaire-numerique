import prisma from '../../prisma/prismaClient'
import { TerritoireLoader, TerritoiresReadModel } from '@/use-cases/queries/shared/TerritoireReadModel'

export class PrismaTerritoireLoader implements TerritoireLoader {
  async recupererTerritoires(structureIds: ReadonlyArray<number>): Promise<TerritoiresReadModel> {
    // Récupérer les départements des structures (via l'adresse)
    // Refonte 2026 : structureIds refere a main.structure_administrative.id.
    const structuresRecords = await prisma.main_structure_administrative.findMany({
      include: {
        adresse: true,
      },
      where: {
        id: { in: [...structureIds] },
      },
    })

    const structureDepartements = new Map<number, string>()
    for (const structure of structuresRecords) {
      const departement = structure.adresse?.departement
      if (departement !== null && departement !== undefined) {
        structureDepartements.set(structure.id, departement)
      }
    }

    // Récupérer tous les départements avec leur région
    const departementsRecords = await prisma.departementRecord.findMany({
      include: {
        relationRegion: true,
      },
    })

    const departements = departementsRecords.map((dept) => ({
      code: dept.code,
      nom: dept.nom,
      regionCode: dept.regionCode,
      regionNom: dept.relationRegion.nom,
    }))

    return { departements, structureDepartements }
  }
}
