import { Prisma } from '@prisma/client'

import { documentDeFeuilleDeRoute } from './shared/FeuilleDeRouteDocument'
import { journaliserTransaction } from './shared/journalisationMin'
import prisma from '../../prisma/prismaClient'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { FeuilleDeRouteRepository } from '@/use-cases/commands/shared/FeuilleDeRouteRepository'

export class PrismaFeuilleDeRouteRepository implements FeuilleDeRouteRepository {
  async add(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<boolean> {
    if (tx) {
      return this.#add(feuilleDeRoute, tx)
    }
    return journaliserTransaction(prisma, async (transaction) => this.#add(feuilleDeRoute, transaction))
  }

  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    const record = await prisma.feuilleDeRouteRecord.findUniqueOrThrow({
      include: {
        documents: true,
        relationUtilisateur: true,
      },
      where: {
        id: Number(uid),
      },
    })

    const feuilleDeRoute = FeuilleDeRoute.create({
      dateDeCreation: record.creation,
      dateDeModification: record.derniereEdition ?? record.creation,
      document: documentDeFeuilleDeRoute(record),
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
    if (tx) {
      await this.#update(feuilleDeRoute, tx)
      return
    }
    await journaliserTransaction(prisma, async (transaction) => {
      await this.#update(feuilleDeRoute, transaction)
    })
  }

  async #add(feuilleDeRoute: FeuilleDeRoute, tx: Prisma.TransactionClient): Promise<boolean> {
    const record = await tx.feuilleDeRouteRecord.create({
      data: {
        creation: feuilleDeRoute.state.dateDeCreation,
        derniereEdition: feuilleDeRoute.state.dateDeModification,
        editeurUtilisateurId: feuilleDeRoute.state.uidEditeur,
        gouvernanceDepartementCode: feuilleDeRoute.state.uidGouvernance,
        nom: feuilleDeRoute.state.nom,
        noteDeContextualisation: feuilleDeRoute.state.noteDeContextualisation ?? null,
        perimetreGeographique: feuilleDeRoute.state.perimetreGeographique,
        porteurId: feuilleDeRoute.state.uidPorteur,
      },
    })
    await this.#synchroniserDocument(feuilleDeRoute, record.id, tx)

    return true
  }

  // La table feuille_de_route_document est la seule source du document (étape 4 de la
  // refonte : piece_jointe est décommissionnée).
  async #synchroniserDocument(
    feuilleDeRoute: FeuilleDeRoute,
    feuilleDeRouteId: number,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const document = feuilleDeRoute.state.document

    await tx.feuilleDeRouteDocumentRecord.deleteMany({
      where: {
        feuilleDeRouteId,
        ...(document ? { chemin: { not: document.chemin } } : {}),
      },
    })

    if (document) {
      const editeur = await tx.utilisateurRecord.findUniqueOrThrow({
        select: { id: true },
        where: { ssoId: feuilleDeRoute.state.uidEditeur },
      })
      await tx.feuilleDeRouteDocumentRecord.upsert({
        create: {
          chemin: document.chemin,
          creation: feuilleDeRoute.state.dateDeModification,
          editeurUtilisateurId: editeur.id,
          feuilleDeRouteId,
          nom: document.nom,
        },
        update: {
          nom: document.nom,
        },
        where: {
          chemin: document.chemin,
        },
      })
    }
  }

  async #update(feuilleDeRoute: FeuilleDeRoute, tx: Prisma.TransactionClient): Promise<void> {
    await tx.feuilleDeRouteRecord.update({
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
    await this.#synchroniserDocument(feuilleDeRoute, Number(feuilleDeRoute.state.uid.value), tx)
  }
}
