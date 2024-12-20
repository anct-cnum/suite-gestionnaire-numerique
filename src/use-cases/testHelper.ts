// Stryker disable all
import { MesInformationsPersonnellesReadModel } from './queries/RecupererMesInformationsPersonnelles'
import { UneGouvernanceReadModel } from './queries/RecupererUneGouvernance'
import { UnUtilisateurReadModel } from './queries/shared/UnUtilisateurReadModel'
import { Roles } from '@/domain/Role'
import { epochTime } from '@/shared/testHelper'

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
        dateProchainComite: epochTime,
        nom: 'Comité stratégique',
        periodicite: 'Semestriel',
        type: 'stratégique',
      },
      {
        commentaire: 'commentaire',
        dateProchainComite: new Date('2024-03-01'),
        nom: 'Comité stratégique 2',
        periodicite: 'Trimestriel',
        type: 'technique',
      },
    ],
    departement: 'Rhône',
    feuillesDeRoute: [
      {
        beneficiairesSubvention: [
          {
            nom: 'Structure 1',
            roles: ['Co-porteur'],
            type: 'Administration',
          },
          {
            nom: 'Département du Rhône',
            roles: ['Co-porteur', 'Financeur'],
            type: 'Collectivité',
          },
        ],
        beneficiairesSubventionFormation: [
          {
            nom: 'Structure 1',
            roles: ['Porteur'],
            type: 'Structure',
          },
          {
            nom: 'Structure 2',
            roles: ['Porteur'],
            type: 'Structure',
          },
        ],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        nom: 'Feuille de route inclusion 1',
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
        totalActions: 3,
      },
    ],
    membres: [
      {
        contactPolitique: 'Laetitia Henrich, chargé de mission julien.deschamps@rhones.gouv.fr',
        contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
        feuillesDeRoute: [
          { nom: 'Feuille de route inclusion' },
          { nom: 'Feuille de route numérique du Rhône' },
        ],
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        telephone: '+33 4 45 00 45 00',
        type: 'Administration',
        typologieMembre: 'Préfecture départementale',
      },
      {
        contactPolitique: 'Jean Dupont, chargé de mission jean.dupont@rhones.gouv.fr',
        contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
        feuillesDeRoute: [{ nom: 'Feuille de route inclusion 1' }],
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Financeur'],
        telephone: '+33 4 45 00 45 01',
        type: 'Collectivité',
        typologieMembre: 'Collectivité, EPCI',
      },
    ],
    noteDeContexte: {
      dateDeModification: epochTime,
      nomAuteur: 'Deschamps',
      prenomAuteur: 'Jean',
      texte: '<strong>Note privée (interne)</strong><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
    },
    uid: 'gouvernanceFooId',
    ...override,
  }
}
