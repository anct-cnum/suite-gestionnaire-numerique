import { StructureViewModel } from '@/presenters/structurePresenter'

export function createDefaultStructureViewModel(): StructureViewModel {
  return {
    aidantsEtMediateurs: {
      liste: [
        {
          fonction: 'Médiateur numérique',
          id: 1,
          lienFiche: '/aidants-et-mediateurs/1',
          logos: ['/logo-aidants-connect.svg', '/logo-france-services.svg'],
          nom: 'Sophie Martin',
        },
        {
          fonction: 'Coordinateur',
          id: 2,
          lienFiche: '/aidants-et-mediateurs/2',
          logos: ['/logo-anct.svg'],
          nom: 'Pierre Dubois',
        },
        {
          fonction: 'Aidant numérique',
          id: 3,
          lienFiche: '/aidants-et-mediateurs/3',
          logos: [],
          nom: 'Marie Lefebvre',
        },
      ],
      totalAidant: 8,
      totalCoordinateur: 2,
      totalMediateur: 5,
    },
    contactReferent: {
      email: 'contact@structure-exemple.fr',
      fonction: 'Directeur',
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '01 23 45 67 89',
    },
    contratsRattaches: [
      {
        contrat: 'CDI',
        dateDebut: '01/01/2023',
        dateFin: '31/12/2025',
        dateRupture: '-',
        mediateur: 'Sophie Martin',
        role: 'Médiateur numérique',
        statut: {
          libelle: 'En cours',
          variant: 'success',
        },
      },
      {
        contrat: 'CDD',
        dateDebut: '15/06/2022',
        dateFin: '14/06/2023',
        dateRupture: '01/03/2023',
        mediateur: 'Thomas Bernard',
        role: 'Aidant numérique',
        statut: {
          libelle: 'Expirée',
          variant: 'error',
        },
      },
    ],
    conventionsEtFinancements: {
      conventions: [
        {
          dateDebut: '01/01/2024',
          dateFin: '31/12/2026',
          id: '1-0',
          libelle: 'Convention France Services 2024-2026',
          montantBonification: '50 000 €',
          montantSubvention: '150 000 €',
          montantTotal: '200 000 €',
          statut: {
            libelle: 'En cours',
            variant: 'success',
          },
        },
        {
          dateDebut: '01/01/2022',
          dateFin: '31/12/2023',
          id: '2-0',
          libelle: 'Convention ANCT Inclusion Numérique 2022-2023',
          montantBonification: '40 000 €',
          montantSubvention: '80 000 €',
          montantTotal: '120 000 €',
          statut: {
            libelle: 'Expirée',
            variant: 'error',
          },
        },
      ],
      creditsEngagesParLEtat: '350 000 €',
      enveloppes: [
        {
          color: 'france',
          libelle: 'France Services',
          montant: 150000,
          montantFormate: '150 000 €',
        },
        {
          color: 'menthe',
          libelle: 'Inclusion numérique',
          montant: 120000,
          montantFormate: '120 000 €',
        },
        {
          color: 'tilleul',
          libelle: 'Médiation numérique',
          montant: 80000,
          montantFormate: '80 000 €',
        },
      ],
      lienConventions: '/conventions',
    },
    identite: {
      adresse: '123 Rue de la République, 75001 Paris',
      departement: 'Paris (75)',
      editeur: 'Marie Admin',
      edition: '15/11/2024',
      identifiant: '12345678901234',
      nom: 'Centre Social et Culturel de Paris',
      region: 'Île-de-France',
      siret: '12345678901234',
      typologie: 'Association',
    },
    role: {
      feuillesDeRoute: [
        {
          libelle: 'France Services',
          lien: '/feuilles-de-route/france-services',
        },
        {
          libelle: 'Inclusion numérique',
          lien: '/feuilles-de-route/inclusion-numerique',
        },
      ],
      gouvernances: [
        {
          code: '69',
          nom: 'Rhône (69)',
          roles: [
            {
              color: 'info',
              nom: 'Co-porteur',
            },
            {
              color: 'warning',
              nom: 'Co-Financeur',
            },
          ],
        },
        {
          code: '42',
          nom: 'Loire (42)',
          roles: [
            {
              color: 'info',
              nom: 'Co-porteur',
            },
            {
              color: 'warning',
              nom: 'Co-Financeur',
            },
          ],
        },
      ],
      membreDepuisLe: '01/01/2020',
    },
    structureId: 1,
  }
}

export function createStructureViewModelWithMinimalData(): StructureViewModel {
  return {
    aidantsEtMediateurs: {
      liste: [],
      totalAidant: 0,
      totalCoordinateur: 0,
      totalMediateur: 0,
    },
    contactReferent: {
      email: '',
      fonction: '',
      nom: '',
      prenom: '',
      telephone: '',
    },
    contratsRattaches: [],
    conventionsEtFinancements: {
      conventions: [],
      creditsEngagesParLEtat: '0 €',
      enveloppes: [],
      lienConventions: '/conventions',
    },
    identite: {
      adresse: '123 Rue de la République, 75001 Paris',
      departement: 'Paris (75)',
      editeur: '-',
      edition: '-',
      identifiant: '12345678901234',
      nom: 'Structure exemple',
      region: 'Île-de-France',
      siret: '12345678901234',
      typologie: 'Association',
    },
    role: {
      feuillesDeRoute: [],
      gouvernances: [],
      membreDepuisLe: '-',
    },
    structureId: 2,
  }
}
