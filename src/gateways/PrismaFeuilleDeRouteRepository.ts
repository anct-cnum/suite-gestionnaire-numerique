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
    console.log('uid: >>>>>>>>>>>>>>>>>>', uid.state);
    const feuilleDeRoute = await this.#dataResource.findUniqueOrThrow({
      include: {
        relationGouvernance: true
      },
      where: {
        id: Number(uid.state.value)
      }
    })

    if ((feuilleDeRoute instanceof FeuilleDeRoute)) {
      throw new Error(`${feuilleDeRoute}`)
    }

    return FeuilleDeRoute.create({
      dateDeCreation: feuilleDeRoute.creation,
      // dateCreation: feuilleDeRoute.creation,
      // ...feuilleDeRoute.derniereEdition && { dateDeModification: feuilleDeRoute.derniereEdition },
      nom: feuilleDeRoute.nom,
      // ...feuilleDeRoute.noteDeContextualisation && { noteDeContextualisation: feuilleDeRoute.noteDeContextualisation },
      // ...feuilleDeRoute.perimetreGeographique && {perimetreGeographique: feuilleDeRoute.perimetreGeographique},
      // uid: { value: String(feuilleDeRoute.id) },
      // uidEditeur: feuilleDeRoute.editeurUtilisateurId,
      // uidGouvernance: feuilleDeRoute.relationGouvernance.departementCode,
      // uidPorteur: feuilleDeRoute.porteurId,
    })
  }
  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    await this.#dataResource.update({
      data: {
        derniereEdition: feuilleDeRoute.state.noteDeContextualisation?.dateDeModification,
        editeurUtilisateurId: feuilleDeRoute.state.noteDeContextualisation?.uidEditeur,
        noteDeContextualisation: feuilleDeRoute.state.noteDeContextualisation?.value,
      },
      where: {
        id: Number(feuilleDeRoute.state.uid.value)
      }
    })
  }
}
