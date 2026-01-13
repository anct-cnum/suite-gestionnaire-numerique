import { Prisma } from '@prisma/client'

import { isEnveloppeDeFormation } from './shared/Action'
import { Membre, membreInclude, toMembre, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { alphaAsc } from '@/shared/lang'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'
import { EtablisseurSyntheseGouvernance } from '@/use-cases/services/shared/etablisseur-synthese-gouvernance'

export class PrismaLesFeuillesDeRouteLoader implements FeuillesDeRouteLoader {
  readonly #etablisseurSynthese: EtablisseurSyntheseGouvernance
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord
  readonly #membreDao = prisma.membreRecord

  constructor(etablisseurSynthese: EtablisseurSyntheseGouvernance) {
    this.#etablisseurSynthese = etablisseurSynthese
  }

  async get(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
    const membreConfirmesGouvernance = await this.#membreDao.findMany({
      include: membreInclude,
      where: {
        AND: [
          {
            statut: {
              equals: 'confirme',
            },
          },
          {
            gouvernanceDepartementCode: codeDepartement,
          },
        ],
      },
    })
    const feuillesDeRouteRecord = await this.#feuilleDeRouteDao.findMany({
      include,
      orderBy: {
        creation: 'desc',
      },
      where: {
        gouvernanceDepartementCode: codeDepartement,
      },
    })
    return this.#transform(feuillesDeRouteRecord, membreConfirmesGouvernance, codeDepartement)
  }

  #transform(
    feuillesDeRouteRecord: ReadonlyArray<Prisma.FeuilleDeRouteRecordGetPayload<{ include: typeof include }>>,
    membresConfirmesGouvernance: ReadonlyArray<Prisma.MembreRecordGetPayload<{ include: typeof membreInclude }>>,
    codeDepartement: string
  ): FeuillesDeRouteReadModel {
    const synthese = this.#etablisseurSynthese({
      feuillesDeRoute: feuillesDeRouteRecord.map(feuilleDeRoute => ({
        actions: feuilleDeRoute.action.map(action => {
          const demandeDeSubvention =
            action.demandesDeSubvention[0] as typeof action.demandesDeSubvention[number] | undefined
          return {
            beneficiaires: demandeDeSubvention?.beneficiaire.map(({ membre }) => fromMembre(toMembre(membre))) ?? [],
            budgetGlobal: action.budgetGlobal,
            coFinancements: action.coFinancement.map(({ membre, montant }) => ({
              coFinanceur: fromMembre(toMembre(membre)),
              montant,
            })),
            subvention: demandeDeSubvention ? {
              isFormation: isEnveloppeDeFormation(demandeDeSubvention.enveloppe),
              montants: {
                prestation: demandeDeSubvention.subventionPrestation ?? 0,
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                ressourcesHumaines: demandeDeSubvention?.subventionEtp ?? 0,
              },
              statut: demandeDeSubvention.statut as StatutSubvention,
            } : undefined,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            uid: `${action?.id ?? 'ID inconnu'}`,
          }
        }),
        uid: `${feuilleDeRoute.id}`,
      })),
    })
    return {
      feuillesDeRoute: feuillesDeRouteRecord.map((feuilleDeRouteRecord, indexDeuilleDeRoute) => ({
        actions: feuilleDeRouteRecord.action.map((action, indexAction) => {
          const demandeDeSubvention =
            action.demandesDeSubvention[0] as typeof action.demandesDeSubvention[number] | undefined
          const syntheseAction = synthese.feuillesDeRoute[indexDeuilleDeRoute].actions[indexAction]
          return {
            beneficiaires: demandeDeSubvention?.beneficiaire.map(({ membre }) => fromMembre(toMembre(membre))) ?? [],
            besoins: action.besoins.map(besoin => besoin as BesoinsPossible),
            budgetGlobal: action.budgetGlobal,
            coFinancements: action.coFinancement.map(({ membre, montant }) => ({
              coFinanceur: fromMembre(toMembre(membre)),
              montant,
            })),
            contexte: action.contexte,
            description: action.description,
            nom: action.nom,
            porteurs: toMembres(action.porteurAction.map(({ membre }) => membre)).map(fromMembre),
            subvention: demandeDeSubvention ? {
              enveloppe: demandeDeSubvention.enveloppe.libelle,
              montants: {
                prestation: demandeDeSubvention.subventionPrestation ?? 0,
                ressourcesHumaines: demandeDeSubvention.subventionEtp ?? 0,
              },
              statut: demandeDeSubvention.statut as StatutSubvention,
            } : undefined,
            totaux: {
              coFinancement: syntheseAction.coFinancement,
              financementAccorde: syntheseAction.financemenTotalAccorde,
            },
            uid: String(action.id),
          }
        }),
        beneficiaires: 0,
        coFinanceurs: 0,
        nom: feuilleDeRouteRecord.nom,
        ...Boolean(feuilleDeRouteRecord.pieceJointe) && {
          pieceJointe: {
            apercu: '',
            emplacement: '',
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            nom: feuilleDeRouteRecord.pieceJointe!,
          },
        },
        structureCoPorteuse: feuilleDeRouteRecord.relationMembre
          ? fromMembre(toMembre(feuilleDeRouteRecord.relationMembre))
          : undefined,
        totaux: {
          budget: synthese.feuillesDeRoute[indexDeuilleDeRoute].budget,
          coFinancement: synthese.feuillesDeRoute[indexDeuilleDeRoute].coFinancement,
          financementAccorde: synthese.feuillesDeRoute[indexDeuilleDeRoute].financemenTotalAccorde,
        },
        uid: String(feuilleDeRouteRecord.id),
      })),
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: toMembres(membresConfirmesGouvernance)
        .toSorted(alphaAsc('id'))
        .toSorted(alphaAsc('nom'))
        .map(fromMembreAvecRoles),
      totaux: {
        budget: synthese.budget,
        coFinancement: synthese.coFinancement,
        financementAccorde: synthese.financemenTotalAccorde,
      },
      uidGouvernance: codeDepartement,
    }
  }
}

function fromMembre(
  { id, nom, structureId }: Membre
): NonNullable<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['structureCoPorteuse']> {
  return { nom, structureId, uid: id }
}

function fromMembreAvecRoles(
  { id, nom, roles, structureId }: Membre
): FeuillesDeRouteReadModel['porteursPotentielsNouvellesFeuillesDeRouteOuActions'][number] {
  return { nom, roles, structureId, uid: id }
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
