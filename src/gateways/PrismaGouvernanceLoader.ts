import { Prisma } from '@prisma/client'

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

    return transform(gouvernanceRecord)
  }
}

function transform(gouvernanceRecord: GouvernanceWithNoteDeContexte): UneGouvernanceReadModel {
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
    feuillesDeRoute: [
      {
        beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        nom: 'Feuille de route inclusion',
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
        totalActions: 3,
      },
      {
        beneficiairesSubvention: [],
        beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        nom: 'Feuille de route numérique du Rhône',
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
        totalActions: 2,
      },
    ],
    membres: [
      {
        contactReferent: {
          denomination: 'Contact politique de la collectivité',
          mailContact: 'julien.deschamps@rhones.gouv.fr',
          nom: 'Henrich',
          poste: 'chargé de mission',
          prenom: 'Laetitia',
        },
        contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
        feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
        links: {},
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        telephone: '+33 4 45 00 45 00',
        totalMontantSubventionAccorde: NaN,
        totalMontantSubventionFormationAccorde: NaN,
        type: 'Administration',
        typologieMembre: 'Préfecture départementale',
      },
      {
        contactReferent: {
          denomination: 'Contact référent',
          mailContact: 'didier.durand@exemple.com',
          nom: 'Didier',
          poste: 'chargé de mission',
          prenom: 'Durant',
        },
        feuillesDeRoute: [{ montantSubventionAccorde: 30_000, montantSubventionFormationAccorde: 20_000, nom: 'Feuille de route inclusion' }],
        links: {},
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Financeur'],
        telephone: '+33 4 45 00 45 01',
        totalMontantSubventionAccorde: NaN,
        totalMontantSubventionFormationAccorde: NaN,
        type: 'Collectivité',
        typologieMembre: 'Collectivité, EPCI',
      },
      {
        contactReferent: {
          denomination: 'Contact référent',
          mailContact: 'coco.dupont@rhones.gouv.fr',
          nom: 'Coco',
          poste: 'chargé de mission',
          prenom: 'Dupont',
        },
        feuillesDeRoute: [],
        links: {},
        nom: 'CC des Monts du Lyonnais',
        roles: ['Co-porteur', 'Financeur'],
        telephone: '',
        totalMontantSubventionAccorde: NaN,
        totalMontantSubventionFormationAccorde: NaN,
        type: 'Collectivité',
        typologieMembre: 'Collectivité, EPCI',
      },
    ],
    noteDeContexte,
    notePrivee,
    uid: gouvernanceRecord.departementCode,
  }
}
