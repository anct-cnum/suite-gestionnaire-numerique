
import { Prisma } from '@prisma/client'

import {  membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import {  UneActionLoader, UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'
import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'

export class PrismaUneActionLoader implements UneActionLoader {
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
    const demandeDeSubvention = actionRecord.demandesDeSubvention[0]
    const isEditable = !(demandeDeSubvention.statut === 'acceptee' || demandeDeSubvention.statut === 'refusee')
    return {
      beneficiaire: actionRecord.beneficiaires,
      besoins: actionRecord.besoins.map(besoin => besoin.split('_').join(' ')),
      budgetPrevisionnel: actionRecord.budgetGlobal,
      coFinancement: {
        financeur: actionRecord.coFinanceurs,
        montant: actionRecord.coFinancement,
      },
      enveloppe: {
        libelle: demandeDeSubvention.enveloppe.libelle ?? 'Aucune enveloppe',
        montant: actionRecord.financementDemande,
      },
      isEditable,
      isEnveloppeFormation: isSubventionFormation(action),
      nom: action.nom,
      porteurs: action.porteurAction.map((porteur) => fromMembre(toMembre(porteur.membre))),
      statut: (demandeDeSubvention && demandeDeSubvention.statut as StatutSubvention) ?? 'enCours',
      uid: String(action.id),
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
// const include = {
//   action: {
//     include: {
//       coFinancement: {
//         include: {
//           membre: {
//             include: membreInclude,
//           },
//         },
//       },
//       demandesDeSubvention: {
//         include: {
//           beneficiaire: {
//             include: {
//               membre: {
//                 include: membreInclude,
//               },
//             },
//           },
//           enveloppe: true,
//         },
//       },
//       porteurAction: {
//         include: {
//           membre: {
//             include: membreInclude,
//           },
//         },
//       },
//     },
//   },
//   relationMembre: {
//     include: membreInclude,
//   },
// }