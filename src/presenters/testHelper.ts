// Stryker disable all
import { GouvernanceViewModel } from './gouvernancePresenter'
import { MesMembresViewModel } from './mesMembresPresenter'
import { SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'

export function sessionUtilisateurViewModelFactory(
  override?: Partial<SessionUtilisateurViewModel>
): SessionUtilisateurViewModel {
  return {
    codeDepartement: '93',
    displayLiensGouvernance: false,
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      doesItBelongToGroupeAdmin: true,
      libelle: 'Mednum',
      nom: 'Support animation',
      pictogramme: 'support-animation',
      rolesGerables: [] as ReadonlyArray<string>,
    },
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  }
}

export function mesMembresViewModelFactory(
  override?: Partial<MesMembresViewModel>
): MesMembresViewModel {
  return {
    autorisations: {
      accesMembreConfirme: true,
      ajouterUnMembre: true,
      supprimerUnMembre: true,
    },
    candidatsOuSuggeres: [
      {
        adresse: '172 B RTE DE LENS 62223 SAINTE-CATHERINE',
        contactReferent: 'Eric Dupont, Directeur didier.dupont@example.com',
        isSelected: false,
        label: 'Croix Rouge Française',
        siret: '79227291600034',
        statut: 'Suggéré',
        typologie: 'Association',
        uid: 'structure-79227291600034',
      },
      {
        adresse: '17 avenue de l’opéra 75000 Paris',
        contactReferent: 'Eric Durant, Directeur eric.durant@example.com',
        isSelected: false,
        label: 'La Poste',
        siret: '99229991601034',
        statut: 'Candidat',
        typologie: 'EPCI',
        uid: 'structure-99229991601034',
      },
      {
        adresse: '18 avenue de l’opéra 75000 Paris',
        contactReferent: 'Donnée non fournie',
        isSelected: false,
        label: 'La Poste 2',
        siret: '99339991601034',
        statut: 'Candidat',
        typologie: 'Donnée non fournie',
        uid: 'structure-99339991601034',
      },
    ],
    membres: [
      {
        adresse: '1 rue de Paris',
        contactReferent: 'Laetitia Henrich',
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        siret: '79227291600031',
        suppressionDuMembreAutorise: false,
        typologie: 'Préfecture départementale',
        uidMembre: 'sgar-69',
      },
      {
        adresse: '2 rue de Paris',
        contactReferent: 'Durant Didier',
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Co-financeur'],
        siret: '79227291600032',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
        uidMembre: 'departement-69',
      },
      {
        adresse: '3 rue de Paris',
        contactReferent: '-',
        nom: 'Département du Rhône',
        roles: [],
        siret: '79227291600033',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
        uidMembre: 'departement-69',
      },
    ],
    roles: ['Co-porteur', 'Co-financeur'],
    titre: 'Gérer les membres · Rhône',
    typologies: ['Préfecture départementale', 'Collectivité, EPCI'],
    uidGouvernance: 'gouvernanceFooId',
    ...override,
  } as const
}

export function gouvernanceViewModelFactory(
  override?: Partial<GouvernanceViewModel>
): GouvernanceViewModel {
  return {
    comiteARemplir: {
      commentaire: '',
      date: '',
      derniereEdition: '',
      editeur: '',
      frequences: [],
      types: [],
      uid: 1,
    },
    dateAujourdhui: '',
    departement: '',
    hasMembres: false,
    isVide: false,
    sectionFeuillesDeRoute: {
      budgetTotalCumule: '',
      feuillesDeRoute: [],
      lien: {
        label: '',
        url: '',
      },
      total: '0',
      wording: '',
    },
    sectionMembres: {
      coporteurs: [],
      lien: '',
      totalEtWording: [0, ''],
      wordingRecap: '',
    },
    sectionNoteDeContexte: {
      noteDeContexte: {
        dateDeModification: '',
        nomAuteur: '',
        prenomAuteur: '',
        texteAvecHTML: '',
      },
      sousTitre: '',
    },
    uid: '',
    ...override,
  }
}
