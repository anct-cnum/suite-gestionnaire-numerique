import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { TypeDeComite, UneGouvernanceReadModel, UneGouvernanceReadModelLoader } from '@/use-cases/queries/RecupererUneGouvernance'

type GouvernanceWithNoteDeContexte = Prisma.GouvernanceRecordGetPayload<{
  include: {
    noteDeContexte: {
      select: {
        gouvernanceDepartementCode: true
        derniereEdition: true
        relationUtilisateur: true
        contenu: true
      }
    }
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

  protected override async find(codeDepartement: string): Promise<UneGouvernanceReadModel> {
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
        noteDeContexte: {
          include: {
            relationUtilisateur: true,
          },
        },
        relationDepartement: true,
        relationEditeurNotePrivee: true,
      },
      where: {
        departementCode: codeDepartement,
      },
    })
    if (gouvernanceRecord === null) {
      throw new Error('Le département n’existe pas')
    }

    const membres = (await prisma.$queryRaw`
    SELECT commune as nom, 'commune' as type, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_commune where "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY commune
    UNION all

    SELECT epci as nom, 'epci' as type, ARRAY_AGG(role) AS role
    FROM membre_gouvernance_epci
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY epci
    UNION all

    SELECT structure as nom, 'structure' as type, ARRAY_AGG(role) AS roles
    FROM membre_gouvernance_structure
    WHERE "gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY structure
    UNION all

    SELECT departement.nom as nom, 'departement' as type, ARRAY_AGG(membre_gouvernance_departement.role) AS roles
    FROM membre_gouvernance_departement
    INNER JOIN departement
    ON membre_gouvernance_departement."departementCode" = departement.code
    WHERE membre_gouvernance_departement."gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY departement.nom
    UNION ALL

    SELECT region.nom as nom, 'sgar' as type, ARRAY_AGG(membre_gouvernance_sgar.role) AS roles
    FROM membre_gouvernance_sgar
    INNER JOIN region
    ON membre_gouvernance_sgar."sgarCode" = region.code
    WHERE membre_gouvernance_sgar."gouvernanceDepartementCode" = ${codeDepartement}
    GROUP BY region.nom

    ORDER BY nom;`) as ReadonlyArray<Readonly<AggregatedMembre>>

    return transform(gouvernanceRecord, membres)
  }
}

function transform(
  gouvernanceRecord: GouvernanceWithNoteDeContexte,
  membres: ReadonlyArray<AggregatedMembre>
): UneGouvernanceReadModel {
  const noteDeContexte = gouvernanceRecord.noteDeContexte?.derniereEdition ? {
    dateDeModification: gouvernanceRecord.noteDeContexte.derniereEdition,
    nomAuteur: gouvernanceRecord.noteDeContexte.relationUtilisateur.nom,
    prenomAuteur: gouvernanceRecord.noteDeContexte.relationUtilisateur.prenom,
    texte: gouvernanceRecord.noteDeContexte.contenu,
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
          roles: ['Porteur'],
          type: 'Structure',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['Porteur'],
          type: 'Structure',
        },
      ],
      beneficiairesSubventionFormation: [
        {
          nom: 'Préfecture du Rhône',
          roles: ['Porteur'],
          type: 'Structure',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['Porteur'],
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
      type: 'Administration',
      typologieMembre: membre.type,
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
