import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { TypeDeComite, UneGouvernanceReadModel, UneGouvernanceLoader } from '@/use-cases/queries/RecupererUneGouvernance'

type GouvernanceWithNoteDeContexte = Prisma.GouvernanceRecordGetPayload<{
  include: {
    comites: {
      include: {
        relationUtilisateur: true
      }
    }
    relationDepartement: {
      select: {
        code: true
        nom: true
      }
    }
    relationEditeurNotePrivee: true
    relationEditeurNoteDeContexte: true
    feuillesDeRoute: true
    membresCommunes: true
    membresDepartements: true
    membresEpcis: true
    membresSgars: true
    membresStructures: true
  }
}>

export class PrismaGouvernanceLoader implements UneGouvernanceLoader {
  readonly #dataResource: Prisma.GouvernanceRecordDelegate

  constructor(dataResource: Prisma.GouvernanceRecordDelegate) {
    this.#dataResource = dataResource
  }

  async get(codeDepartement: string): Promise<UneGouvernanceReadModel> {
    const gouvernanceRecord = await this.#dataResource.findFirst({
      include: {
        comites: {
          include: {
            relationUtilisateur: true,
          },
        },
        feuillesDeRoute: true,
        membresCommunes: true,
        membresDepartements: true,
        membresEpcis: true,
        membresSgars: true,
        membresStructures: true,
        relationDepartement: true,
        relationEditeurNoteDeContexte: true,
        relationEditeurNotePrivee: true,
      },
      where: {
        departementCode: codeDepartement,
      },
    })
    if (gouvernanceRecord === null) {
      throw new Error('Le département n’existe pas')
    }

    const membres: ReadonlyArray<Readonly<AggregatedMembre>> = await prisma.$queryRaw`
    SELECT commune as nom, type, 'commune' as typologie, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_commune
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY commune, type
    HAVING COUNT(CASE WHEN role = 'coporteur' THEN 1 END) > 0
    UNION all

    SELECT epci as nom, type, 'epci' as typologie, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_epci
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY epci, type
    HAVING COUNT(CASE WHEN role = 'coporteur' THEN 1 END) > 0
    UNION all

    SELECT structure as nom, type,'structure' as typologie, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_structure
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY structure, type
    HAVING COUNT(CASE WHEN role = 'coporteur' THEN 1 END) > 0
    UNION all

    SELECT departement.nom as nom, mgd.type,'departement' as typologie, ARRAY_AGG(mgd.role) AS roles
    FROM membre_gouvernance_departement mgd
    INNER JOIN departement
    ON mgd."departementCode" = departement.code
    WHERE mgd."gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY departement.nom, mgd.type
    HAVING COUNT(CASE WHEN mgd.role = 'coporteur' THEN 1 END) > 0
    UNION ALL

    SELECT region.nom as nom, mgs.type, 'sgar' as typologie, ARRAY_AGG(mgs.role) AS roles
    FROM membre_gouvernance_sgar mgs
    INNER JOIN region
    ON mgs."sgarCode" = region.code
    WHERE mgs."gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY region.nom, mgs.type
    HAVING COUNT(CASE WHEN mgs.role = 'coporteur' THEN 1 END) > 0

    ORDER BY nom`

    return transform(gouvernanceRecord, membres)
  }
}

function transform(
  gouvernanceRecord: GouvernanceWithNoteDeContexte,
  membres: ReadonlyArray<AggregatedMembre>
): UneGouvernanceReadModel {
  const noteDeContexte =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    gouvernanceRecord.noteDeContexte &&
    gouvernanceRecord.relationEditeurNoteDeContexte &&
    gouvernanceRecord.derniereEditionNoteDeContexte
      ? {
        dateDeModification: new Date(gouvernanceRecord.derniereEditionNoteDeContexte),
        nomAuteur: gouvernanceRecord.relationEditeurNoteDeContexte.nom,
        prenomAuteur: gouvernanceRecord.relationEditeurNoteDeContexte.prenom,
        texte: gouvernanceRecord.noteDeContexte,
      } : undefined
  const notePrivee = gouvernanceRecord.notePrivee && gouvernanceRecord.relationEditeurNotePrivee ? {
    dateDEdition: new Date(gouvernanceRecord.notePrivee.derniereEdition),
    nomEditeur: gouvernanceRecord.relationEditeurNotePrivee.nom,
    prenomEditeur: gouvernanceRecord.relationEditeurNotePrivee.prenom,
    texte: gouvernanceRecord.notePrivee.contenu,
  } : undefined
  const comites = gouvernanceRecord.comites.length > 0
    ? gouvernanceRecord.comites.map((comite) => ({
      commentaire: comite.commentaire ?? '',
      date: comite.date ?? undefined,
      derniereEdition: comite.derniereEdition,
      frequence: comite.frequence,
      id: comite.id,
      nomEditeur: comite.relationUtilisateur?.nom ?? '~',
      prenomEditeur: comite.relationUtilisateur?.prenom ?? '~',
      type: comite.type as TypeDeComite,
    }))
    : undefined

  return {
    comites,
    coporteurs: membres.map((membre) => ({
      contactReferent: {
        denomination: 'Contact politique de la collectivité',
        mailContact: 'julien.deschamps@example.com',
        nom: 'Henrich',
        poste: 'chargé de mission',
        prenom: 'Laetitia',
      },
      contactTechnique: 'Simon.lagrange@example.com',
      feuillesDeRoute: [
        {
          montantSubventionAccorde: 5_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion',
        },
        {
          montantSubventionAccorde: 5_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route numérique du Rhône',
        },
      ],
      links: {},
      nom: membre.nom,
      roles: membre.roles.toSorted((lRole, rRole) => lRole.localeCompare(rRole)),
      telephone: '+33 4 45 00 45 00',
      totalMontantSubventionAccorde: NaN,
      totalMontantSubventionFormationAccorde: NaN,
      type: membre.type,
      typologieMembre: membre.typologie,
    })),
    departement: gouvernanceRecord.relationDepartement.nom,
    feuillesDeRoute: gouvernanceRecord.feuillesDeRoute.map((feuilleDeRoute) => ({
      beneficiairesSubvention: [
        {
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          type: 'Structure',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['coporteur'],
          type: 'Structure',
        },
      ],
      beneficiairesSubventionFormation: [
        {
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          type: 'Structure',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['coporteur'],
          type: 'Structure',
        },
      ],
      budgetGlobal: 145_000,
      montantSubventionAccorde: 5_000,
      montantSubventionDemande: 40_000,
      montantSubventionFormationAccorde: 5_000,
      nom: feuilleDeRoute.nom,
      porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
      totalActions: 3,
    })),
    noteDeContexte,
    notePrivee,
    uid: gouvernanceRecord.departementCode,
  }
}

type AggregatedMembre = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
  typologie: string
}>
