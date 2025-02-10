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
    uid: 'gouvernanceFooId',
    ...override,
  }
}

export function mesMembresReadModelFactory(
  override?: Partial<MesMembresReadModel>
): MesMembresReadModel {
  return {
    autorisations: {
      accesMembreConfirme: true,
      ajouterUnMembre: true,
      supprimerUnMembre: true,
    },
    departement: 'Rhône',
    membres: [
      {
        contactReferent: {
          nom: 'Henrich',
          prenom: 'Laetitia',
        },
        nom: 'Préfecture du Rhône',
        roles: ['coporteur'],
        suppressionDuMembreAutorise: false,
        typologie: 'Préfecture départementale',
      },
      {
        contactReferent: {
          nom: 'Didier',
          prenom: 'Durant',
        },
        nom: 'Département du Rhône',
        roles: ['coporteur', 'cofinanceur'],
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
      },
      {
        contactReferent: {
          nom: 'Dupont',
          prenom: 'Tom',
        },
        nom: 'Département du Rhône',
        roles: [],
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
      },
    ],
    roles: [],
    typologies: [],
    ...override,
  }
}

export function feuillesDeRouteReadModelFactory(
  override?: Partial<FeuillesDeRouteReadModel>
): FeuillesDeRouteReadModel {
  return {
    departement: '93',
    feuillesDeRoute: [
      {
        actions: [
          {
            nom: 'Structurer une filière de reconditionnement locale 1',
            statut: 'subvention_acceptee',
            totaux: {
              coFinancement: 30_000,
              financementAccorde: 40_000,
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Structurer une filière de reconditionnement locale 2',
            statut: 'subvention_acceptee',
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
            statut: 'subvention_acceptee',
            totaux: {
              coFinancement: 60_000,
              financementAccorde: 20_000,
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Ressource humaine 2',
            statut: 'subvention_acceptee',
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
    ...override,
  }
}
