import { Prisma } from '@prisma/client'

import { isEnveloppeDeFormation } from './shared/Action'
import { Membre, membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { UneFeuilleDeRouteLoader, UneFeuilleDeRouteReadModel } from '@/use-cases/queries/RecupererUneFeuilleDeRoute'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'
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
              isFormation: isSubventionFormation(action),
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
      actions: feuilleDeRouteRecord.action.map((action, index) => {
        const demandeDeSubvention = action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined
        const statut = (demandeDeSubvention && demandeDeSubvention.statut as StatutSubvention) 
                  ?? 'nonSubventionnee'
        const isEditableEtModifiable = statut === StatutSubvention.DEPOSEE || statut === 'nonSubventionnee'
        return {
          beneficiaire: syntheseFeuilleDeRoute.actions[index].beneficiaires,
          besoins: action.besoins.map(besoin => besoin as BesoinsPossible),
          budgetPrevisionnel: action.budgetGlobal,
          coFinancement: {
            financeur: syntheseFeuilleDeRoute.actions[index].coFinanceurs,
            montant: syntheseFeuilleDeRoute.actions[index].coFinancement,
          },
          enveloppe: {
            libelle: demandeDeSubvention?.enveloppe.libelle ?? 'Aucune enveloppe',
            montant: syntheseFeuilleDeRoute.actions[index].financementDemande,
          },
          isEditable: isEditableEtModifiable,
          isEnveloppeFormation: isSubventionFormation(action),
          modifiable: isEditableEtModifiable,
          nom: action.nom,
          porteurs: action.porteurAction.map((porteur) => fromMembre(toMembre(porteur.membre))),
          statut,
          subventionDemandee: demandeDeSubvention?.subventionDemandee ?? 0,
          uid: String(action.id),
        }
      }),
      beneficiaire: syntheseFeuilleDeRoute.beneficiaires,
      budgetTotalActions: syntheseFeuilleDeRoute.budget,
      coFinanceur: syntheseFeuilleDeRoute.coFinanceurs,
      contextualisation: feuilleDeRouteRecord.noteDeContextualisation ?? undefined,
      document: feuilleDeRouteRecord.pieceJointe === null ? undefined : {
        chemin: feuilleDeRouteRecord.pieceJointe,
        nom: feuilleDeRouteRecord.pieceJointe.split('/').reverse()[0],
      },
      edition: {
        date: feuilleDeRouteRecord.derniereEdition ?? feuilleDeRouteRecord.creation,
        nom: feuilleDeRouteRecord.relationUtilisateur?.nom ?? '~',
        prenom: feuilleDeRouteRecord.relationUtilisateur?.prenom ?? '~',
      },
      montantCofinancements: syntheseFeuilleDeRoute.coFinancement,
      montantFinancementsAccordes: syntheseFeuilleDeRoute.financemenTotalAccorde,
      nom: feuilleDeRouteRecord.nom,
      perimetre: feuilleDeRouteRecord.perimetreGeographique ?? 'departemental',
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

function isSubventionFormation(action: Prisma.FeuilleDeRouteRecordGetPayload<{ include: typeof include }>['action'][number]): boolean {
  return Boolean(action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined)
    && isEnveloppeDeFormation(action.demandesDeSubvention[0].enveloppe)
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
  relationUtilisateur: true,
}
