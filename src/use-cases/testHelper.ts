/* eslint-disable import/no-restricted-paths */
// Stryker disable all
import { FeuillesDeRouteReadModel } from './queries/RecupererLesFeuillesDeRoute'
import { MesInformationsPersonnellesReadModel } from './queries/RecupererMesInformationsPersonnelles'
import { MesMembresReadModel } from './queries/RecupererMesMembres'
import { UneFeuilleDeRouteReadModel } from './queries/RecupererUneFeuilleDeRoute'
import { UneGouvernanceReadModel } from './queries/RecupererUneGouvernance'
import { BesoinsPossible } from './queries/shared/ActionReadModel'
import { StatutSubvention } from "@/domain/DemandeDeSubvention"
import { UnUtilisateurReadModel } from './queries/shared/UnUtilisateurReadModel'
import { Roles } from '@/domain/Role'
import { epochTime, epochTimeMinusOneDay } from '@/shared/testHelper'

export function utilisateurReadModelFactory(
  override?: Partial<UnUtilisateurReadModel>
): UnUtilisateurReadModel {
  return {
    departementCode: null,
    derniereConnexion: epochTime,
    email: 'martin.tartempion@example.net',
    groupementId: null,
    inviteLe: epochTime,
    isActive: true,
    isGestionnaireDepartement: false,
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    regionCode: null,
    role: {
      categorie: 'anct',
      doesItBelongToGroupeAdmin: true,
      nom: 'Administrateur dispositif',
      organisation: '',
      rolesGerables: Roles,
    },
    structureId: null,
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  }
}

export function mesInformationsPersonnellesReadModelFactory(
  override?: Partial<MesInformationsPersonnellesReadModel>
): MesInformationsPersonnellesReadModel {
  return {
    emailDeContact: 'julien.deschamps@example.com',
    nom: 'Deschamps',
    prenom: 'Julien',
    role: 'Administrateur dispositif',
    telephone: '0405060708',
    ...override,
  }
}

export function gouvernanceReadModelFactory(
  override?: Partial<UneGouvernanceReadModel>
): UneGouvernanceReadModel {
  return {
    comites: [
      {
        commentaire: 'commentaire',
        date: epochTime,
        derniereEdition: epochTime,
        frequence: 'semestrielle',
        id: 1,
        nomEditeur: 'Tartempion',
        prenomEditeur: 'Michel',
        type: 'stratégique',
      },
      {
        commentaire: 'commentaire',
        date: epochTime,
        derniereEdition: epochTimeMinusOneDay,
        frequence: 'trimestrielle',
        id: 2,
        nomEditeur: 'Tartempion',
        prenomEditeur: 'Martin',
        type: 'technique',
      },
    ],
    departement: 'Rhône',
    feuillesDeRoute: [
      {
        beneficiairesSubvention: [
          {
            nom: 'Structure 1',
            uid: '0',
          },
          {
            nom: 'Département du Rhône',
            uid: '1',
          },
        ],
        beneficiairesSubventionAccordee: [
          {
            nom: 'Structure 1',
            uid: '0',
          },
        ],  
        beneficiairesSubventionFormation: [
          {
            nom: 'Structure 1',
            uid: '0',
          },
          {
            nom: 'Structure 2',
            uid: '3',
          },
        ],
        beneficiairesSubventionFormationAccordee: [
          {
            nom: 'Structure 1',
            uid: '0',
          },
        ],
        budgetGlobal: 145_000,
        montantSubventionAccordee: 5_000,
        montantSubventionDemandee: 40_000,
        montantSubventionFormationAccordee: 5_000,
        nom: 'Feuille de route inclusion',
        pieceJointe: {
          apercu: '',
          emplacement: '',
          metadonnees: {
            format: 'pdf',
            taille: '25 Mo',
            upload: epochTime,
          },
          nom: 'user/1234/feuille-de-route-fake.pdf',
        },
        porteur: { nom: 'Préfecture du Rhône', uid: '4' },
        totalActions: 3,
        uid: 'feuilleDeRouteFooId',
      },
    ],
    noteDeContexte: {
      dateDeModification: epochTime,
      nomAuteur: 'Deschamps',
      prenomAuteur: 'Jean',
      texte: '<strong>Note privée (interne)</strong><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
    },
    notePrivee: {
      dateDEdition: epochTime,
      nomEditeur: 'Lu',
      prenomEditeur: 'Lucie',
      texte: 'lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna.',
    },
    peutVoirNotePrivee: true,
    porteursPotentielsNouvellesFeuillesDeRouteOuActions:[],
    syntheseMembres: {
      candidats: 0,
      coporteurs: [
        {
          contactReferent: {
            denomination: 'Contact politique de la collectivité',
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }, { nom: 'Feuille de route numérique du Rhône', uid: '1' }],
          links: {},
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          telephone: '+33 4 45 00 45 00',
          type: 'Préfecture départementale',
          uid: 'prefecture-69',
        },
        {
          contactReferent: {
            denomination: 'Contact référent',
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '0' }],
          links: { plusDetails: '/' },
          nom: 'Département du Rhône',
          roles: ['coporteur', 'cofinanceur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantsSubventionsAccordees: 5_000,
          totalMontantsSubventionsFormationAccordees: 5_000,
          type: 'Conseil départemental',
          uid: 'departement-69-69',
        },
      ],
      total: 2,
    },
    uid: 'gouvernanceFooId',
    ...override,
  }
}

export function feuillesDeRouteReadModelFactory(
  override?: Partial<FeuillesDeRouteReadModel>
): FeuillesDeRouteReadModel {
  return {
    feuillesDeRoute: [
      {
        actions: [
          {
            beneficiaires: [
              {
                nom: 'CAF DE LA CHARENTE',
                uid: '1',
              },
              {
                nom: 'HUBIKOOP',
                uid: '2',
              },
              {
                nom: 'HYPRA',
                uid: '3',
              },
            ],
            besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL, BesoinsPossible.APPUI_JURIDIQUE],
            budgetGlobal: 70_000,
            coFinancements: [
              {
                coFinanceur: { nom: 'Co-financeur 1', uid: 'coFinanceurId' },
                montant: 20_000,
              },
              {
                coFinanceur: { nom: 'Co-financeur Orange', uid: 'coFinanceurOrangeId' },
                montant: 10_000,
              },
              {
                coFinanceur: { nom: 'Co-financeur 1', uid: 'coFinanceurId' },
                montant: 10_000,
              },
            ],
            contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            nom: 'Structurer une filière de reconditionnement locale 1',
            porteurs: [
              {
                nom: 'CC des Monts du Lyonnais',
                uid: 'coPorteuseFooId',
              },
            ],
            subvention: {
              enveloppe: 'Ingénierie France Numérique Ensemble',
              montants: {
                prestation: 20_000,
                ressourcesHumaines: 10_000,
              },
              statut: StatutSubvention.ACCEPTEE,
            },
            totaux: {
              coFinancement: 0,
              financementAccorde: 0,
            },
            uid: 'actionFooId1',
          },
          {
            beneficiaires: [
              {
                nom: 'CAF DE LA CHARENTE',
                uid: '1',
              },
              {
                nom: 'Kocoya THinkLab',
                uid: '5',
              },
            ],
            besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL, BesoinsPossible.APPUI_JURIDIQUE],
            budgetGlobal: 100_000,
            coFinancements: [],
            contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            nom: 'Structurer une filière de reconditionnement locale 2',
            porteurs: [],
            totaux: {
              coFinancement: 0,
              financementAccorde: 0,
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: 0,
        coFinanceurs: 0,
        nom: 'Feuille de route 1',
        structureCoPorteuse: {
          nom: 'CC des Monts du Lyonnais',
          uid: 'coPorteuseFooId',
        },
        totaux: {
          budget: 0,
          coFinancement: 0,
          financementAccorde: 0,
        },
        uid: 'feuilleDeRouteFooId1',
      },
      {
        actions: [
          {
            beneficiaires: [
              {
                nom: 'CAF DE LA CHARENTE',
                uid: '1',
              },
            ],
            besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL, BesoinsPossible.APPUI_JURIDIQUE],
            budgetGlobal: 60_000,
            coFinancements: [
              {
                coFinanceur: { nom: 'Co-financeur 2', uid: 'coFinanceurId2' },
                montant: 20_000,
              },
            ],
            contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            nom: 'Structurer une filière de reconditionnement locale 3',
            porteurs: [
              {
                nom: 'Emmaüs Connect',
                uid: 'porteurId1',
              },
              {
                nom: 'Orange',
                uid: 'porteurId2',
              },
            ],
            totaux: {
              coFinancement: 0,
              financementAccorde: 0,
            },
            uid: 'actionFooId3',
          },
        ],
        beneficiaires: 0,
        coFinanceurs: 0,
        nom: 'Feuille de route 2',
        structureCoPorteuse: {
          nom: 'Croix Rouge Française',
          uid: 'coPorteuseFooId2',
        },
        totaux: {
          budget: 0,
          coFinancement: 0,
          financementAccorde: 0,
        },
        uid: 'feuilleDeRouteFooId2',
      },
      {
        actions: [
          {
            beneficiaires: [],
            besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL],
            budgetGlobal: 13_000,
            coFinancements: [
              {
                coFinanceur: { nom: 'Co-financeur 2', uid: 'coFinanceurId2' },
                montant: 6_000,
              },
            ],
            contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
            nom: 'Structurer une filière de reconditionnement locale 3',
            porteurs: [],
            subvention: {
              enveloppe: 'Ingénierie France Numérique Ensemble',
              montants: {
                prestation: 4_000,
                ressourcesHumaines: 3_000,
              },
              statut: StatutSubvention.REFUSEE,
            },
            totaux: {
              coFinancement: 0,
              financementAccorde: 0,
            },
            uid: 'actionFooId4',
          },
        ],
        beneficiaires: 0,
        coFinanceurs: 0,
        nom: 'Feuille de route 3',
        structureCoPorteuse: undefined,
        totaux: {
          budget: 0,
          coFinancement: 0,
          financementAccorde: 0,
        },
        uid: 'feuilleDeRouteFooId3',
      },
    ],
    porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
      {
        nom: 'Meetkap',
        roles: ['coporteur'],
        uid: 'structure-95351745500010-44',
      },
      {
        nom: 'Emmaüs Connect',
        roles: ['coporteur', 'recipiendaire'],
        uid: 'porteurId1',
      },
      {
        nom: 'Orange',
        roles: ['observateur'],
        uid: 'porteurId2',
      },
    ],
    totaux: {
      budget: 0,
      coFinancement: 0,
      financementAccorde: 0,
    },
    uidGouvernance: 'gouvernanceFooId',
    ...override,
  }
}

export function feuilleDeRouteReadModelFactory(
  override?: Partial<UneFeuilleDeRouteReadModel>
): UneFeuilleDeRouteReadModel {
  return {
    actions: [
      {
        beneficiaire: 2,
        besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL],
        budgetPrevisionnel: 100_000,
        coFinancement: {
          financeur: 1,
          montant: 80_000,
        },
        enveloppe: {
          libelle: 'Enveloppe test',
          montant: 20_000,
        },
        isEditable: true,
        isEnveloppeFormation: true,
        nom: 'Structurer une filière de reconditionnement locale 1',
        porteurs: [
          {
            nom: 'CC des Monts du Lyonnais',
            uid: 'membreFooId',
          },
        ],
        statut: StatutSubvention.DEPOSEE,
        subventionDemandee: 40_000,
        uid: 'actionFooId1',
      },
      {
        beneficiaire: 2,
        besoins: [],
        budgetPrevisionnel: 70_000,
        coFinancement: {
          financeur: 1,
          montant: 15_000,
        },
        enveloppe: {
          libelle: 'Enveloppe test',
          montant: 10_000,
        },
        isEditable: true,
        isEnveloppeFormation: true,
        nom: 'Structurer une filière de reconditionnement locale 2',
        porteurs: [],
        statut: StatutSubvention.ACCEPTEE,
        subventionDemandee: 40_000,
        uid: 'actionFooId2',
      },
    ],
    beneficiaire: 4,
    budgetTotalActions: 140_000,
    coFinanceur: 2,
    contextualisation: '<p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p>',
    document: {
      chemin: 'user/fooId/feuille-de-route-fake.pdf',
      nom: 'feuille-de-route-fake.pdf',
    },
    edition: {
      date: epochTime,
      nom: 'Brunot',
      prenom: 'Lucie',
    },
    montantCofinancements: 90_000,
    montantFinancementsAccordes: 30_000,
    nom: 'Feuille de route FNE',
    perimetre: 'departemental',
    porteur: {
      nom: 'Orange',
      uid: 'membreFooId',
    },
    uid: 'feuilleDeRouteFooId',
    uidGouvernance: 'gouvernanceFooId',
    ...override,
  }
}

export function membresReadModelFactory(override?: Partial<MesMembresReadModel>): MesMembresReadModel {
  return {
    autorisations: {
      accesMembreConfirme: false,
      ajouterUnMembre: false,
      supprimerUnMembre: false,
    },
    departement: 'Rhône',
    membres: [
      {
        adresse: '29,31 Cours de la Liberté 69483 LYON Cedex 03',
        contactReferent: {
          email: 'laetitia.henrich@example.net',
          fonction: 'Responsable territoriale',
          nom: 'Henrich',
          prenom: 'Laetitia',
        },
        isDeletable: false,
        nom: 'Préfecture du Rhône',
        roles: ['coporteur'],
        siret: '00000000000000',
        statut: 'confirme',
        suppressionDuMembreAutorise: false,
        typologie: 'Préfecture départementale',
        uid: 'prefecture-69',
      },
      {
        adresse: '29,31 Cours de la Liberté 69483 LYON Cedex 03',
        contactReferent: {
          email: 'pauline.chappuis@example.net',
          fonction: 'Directrice',
          nom: 'Chappuis',
          prenom: 'Pauline',
        },
        isDeletable: true,
        nom: 'Rhône (69)',
        roles: ['coporteur', 'cofinanceur'],
        siret: '00000000000000',
        statut: 'confirme',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, conseil départemental',
        uid: 'departement-69-69',
      },
      {
        adresse: '790 allée de Pluvy – 69590 Pomeys',
        contactReferent: {
          email: 'blaise.boudet@example.net',
          fonction: 'Responsable territorial',
          nom: 'Boudet',
          prenom: 'Blaise',
        },
        isDeletable: true,
        nom: 'CC des Monts du Lyonnais',
        roles: ['coporteur', 'cofinanceur'],
        siret: '00000000000000',
        statut: 'candidat',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
        uid: 'epci-200066587-69',
      },
      {
        adresse: '26 rue Emile Decorps 69100 VILLEURBANNE',
        contactReferent: {
          email: 'gaby.vasseur@example.net',
          fonction: 'Coordinateur',
          nom: 'Vasseur',
          prenom: 'Gaby',
        },
        isDeletable: true,
        nom: "La Voie du Num'",
        roles: ['beneficiaire', 'recipiendaire'],
        siret: '42985163700034',
        statut: 'candidat',
        suppressionDuMembreAutorise: false,
        typologie: 'Association',
        uid: 'structure-42985163700034-69',
      },
      {
        adresse: '17 rue Jean Bourgey 69100 Villeurbanne',
        contactReferent: {
          email: 'gaby.vasseur@example.net',
          fonction: 'Coordinateur',
          nom: 'Vasseur',
          prenom: 'Gaby',
        },
        isDeletable: true,
        nom: 'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
        roles: ['observateur'],
        siret: '77978721700057',
        statut: 'suggere',
        suppressionDuMembreAutorise: false,
        typologie: '',
        uid: 'structure-77978721700057-69',
      },
      {
        adresse: '66 cours Charlemagne, Lyon 2e',
        contactReferent: {
          email: 'gregory.geffroy@example.net',
          fonction: 'Responsable communication',
          nom: 'Geffroy',
          prenom: 'Grégory',
        },
        isDeletable: true,
        nom: 'Info-Jeunes Auvergne Rhône-Alpes (CRIJ)',
        roles: ['beneficiaire', 'cofinanceur'],
        siret: '33805291300062',
        statut: 'confirme',
        suppressionDuMembreAutorise: false,
        typologie: 'Association',
        uid: 'structure-33805291300062-69',
      },
      {
        adresse: '71 rue Archereau, 75019 PARIS',
        contactReferent: {
          email: 'ninon.poulin@example.net',
          fonction: 'Médiatrice',
          nom: 'Poulin',
          prenom: 'Ninon',
        },
        isDeletable: true,
        nom: 'Emmaüs Connect',
        roles: ['observateur'],
        siret: '79227291600034',
        statut: 'candidat',
        suppressionDuMembreAutorise: false,
        typologie: 'Association',
        uid: 'structure-79227291600034-69',
      },
      {
        adresse: '21/23 Rue DE LA VANNE 92120 MONTROUGE',
        contactReferent: {
          email: 'arianne.dufour@example.net',
          fonction: 'Secrétaire générale',
          nom: 'Dufour',
          prenom: 'Arianne',
        },
        isDeletable: true,
        nom: 'Croix Rouge Française',
        roles: ['cofinanceur'],
        siret: '77567227224553',
        statut: 'suggere',
        suppressionDuMembreAutorise: false,
        typologie: 'Association',
        uid: 'structure-77567227224553-69',
      },
      {
        adresse: '111 Quai du Président Roosevelt 92449 Issy-les-Moulineaux',
        contactReferent: {
          email: 'fabien.pelissier@example.net',
          fonction: 'Secrétaire général',
          nom: 'Pélissier',
          prenom: 'Fabien',
        },
        isDeletable: true,
        nom: 'Orange',
        roles: ['coporteur'],
        siret: '38012986643097',
        statut: 'confirme',
        suppressionDuMembreAutorise: false,
        typologie: 'Entreprise privée',
        uid: 'structure-38012986643097-69',
      },
      {
        adresse: '66 cours Charlemagne, Lyon 2e',
        contactReferent: {
          email: 'gregory.geffroy@example.net',
          fonction: 'Responsable communication',
          nom: 'Geffroy',
          prenom: 'Grégory',
        },
        isDeletable: true,
        nom: 'Info-Jeunes Rhône (CRIJ)',
        roles: ['coporteur'],
        siret: '33805291300063',
        statut: 'confirme',
        suppressionDuMembreAutorise: false,
        typologie: 'Association',
        uid: 'structure-33805291300063-69',
      },
    ],
    roles: ['cofinanceur', 'coporteur', 'beneficiaire', 'observateur', 'recipiendaire'],
    typologies: ['', 'Collectivité, EPCI', 'Préfecture départementale', 'Collectivité, conseil départemental', 'Entreprise privée', 'Association'],
    uidGouvernance: '69',
    ...override,
  }
}
