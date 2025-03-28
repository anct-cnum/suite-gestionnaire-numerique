import { Prisma } from '@prisma/client'

import { Membre, membreInclude, toMembre, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { alphaAsc } from '@/shared/lang'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel, StatutSubvention } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export class PrismaLesFeuillesDeRouteLoader implements FeuillesDeRouteLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord
  readonly #membreDao = prisma.membreRecord

  async feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
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
    return transform(feuillesDeRouteRecord, membreConfirmesGouvernance, codeDepartement )
  }
}

function transform(
  feuillesDeRouteRecord: ReadonlyArray<Prisma.FeuilleDeRouteRecordGetPayload<{ include: typeof include }>>,
  membresConfirmesGouvernance: ReadonlyArray<Prisma.MembreRecordGetPayload<{ include: typeof membreInclude }>>,
  codeDepartement: string

): FeuillesDeRouteReadModel {
  return {
    feuillesDeRoute: feuillesDeRouteRecord.map((feuilleDeRouteRecord) => ({
      actions: feuilleDeRouteRecord.action.map((action) => {
        const demandeDeSubvention =
          action.demandesDeSubvention[0] as typeof action.demandesDeSubvention[number] | undefined
        return {
          beneficiaires: demandeDeSubvention?.beneficiaire.map(({ membre }) => fromMembre(toMembre(membre))) ?? [],
          besoins: action.besoins,
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
            coFinancement: 0,
            financementAccorde: 0,
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
        budget: 0,
        coFinancement: 0,
        financementAccorde: 0,
      },
      uid: String(feuilleDeRouteRecord.id),
    })),
    porteursPotentielsNouvellesFeuillesDeRouteOuActions: toMembres(membresConfirmesGouvernance)
      .toSorted(alphaAsc('id'))
      .toSorted(alphaAsc('nom'))
      .map(fromMembreAvecRoles),
    totaux: {
      budget: 0,
      coFinancement: 0,
      financementAccorde: 0,
    },
    uidGouvernance: codeDepartement,
  }
}

function fromMembre(
  { id, nom }: Membre
): NonNullable<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['structureCoPorteuse']> {
  return { nom, uid: id }
}

function fromMembreAvecRoles(
  { id, nom, roles  }: Membre
): FeuillesDeRouteReadModel['porteursPotentielsNouvellesFeuillesDeRouteOuActions'][number] {
  return { nom, roles, uid: id }
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
