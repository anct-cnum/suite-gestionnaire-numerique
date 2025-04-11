import { Prisma } from '@prisma/client'

import { isEnveloppeDeFormation } from './shared/Action'
import { Membre, membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { UneFeuilleDeRouteLoader, UneFeuilleDeRouteReadModel } from '@/use-cases/queries/RecupererUneFeuilleDeRoute'
import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'
import { EtablisseurSyntheseGouvernance } from '@/use-cases/services/shared/etablisseur-synthese-gouvernance'

export class PrismaUneFeuilleDeRouteLoader implements UneFeuilleDeRouteLoader {
  readonly #etablisseurSynthese: EtablisseurSyntheseGouvernance
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord

  constructor(etablisseurSynthese: EtablisseurSyntheseGouvernance) {
    this.#etablisseurSynthese = etablisseurSynthese
  }

  async get(uidFeuilleDeRoute: string): Promise<UneFeuilleDeRouteReadModel> {
    const feuilleDeRouteRecord = await this.#feuilleDeRouteDao.findUniqueOrThrow({
      include,
      where: {
        id: Number(uidFeuilleDeRoute),
      },
    })

    return this.#transform(feuilleDeRouteRecord)
  }

  #transform(
    feuilleDeRouteRecord: Prisma.FeuilleDeRouteRecordGetPayload<{ include: typeof include }>
  ): UneFeuilleDeRouteReadModel {
    const syntheseFeuilleDeRoute = this.#etablisseurSynthese({
      feuillesDeRoute: [{
        actions: feuilleDeRouteRecord.action.map(action => {
          const demandeDeSubvention = action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined
          return {
            beneficiaires: demandeDeSubvention?.beneficiaire.map(({ membre }) => fromMembre(toMembre(membre))) ?? [],
            budgetGlobal: action.budgetGlobal,
            coFinancements: action.coFinancement.map(({ membre, montant }) => ({
              coFinanceur: fromMembre(toMembre(membre)),
              montant,
            })),
            subvention: demandeDeSubvention ? {
              enveloppe: demandeDeSubvention.enveloppe.libelle,
              montants: {
                prestation: demandeDeSubvention.subventionPrestation ?? 0,
                ressourcesHumaines: demandeDeSubvention.subventionEtp ?? 0,
              },
              statut: demandeDeSubvention.statut as StatutSubvention,
            } : undefined,
            uid: `${action.id}`,
          }
        }),
        uid: `${feuilleDeRouteRecord.id}`,
      }],
    }).feuillesDeRoute[0]
    return {
      actions: feuilleDeRouteRecord.action.map((action, i) => {
        const demandeDeSubvention = action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined
        const isEditable = !(demandeDeSubvention?.statut === 'acceptee' || demandeDeSubvention?.statut === 'refusee')
        const isEnveloppeFormation =
          (demandeDeSubvention && isEnveloppeDeFormation(demandeDeSubvention.enveloppe)) ?? false
        return {
          beneficiaire: syntheseFeuilleDeRoute.actions[i].beneficiaires,
          besoins: action.besoins.map(besoin => besoin.split('_').join(' ')),
          budgetPrevisionnel: action.budgetGlobal,
          coFinancement: {
            financeur: syntheseFeuilleDeRoute.actions[i].coFinanceurs,
            montant: syntheseFeuilleDeRoute.actions[i].coFinancement,
          },
          enveloppe: {
            libelle: demandeDeSubvention?.enveloppe.libelle ?? 'Aucune enveloppe',
            montant: demandeDeSubvention?.enveloppe.montant ?? 0,
          },
          isEditable,
          isEnveloppeFormation,
          nom: action.nom,
          porteurs: action.porteurAction.map((porteur) => fromMembre(toMembre(porteur.membre))),
          statut: (demandeDeSubvention && demandeDeSubvention.statut as StatutSubvention) ?? 'enCours',
          uid: String(action.id),
        }
      }),
      beneficiaire: syntheseFeuilleDeRoute.beneficiaires,
      budgetTotalActions: syntheseFeuilleDeRoute.budget,
      coFinanceur: syntheseFeuilleDeRoute.coFinanceurs,
      contextualisation: '<p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p>',
      document: feuilleDeRouteRecord.pieceJointe === null ? undefined : {
        chemin: feuilleDeRouteRecord.pieceJointe,
        nom: feuilleDeRouteRecord.pieceJointe.split('/').reverse()[0],
      },
      edition: {
        date: feuilleDeRouteRecord.creation,
        nom: '~',
        prenom: '~',
      },
      montantCofinancements: syntheseFeuilleDeRoute.coFinancement,
      montantFinancementsAccordes: syntheseFeuilleDeRoute.financementAccorde,
      nom: feuilleDeRouteRecord.nom,
      perimetre: 'Périmètre départemental',
      porteur: feuilleDeRouteRecord.relationMembre
        ? fromMembre(toMembre(feuilleDeRouteRecord.relationMembre))
        : undefined,
      uid: String(feuilleDeRouteRecord.id),
      uidGouvernance: feuilleDeRouteRecord.gouvernanceDepartementCode,
    }
  }
}

function fromMembre({ id, nom }: Membre): NonNullable<UneFeuilleDeRouteReadModel['porteur']> {
  return { nom, uid: id }
}

const include = {
  action: {
    include: {
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
    },
  },
  relationMembre: {
    include: membreInclude,
  },
}
