import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { MembreConfirme } from '@/domain/MembreConfirme'
import { membreFactory, StatutFactory } from '@/domain/MembreFactory'
import { MembreDepartementRepository } from '@/use-cases/commands/shared/MembreDepartementRepository'

export class PrismaMembreDepartementRepository implements MembreDepartementRepository {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async add(membreId: string, departementCode: string, role: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    await client.membreGouvernanceDepartementRecord.create({
      data: {
        departementCode,
        membreId,
        role,
      },
    })

    return true
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(membreId: string, departementCode: string, tx?: Prisma.TransactionClient): Promise<MembreConfirme | null> {
    const client = tx ?? prisma

    const membreRecord = await client.membreRecord.findUnique({
      include: {
        membresGouvernanceDepartement: {
          include: {
            relationDepartement: true,
          },
          where: { departementCode },
        },
      },
      where: { id: membreId },
    })

    if (!membreRecord || membreRecord.membresGouvernanceDepartement.length === 0) {
      return null
    }

    const roles = membreRecord.membresGouvernanceDepartement.map(membre => membre.role)
    const nomDuDepartement = membreRecord.membresGouvernanceDepartement[0].relationDepartement.nom

    return membreFactory({
      nom: nomDuDepartement,
      roles,
      statut: membreRecord.statut as StatutFactory,
      uid: {
        value: membreRecord.id,
      },
      uidGouvernance: {
        value: departementCode,
      },
    }) as MembreConfirme
  }
}
