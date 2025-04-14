import prisma from '../../prisma/prismaClient'
import { FeuilleDeRoute, FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'
import { FeuilleDeRouteRepository } from '@/use-cases/commands/shared/FeuilleDeRouteRepository'

export class PrismaFeuilleDeRouteRepository implements FeuilleDeRouteRepository {
  readonly #dataResource = prisma.feuilleDeRouteRecord

  async add(feuilleDeRoute: FeuilleDeRoute): Promise<boolean> {
    await this.#dataResource.create({
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

  async get(uid: FeuilleDeRouteUid): Promise<FeuilleDeRoute> {
    const record = await this.#dataResource.findUniqueOrThrow({
      include: {
        relationUtilisateur: true,
      },
      where: {
        id: Number(uid.state.value),
      },
    })

    const feuilleDeRoute = FeuilleDeRoute.create({
      dateDeCreation: record.creation,
      dateDeModification: record.derniereEdition ??  record.creation,
      nom: record.nom,
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

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    await this.#dataResource.update({
      data: {
        derniereEdition: feuilleDeRoute.state.noteDeContextualisation?.dateDeModification,
        editeurUtilisateurId: feuilleDeRoute.state.noteDeContextualisation?.uidEditeur,
        noteDeContextualisation: feuilleDeRoute.state.noteDeContextualisation?.value,
      },
      where: {
        id: Number(feuilleDeRoute.state.uid.value),
      },
    })
  }
}
