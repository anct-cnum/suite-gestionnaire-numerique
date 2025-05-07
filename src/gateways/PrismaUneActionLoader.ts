import { Prisma } from '@prisma/client'

import {  membreInclude } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import {   UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'

export class PrismaUneActionLoader implements PrismaUneActionLoader {
  readonly #actionDao = prisma.actionRecord

  static  #transform(actionRecord: Prisma.ActionRecordGetPayload<{ include: typeof include }>): UneActionReadModel {
    const coFinancement = actionRecord.coFinancement.length > 0
      ? {
        financeur: actionRecord.coFinancement[0].membre.relationContact.nom || 'Inconnu',
        montant: actionRecord.coFinancement[0].montant,
      }
      : { financeur: '', montant: 0 }

    const enveloppe = actionRecord.demandesDeSubvention.length > 0
      ? {
        montant: actionRecord.demandesDeSubvention[0].enveloppe.montant,
      }
      : { montant: 0 }

    const porteurs = actionRecord.porteurAction .map(pa => ({
      id: pa.membre.id,
      nom: pa.membre.relationContact.nom || '',
    }))

    const beneficiaires = actionRecord.demandesDeSubvention.flatMap(ds =>
      ds.beneficiaire.map(beneficiaire => ({
        id: beneficiaire.membre.id,
        nom: beneficiaire.membre.relationContact.nom || '',
      })))

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
       
      statut: 'nonSubventionnee', //A FAIRE : à compléter => action n'a pas de statut. A priori soucis 
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

    return PrismaUneActionLoader.#transform(actionRecord)
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
