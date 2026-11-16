import { Prisma } from '../../../prisma/generated/client'
import prisma from '../../../prisma/prismaClient'
import { DefisConsommesRepository } from '@/use-cases/mesure-impact/DeposerUneReponse'

export class PrismaDefiConsommeRepository implements DefisConsommesRepository {
  readonly #dataResource = prisma.mesureImpactDefiConsommeRecord

  // Un défi échu ne peut plus être présenté : il n'a plus besoin d'être gardé
  async consommer(empreinte: string, expiration: Date, maintenant: Date): Promise<boolean> {
    await this.#dataResource.deleteMany({ where: { expiration: { lt: maintenant } } })
    try {
      await this.#dataResource.create({ data: { expiration, signature: empreinte } })
      return true
    } catch (error) {
      // P2002 : défi déjà consommé
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return false
      }
      throw error
    }
  }
}
