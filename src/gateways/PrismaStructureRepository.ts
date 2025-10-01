import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Structure } from '@/domain/Structure'
import { StructureData, StructureRepository } from '@/use-cases/commands/shared/StructureRepository'

export class PrismaStructureRepository implements StructureRepository {
  async create(data: StructureData, tx?: Prisma.TransactionClient): Promise<Structure> {
    const client = tx ?? prisma
    const structure = await client.structureRecord.create({
      data: {
        adresse: data.adresse,
        categorieJuridique: data.categorieJuridique,
        codePostal: data.codePostal,
        commune: data.commune,
        contact: {
          email: '',
          fonction: '',
          nom: '',
          prenom: '',
          telephone: '',
        },
        departementCode: data.departementCode,
        identifiantEtablissement: data.identifiantEtablissement,
        idMongo: crypto.randomUUID(),
        nom: data.nom,
        statut: 'active',
        type: data.categorieJuridiqueLibelle,
      },
    })

    return Structure.create({
      departementCode: structure.departementCode,
      identifiantEtablissement: structure.identifiantEtablissement,
      nom: structure.nom,
      uid: { value: structure.id },
    })
  }

  async getBySiret(siret: string, tx?: Prisma.TransactionClient): Promise<null | Structure> {
    const client = tx ?? prisma
    const structure = await client.structureRecord.findFirst({
      where: {
        identifiantEtablissement: siret,
      },
    })

    if (!structure) {
      return null
    }

    return Structure.create({
      departementCode: structure.departementCode,
      identifiantEtablissement: structure.identifiantEtablissement,
      nom: structure.nom,
      uid: { value: structure.id },
    })
  }
}