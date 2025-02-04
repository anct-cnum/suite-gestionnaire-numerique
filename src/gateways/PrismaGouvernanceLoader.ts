import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { TypeDeComite, UneGouvernanceReadModel, UneGouvernanceReadModelLoader } from '@/use-cases/queries/RecupererUneGouvernance'

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
    relationEditeurNotesDeContexte: true
    feuillesDeRoute: true
    membresCommunes: true
    membresDepartements: true
    membresEpcis: true
    membresSgars: true
    membresStructures: true
  }
}>

export class PrismaGouvernanceLoader extends UneGouvernanceReadModelLoader {
  readonly #dataResource: Prisma.GouvernanceRecordDelegate

  constructor(dataResource: Prisma.GouvernanceRecordDelegate) {
    super()
    this.#dataResource = dataResource
  }

  protected override async gouvernance(codeDepartement: string): Promise<UneGouvernanceReadModel> {
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
        relationEditeurNotePrivee: true,
        relationEditeurNotesDeContexte: true,
      },
      where: {
        departementCode: codeDepartement,
      },
    })
    if (gouvernanceRecord === null) {
      throw new Error('Le département n’existe pas')
    }

    const membres = (await prisma.$queryRaw`
    SELECT commune as nom, type, 'commune' as typologie, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_commune where "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY commune, type
    UNION all

    SELECT epci as nom, type, 'epci' as typologie, ARRAY_AGG(role) AS role
    FROM membre_gouvernance_epci
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY epci, type
    UNION all

    SELECT structure as nom, type,'structure' as typologie, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_structure
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY structure, type
    UNION all

    SELECT departement.nom as nom, mgd.type,'departement' as typologie, ARRAY_AGG(mgd.role) AS roles
    FROM membre_gouvernance_departement mgd
    INNER JOIN departement
    ON mgd."departementCode" = departement.code
    WHERE mgd."gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY departement.nom, mgd.type
    UNION ALL

    SELECT region.nom as nom, mgs.type, 'sgar' as typologie, ARRAY_AGG(mgs.role) AS roles
    FROM membre_gouvernance_sgar mgs
    INNER JOIN region
    ON mgs."sgarCode" = region.code
    WHERE mgs."gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY region.nom, mgs.type

    ORDER BY nom;`) as ReadonlyArray<Readonly<AggregatedMembre>>

    return transform(gouvernanceRecord, membres)
  }
}

function transform(
  gouvernanceRecord: GouvernanceWithNoteDeContexte,
  membres: ReadonlyArray<AggregatedMembre>
): UneGouvernanceReadModel {
  const noteDeContexte = Boolean(gouvernanceRecord.notesDeContexte) &&
    gouvernanceRecord.relationEditeurNotesDeContexte &&
    gouvernanceRecord.derniereEditionNoteDeContexte ? {
      dateDeModification: gouvernanceRecord.derniereEditionNoteDeContexte,
      nomAuteur: gouvernanceRecord.relationEditeurNotesDeContexte.nom,
      prenomAuteur: gouvernanceRecord.relationEditeurNotesDeContexte.prenom,
      texte: gouvernanceRecord.notesDeContexte ?? '',
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
      periodicite: comite.frequence,
      prenomEditeur: comite.relationUtilisateur?.prenom ?? '~',
      type: comite.type as TypeDeComite,
    }))
    : undefined

  return {
    comites,
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
      porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
      totalActions: 3,
    })),
    membres: membres.map((membre) => ({
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
