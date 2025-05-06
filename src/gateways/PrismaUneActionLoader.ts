import { Prisma } from '@prisma/client'

import {  membreInclude } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import {   UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'

export class PrismaUneActionLoader implements PrismaUneActionLoader {
  readonly #actionDao = prisma.actionRecord

  async get(uidAction: string): Promise<UneActionReadModel> {
    const actionRecord = await this.#actionDao.findUniqueOrThrow({
      include,
      where: {
        id: Number(uidAction),
      },
    })

    return this.#transform(actionRecord)
  }

  #transform(actionRecord: Prisma.ActionRecordGetPayload<{ include: typeof include }>): UneActionReadModel {
    const coFinancement = actionRecord.coFinancement[0]
      ? {
        financeur: actionRecord.coFinancement[0].membre.relationContact.nom ?? 'Inconnu',
        montant: actionRecord.coFinancement[0].montant,
      }
      : { financeur: '', montant: 0 }

    const enveloppe = actionRecord.demandesDeSubvention[0]?.enveloppe
      ? {
        montant: actionRecord.demandesDeSubvention[0].enveloppe.montant,
      }
      : { montant: 0 }

    const porteurs = (actionRecord.porteurAction ?? []).map(pa => ({
      id: pa.membre.id,
      nom: pa.membre.relationContact.nom ?? '',
    }))

    const beneficiaires = actionRecord.demandesDeSubvention.flatMap(ds =>
      ds.beneficiaire.map(b => ({
        id: b.membre.id,
        nom: b.membre.relationContact.nom ?? '',
      }))) ?? []

    return {
      anneeDeDebut: actionRecord.dateDeDebut.getFullYear().toString(),
      anneeDeFin: actionRecord.dateDeFin.getFullYear().toString(),
      beneficiaires,
      besoins: actionRecord.besoins,
      budgetGlobal: actionRecord.budgetGlobal,
      budgetPrevisionnel: actionRecord.coFinancement.map(cf => ({
        coFinanceur: cf.membre.relationContact.nom,
        montant: cf.montant,
      })),
      coFinancement,
      contexte: actionRecord.contexte,
      description: actionRecord.description,
      enveloppe,
      nom: actionRecord.nom,
      porteurs,
      statut: actionRecord.statut as StatusSubvention,
      uid: String(actionRecord.id),
    }
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
