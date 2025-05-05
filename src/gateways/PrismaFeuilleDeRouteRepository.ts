import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { FeuilleDeRouteRepository } from '@/use-cases/commands/shared/FeuilleDeRouteRepository'

export class PrismaFeuilleDeRouteRepository implements FeuilleDeRouteRepository {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async add(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma
    const feuilleDeRouteResource = client.feuilleDeRouteRecord

    await feuilleDeRouteResource.create({
      data: {
        creation: feuilleDeRoute.state.dateDeCreation,
        derniereEdition: feuilleDeRoute.state.dateDeModification,
        gouvernanceDepartementCode: feuilleDeRoute.state.uidGouvernance,
        nom: feuilleDeRoute.state.nom,
        perimetreGeographique: feuilleDeRoute.state.perimetreGeographique,
        porteurId: feuilleDeRoute.state.uidPorteur,
      },
    })

    return true
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    const record = await  prisma.feuilleDeRouteRecord.findUniqueOrThrow({
      include: {
        relationUtilisateur: true,
      },
      where: {
        id: Number(uid),
      },
    })

    const feuilleDeRoute = FeuilleDeRoute.create({
      dateDeCreation: record.creation,
      dateDeModification: record.derniereEdition ?? record.creation,
      nom: record.nom,
      noteDeContextualisation: record.noteDeContextualisation ?? undefined,
      perimetreGeographique: record.perimetreGeographique ?? 'departemental',
      uid: { value: String(record.id) },
      uidEditeur: {
        email: record.relationUtilisateur?.ssoEmail ?? '~',
        value: record.relationUtilisateur?.ssoId ?? '~',
      },
      uidGouvernance: { value: record.gouvernanceDepartementCode },
      uidPorteur: record.porteurId ?? '~',
    })
    if (!(feuilleDeRoute instanceof FeuilleDeRoute)) {
      throw new Error(feuilleDeRoute)
    }
    return feuilleDeRoute
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async update(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? prisma
    const feuilleDeRouteResource = client.feuilleDeRouteRecord

    await feuilleDeRouteResource.update({
      data: {
        derniereEdition: feuilleDeRoute.state.dateDeModification,
        editeurUtilisateurId: feuilleDeRoute.state.uidEditeur,
        nom: feuilleDeRoute.state.nom,
        noteDeContextualisation: feuilleDeRoute.state.noteDeContextualisation ?? null,
        perimetreGeographique: feuilleDeRoute.state.perimetreGeographique,
        porteurId: feuilleDeRoute.state.uidPorteur,
      },
      where: {
        id: Number(feuilleDeRoute.state.uid.value),
      },
    })
  }
}
