import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { FeuilleDeRouteRepository } from '@/use-cases/commands/shared/FeuilleDeRouteRepository'

export class PrismaFeuilleDeRouteRepository implements FeuilleDeRouteRepository {
  readonly #dataResource = prisma.feuilleDeRouteRecord

  async add(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? this.#dataResource

    await client.create({
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

  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    const record = await this.#dataResource.findUniqueOrThrow({
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

  async update(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.#dataResource

    await client.update({
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
