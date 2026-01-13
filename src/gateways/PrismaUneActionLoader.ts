import { Prisma } from '@prisma/client'

import {  membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
// eslint-disable-next-line import/no-restricted-paths
import { membreLink } from '@/presenters/shared/link'
import {   UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'

export class PrismaUneActionLoader implements PrismaUneActionLoader {
  readonly #actionDao = prisma.actionRecord

  static  #transform(actionRecord: Prisma.ActionRecordGetPayload<{ include: typeof include }>,
    nomFeuilleDeRoute :string): UneActionReadModel {
    const coFinancements = actionRecord.coFinancement.map(cf => ({
      id: cf.membre.id,
      montant: cf.montant,
    }))

    const porteursAvecNom = actionRecord.porteurAction.map(pa => toMembre(pa.membre))

    const porteurs = porteursAvecNom.map(pa => ({
      id: pa.id,
      lien: membreLink(pa.structureId),
      nom: pa.nom,
    }))

    const destinatairesAvecNom = actionRecord.demandesDeSubvention.flatMap(ds =>
      ds.beneficiaire.map(beneficiaire => toMembre(beneficiaire.membre)))

    const destinataires = destinatairesAvecNom.map(pa => ({
      id: pa.id,
      lien: membreLink(pa.structureId),
      nom: pa.nom,
    }))

    return {
      anneeDeDebut: actionRecord.dateDeDebut.getFullYear().toString(),
      anneeDeFin: actionRecord.dateDeFin.getFullYear().toString(),
      besoins: actionRecord.besoins,
      budgetGlobal: actionRecord.budgetGlobal,
      coFinancements,
      contexte: actionRecord.contexte,
      demandeDeSubvention: actionRecord.demandesDeSubvention.length > 0 ? {
        beneficiaires: [],
        enveloppeFinancementId: String(actionRecord.demandesDeSubvention[0].enveloppe.id),
        statut: actionRecord.demandesDeSubvention[0].statut,
        subventionDemandee: actionRecord.demandesDeSubvention[0].subventionDemandee,
        subventionEtp: actionRecord.demandesDeSubvention[0].subventionEtp ?? 0,
        subventionPrestation: actionRecord.demandesDeSubvention[0].subventionPrestation ?? 0,
      } : undefined,
      description: actionRecord.description,
      destinataires,
      nom: actionRecord.nom,
      nomFeuilleDeRoute,
      porteurs,

      statut: 'nonSubventionnee' as StatutSubvention, //A FAIRE : à compléter => action n'a pas de statut. A priori soucis
      // comprenhension metier entre le statut de la subvention et le statut de l'action
      uid: String(actionRecord.id),
    }
  }

  async get(uidAction: string): Promise<UneActionReadModel> {
    const actionRecord = await this.#actionDao.findUniqueOrThrow({
      include,
      where: {
        id: Number(uidAction),
      },
    })
    const feuilleDeRoute = await prisma.feuilleDeRouteRecord.findUniqueOrThrow({
      where: {
        id: Number(actionRecord.feuilleDeRouteId),
      },
    })
    return PrismaUneActionLoader.#transform(actionRecord, feuilleDeRoute.nom)
  }
}

const include = {
  coFinancement: {
    include: {
      membre: {
        include: membreInclude,
      },
    },
  },
  demandesDeSubvention: {
    include: {
      beneficiaire: {
        include: {
          membre: {
            include: membreInclude,
          },
        },
      },
      enveloppe: true,
    },
  },
  porteurAction: {
    include: {
      membre: {
        include: membreInclude,
      },
    },
  },
}
