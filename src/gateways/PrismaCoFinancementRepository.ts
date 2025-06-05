/* eslint-disable @typescript-eslint/class-methods-use-this */
import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { CoFinancement } from '@/domain/CoFinancement'
import { 
  AddCoFinancementRepository, 
  GetCoFinancementRepository,
  SupprimerCoFinancementRepository,
  UpdateCoFinancementRepository, 
} from '@/use-cases/commands/shared/CoFinancementRepository'

export class PrismaCoFinancementRepository implements 
  AddCoFinancementRepository,
  GetCoFinancementRepository,
  SupprimerCoFinancementRepository,
  UpdateCoFinancementRepository {
  async add(coFinancement: CoFinancement, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    await client.coFinancementRecord.create({
      data: {
        actionId: Number(coFinancement.state.uidAction),
        memberId: coFinancement.state.uidMembre,
        montant: coFinancement.state.montant,
      },
    })

    return true
  }

  async get(uidAction: string, tx?: Prisma.TransactionClient): Promise<Array<CoFinancement>> {
    const client = tx ?? prisma

    const coFinancements = await client.coFinancementRecord.findMany({
      where: {
        actionId: Number(uidAction),
      },
    })

    return coFinancements.map(coFinancement => 
      CoFinancement.create({
        montant: coFinancement.montant,
        uid: { value: coFinancement.id.toString() },
        uidAction: { value: uidAction },
        uidMembre: coFinancement.memberId,
      }) as CoFinancement)
  }

  async supprimer(uidAction: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    await client.coFinancementRecord.deleteMany({
      where: {
        actionId: Number(uidAction),
      },
    })

    return true
  }

  async update(coFinancement: CoFinancement, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    await client.coFinancementRecord.update({
      data: {
        memberId: coFinancement.state.uidMembre,
        montant: coFinancement.state.montant,
      },
      where: {
        id: Number(coFinancement.state.uid.value),
      },
    })

    return true
  }
}
