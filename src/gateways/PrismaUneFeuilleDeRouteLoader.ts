import { Prisma } from '@prisma/client'

import { isEnveloppeDeFormation } from './shared/Action'
import { Membre, membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { UneFeuilleDeRouteLoader, UneFeuilleDeRouteReadModel } from '@/use-cases/queries/RecupererUneFeuilleDeRoute'
import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'

export class PrismaUneFeuilleDeRouteLoader implements UneFeuilleDeRouteLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord

  async get(uidFeuilleDeRoute: string): Promise<UneFeuilleDeRouteReadModel> {
    const feuilleDeRouteRecord = await this.#feuilleDeRouteDao.findUniqueOrThrow({
      include,
      where: {
        id: Number(uidFeuilleDeRoute),
      },
    })

    return transform(feuilleDeRouteRecord)
  }
}

function transform(
  feuilleDeRouteRecord: Prisma.FeuilleDeRouteRecordGetPayload<{ include: typeof include }>
): UneFeuilleDeRouteReadModel {
  const beneficiaires = new Set()
  const sommeDesCoFinancementsDesActions = feuilleDeRouteRecord.action.reduce(
    (coFinancement, action) => coFinancement + action.coFinancement.reduce(
      (montant, coFinancement) => montant + coFinancement.montant,
      0
    ),
    0
  )
  const sommeDesSubventionsAccepteesDesActions = feuilleDeRouteRecord.action
    .filter(
      (action) => action.demandesDeSubvention[0]?.statut === 'acceptee'
    )
    .reduce(
      (subventionAcceptee, action) => subventionAcceptee + action.demandesDeSubvention[0].subventionDemandee,
      0
    )
  const sommeDesCoFinanceursDesActions = feuilleDeRouteRecord.action.reduce(
    (coFinanceur, action) => coFinanceur + action.coFinancement.length,
    0
  )
  const sommeDesBudgetsGlobauxDesActions = feuilleDeRouteRecord.action.reduce(
    (budget, action) => budget + action.budgetGlobal,
    0
  )

  return {
    actions: feuilleDeRouteRecord.action.map((action) => {
      const demandeDeSubvention = action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined
      const sommeDesBeneficiaires = demandeDeSubvention && demandeDeSubvention.beneficiaire.reduce(
        (beneficiaires2, currentBeneficiaire) => {
          beneficiaires.add(currentBeneficiaire.membreId)

          return new Set([currentBeneficiaire.membreId, ...beneficiaires2])
        },
        new Set<string>()
      ).size
      const sommeDesCoFinancements = action.coFinancement.reduce(
        (montant, coFinancement) => montant + coFinancement.montant,
        0
      )
      const isEditable = !(demandeDeSubvention?.statut === 'acceptee' || demandeDeSubvention?.statut === 'refusee')
      const isEnveloppeFormation =
        (demandeDeSubvention && isEnveloppeDeFormation(demandeDeSubvention.enveloppe)) ?? false

      return {
        beneficiaire: sommeDesBeneficiaires ?? 0,
        besoins: action.besoins.map(besoin => besoin.split('_').join(' ')),
        budgetPrevisionnel: action.budgetGlobal,
        coFinancement: {
          financeur: action.coFinancement.length,
          montant: sommeDesCoFinancements,
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
    beneficiaire: beneficiaires.size,
    budgetTotalActions: sommeDesBudgetsGlobauxDesActions,
    coFinanceur: sommeDesCoFinanceursDesActions,
    contextualisation: !feuilleDeRouteRecord.noteDeContextualisation ? 'fff' : feuilleDeRouteRecord.noteDeContextualisation,
    document: feuilleDeRouteRecord.pieceJointe === null ? undefined : {
      chemin: feuilleDeRouteRecord.pieceJointe,
      nom: feuilleDeRouteRecord.pieceJointe.split('/').reverse()[0],
    },
    edition: {
      date: feuilleDeRouteRecord.creation,
      nom: '~',
      prenom: '~',
    },
    montantCofinancements: sommeDesCoFinancementsDesActions,
    montantFinancementsAccordes: sommeDesSubventionsAccepteesDesActions,
    nom: feuilleDeRouteRecord.nom,
    perimetre: 'Périmètre départemental',
    porteur: feuilleDeRouteRecord.relationMembre
      ? fromMembre(toMembre(feuilleDeRouteRecord.relationMembre))
      : undefined,
    uid: String(feuilleDeRouteRecord.id),
    uidGouvernance: feuilleDeRouteRecord.gouvernanceDepartementCode,
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
