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
    membres: {
      include: {
        membresGouvernanceCommune: true
        membresGouvernanceDepartement: true
        membresGouvernanceEpci: true
        membresGouvernanceSgar: true
        membresGouvernanceStructure: true
      }
    }
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
        membres: {
          include: {
            membresGouvernanceCommune: true,
            membresGouvernanceDepartement: true,
            membresGouvernanceEpci: true,
            membresGouvernanceSgar: true,
            membresGouvernanceStructure: true,
          },
        },
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

    const membres: ReadonlyArray<AggregatedMembre> = await prisma.$queryRaw`
    SELECT mgc.commune AS nom, m.type, ARRAY_AGG(mgc.role) AS roles
    FROM membre_gouvernance_commune mgc
    INNER JOIN membre m ON m.id = mgc."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartement}
    AND mgc."membreGouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY mgc.commune, m.type
    HAVING COUNT(CASE WHEN mgc.role = 'coporteur' THEN 1 END) > 0

    UNION ALL

    SELECT mge.epci AS nom, m.type, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_epci mge
    INNER JOIN membre m ON m.id = mge."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartement}
    AND mge."membreGouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY mge.epci, m.type
    HAVING COUNT(CASE WHEN mge.role = 'coporteur' THEN 1 END) > 0

    UNION ALL

    SELECT mgs.structure AS nom, m.type, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_structure mgs
    INNER JOIN membre m ON m.id = mgs."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartement}
    AND mgs."membreGouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY mgs.structure, m.type
    HAVING COUNT(CASE WHEN mgs.role = 'coporteur' THEN 1 END) > 0

    UNION ALL

    SELECT d.nom AS nom, m.type, ARRAY_AGG(mgd.role) AS roles
    FROM membre_gouvernance_departement mgd
    INNER JOIN departement d ON mgd."departementCode" = d.code
    INNER JOIN membre m ON m.id = mgd."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartement}
    AND mgd."membreGouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY d.nom, m.type
    HAVING COUNT(CASE WHEN mgd.role = 'coporteur' THEN 1 END) > 0

    UNION ALL

    SELECT r.nom AS nom, m.type, ARRAY_AGG(mgr.role) AS roles
    FROM membre_gouvernance_sgar mgr
    INNER JOIN region r ON mgr."sgarCode" = r.code
    INNER JOIN membre m ON m.id = mgr."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartement}
    AND mgr."membreGouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY r.nom, m.type
    HAVING COUNT(CASE WHEN mgr.role = 'coporteur' THEN 1 END) > 0

    ORDER BY nom;`

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
}>
