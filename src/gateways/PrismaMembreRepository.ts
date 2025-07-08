import { membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { Membre, MembreState } from '@/domain/Membre'
import { membreFactory, StatutFactory } from '@/domain/MembreFactory'
import { MembreRepository } from '@/use-cases/commands/shared/MembreRepository'

export class PrismaMembreRepository implements MembreRepository {
  readonly #membreDataResource = prisma.membreRecord

  async get(uid: MembreState['uid']['value']): Promise<Membre> {
    const record = await this.#membreDataResource.findUniqueOrThrow({
      include: membreInclude,
      where: {
        id: uid,
      },
    })

    const membre = toMembre(record)

    return membreFactory({
      nom: membre.nom,
      roles: membre.roles,
      statut: membre.statut as StatutFactory,
      uid: {
        value: membre.id,
      },
      uidGouvernance: {
        value: record.gouvernanceDepartementCode,
      },
    }) as Membre
  }

  async update(membre: Membre): Promise<void> {
    await this.#membreDataResource.update({
      data: {
        isCoporteur: membre.state.roles.includes('coporteur'),
        statut: membre.state.statut,
      },
      where: {
        id: membre.state.uid.value,
      },
    })
  }
}
