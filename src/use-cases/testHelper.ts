/* eslint-disable import/no-restricted-paths */
// Stryker disable all
import { FeuillesDeRouteReadModel } from './queries/RecupererLesFeuillesDeRoute'
import { MesInformationsPersonnellesReadModel } from './queries/RecupererMesInformationsPersonnelles'
import { MesMembresReadModel } from './queries/RecupererMesMembres'
import { UneGouvernanceReadModel } from './queries/RecupererUneGouvernance'
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
            roles: ['coporteur'],
            type: 'Administration',
          },
          {
            nom: 'Département du Rhône',
            roles: ['coporteur', 'cofinanceur'],
            type: 'Collectivité',
          },
        ],
        beneficiairesSubventionFormation: [
          {
            nom: 'Structure 1',
            roles: ['coporteur'],
            type: 'Structure',
          },
          {
            nom: 'Structure 2',
            roles: ['coporteur'],
            type: 'Structure',
          },
        ],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        nom: 'Feuille de route inclusion',
        porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Préfecture départementale' },
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
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
          links: {},
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          telephone: '+33 4 45 00 45 00',
          type: 'Préfecture départementale',
        },
        {
          contactReferent: {
            denomination: 'Contact référent',
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }],
          links: { plusDetails: '/' },
          nom: 'Département du Rhône',
          roles: ['coporteur', 'cofinanceur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: 0,
          totalMontantSubventionFormationAccorde: 0,
          type: 'Conseil départemental',
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
    departement: 'Seine-Saint-Denis',
    feuillesDeRoute: [
      {
        actions: [
          {
            nom: 'Structurer une filière de reconditionnement locale 1',
            statut: 'subventionAcceptee',
            totaux: {
              coFinancement: 30_000,
              financementAccorde: 40_000,
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Structurer une filière de reconditionnement locale 2',
            statut: 'subventionAcceptee',
            totaux: {
              coFinancement: 50_000,
              financementAccorde: 20_000,
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: 5,
        coFinanceurs: 3,
        nom: 'Feuille de route 1',
        structureCoPorteuse: {
          nom: 'CC des Monts du Lyonnais',
          uid: 'structureCoPorteuseFooId',
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
            nom: 'Ressource humaine 1',
            statut: 'subventionAcceptee',
            totaux: {
              coFinancement: 60_000,
              financementAccorde: 20_000,
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Ressource humaine 2',
            statut: 'subventionAcceptee',
            totaux: {
              coFinancement: 40_000,
              financementAccorde: 30_000,
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: 5,
        coFinanceurs: 3,
        nom: 'Feuille de route 2',
        structureCoPorteuse: {
          nom: 'CC des Monts du Lyonnais',
          uid: 'structureCoPorteuseFooId',
        },
        totaux: {
          budget: 0,
          coFinancement: 0,
          financementAccorde: 0,
        },
        uid: 'feuilleDeRouteFooId2',
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
