// Stryker disable all
import { formatMontant, FeuillesDeRouteViewModel } from './feuillesDeRoutePresenter'
import { GouvernanceViewModel } from './gouvernancePresenter'
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

export function feuillesDeRouteViewModelFactory(
  override?: Partial<FeuillesDeRouteViewModel>
): FeuillesDeRouteViewModel {
  return {
    feuillesDeRoute: [
      {
        actions: [
          {
            nom: 'Structurer une filière de reconditionnement locale 1',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(30_000),
              financementAccorde: formatMontant(40_000),
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Structurer une filière de reconditionnement locale 2',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(50_000),
              financementAccorde: formatMontant(20_000),
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: '5 bénéficiaires',
        coFinanceurs: '3 co-financeurs',
        nom: 'Feuille de route 1',
        nombreDActionsAttachees: '2 actions attachées à cette feuille de route',
        pieceJointe: undefined,
        porteur: 'CC des Monts du Lyonnais',
        totaux: {
          budget: '0 €',
          coFinancement: '0 €',
          financementAccorde: '0 €',
        },
        uid: 'feuilleDeRouteFooId1',
        wordingDetailDuBudget: 'dont 0 € de co-financements et 0 € des financements accordés',
      },
      {
        actions: [
          {
            nom: 'Ressource humaine 1',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(60_000),
              financementAccorde: formatMontant(20_000),
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Ressource humaine 2',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(40_000),
              financementAccorde: formatMontant(30_000),
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: '5 bénéficiaires',
        coFinanceurs: '3 co-financeurs',
        nom: 'Feuille de route 2',
        nombreDActionsAttachees: '2 actions attachées à cette feuille de route',
        pieceJointe: undefined,
        porteur: 'CC des Monts du Lyonnais',
        totaux: {
          budget: '0 €',
          coFinancement: '0 €',
          financementAccorde: '0 €',
        },
        uid: 'feuilleDeRouteFooId2',
        wordingDetailDuBudget: 'dont 0 € de co-financements et 0 € des financements accordés',
      },
    ],
    titre: 'Feuilles de route · 93',
    totaux: {
      budget: '0 €',
      coFinancement: '0 €',
      financementAccorde: '0 €',
    },
    ...override,
  }
}
