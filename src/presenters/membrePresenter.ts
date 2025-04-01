import { formaterEnDateFrancaise } from './shared/date'
import { HistoriqueViewModel } from './shared/historique'
import { feuilleDeRouteLink } from './shared/link'
import { formatMontant } from './shared/number'
import { RoleViewModel, toRoleViewModel } from './shared/role'

export function membrePresenter(codeDepartement: string): MembreViewModel {
  return {
    aidantsEtMediateurs: {
      liste: [
        {
          fonction: ['Coordinateur', 'Médiateur numérique'].join(', '),
          lienFiche: '/',
          logos: [],
          nom: 'Martin Dubois',
        },
        {
          fonction: ['Médiateur numérique', 'Conseiller numérique', 'Aidant numérique', 'Aidants Connect'].join(', '),
          lienFiche: '/',
          logos: [`${process.env.NEXT_PUBLIC_HOST}/conum.svg`, `${process.env.NEXT_PUBLIC_HOST}/aidant-numerique.svg`],
          nom: 'Marc-Olivier Gagnon',
        },
        {
          fonction: ['Médiateur numérique', 'Aidant numérique'].join(', '),
          lienFiche: '/',
          logos: [`${process.env.NEXT_PUBLIC_HOST}/mednum.svg`],
          nom: 'Philippe Morin',
        },
      ],
      totalAidant: 6,
      totalCoordinateur: 1,
      totalMediateur: 4,
    },
    contactReferent: {
      email: 'didier.durand@example.com',
      fonction: 'Directeur',
      nom: 'Durant',
      prenom: 'Didier',
      telephone: '0102030405',
    },
    conventionsEtFinancements: {
      conventions: [
        {
          documents: [
            {
              conseilleNumerique: 'Paul Durant',
              contratDeTravail: 'CDD',
              expiration: formaterEnDateFrancaise(new Date('2025-09-23')),
              libelle: 'Contrat de travail 220925',
              lien: '/',
              lienConseilleNumerique: '/',
              statut: {
                libelle: 'En cours',
                variant: 'success',
              },
              telechargement: '/',
            },
            {
              conseilleNumerique: 'Paul Durand',
              contratDeTravail: 'CDD',
              expiration: formaterEnDateFrancaise(new Date('2024-09-23')),
              libelle: 'Contrat de travail 220923',
              lien: '/',
              lienConseilleNumerique: '/',
              statut: {
                libelle: 'Expirée',
                variant: 'error',
              },
              telechargement: '/',
            },
          ],
          expiration: formaterEnDateFrancaise(new Date('2027-11-23')),
          libelle: 'Convention CC des Monts du Lyonnais',
          statut: {
            libelle: 'En cours',
            variant: 'success',
          },
          telechargement: '/',
        },
        {
          documents: [],
          expiration: formaterEnDateFrancaise(new Date('2027-11-01')),
          libelle: 'Avenant mai 2024',
          statut: {
            libelle: 'En cours',
            variant: 'success',
          },
          telechargement: '/',
        },
      ],
      creditsEngagesParLEtat: formatMontant(145_000),
      enveloppes: [
        {
          color: 'menthe',
          libelle: 'Conseiller Numérique - Renouvellement - État',
          montant: 100_000,
          montantFormate: formatMontant(100_000),
        },
        {
          color: 'france',
          libelle: 'Conseiller Numérique - Plan France Relance - État',
          montant: 25_000,
          montantFormate: formatMontant(25_000),
        },
        {
          color: 'tilleul',
          libelle: 'Formations Aidants Connect Plan France Relance - 2021/2023 - Etat',
          montant: 20_000,
          montantFormate: formatMontant(20_000),
        },
      ],
      lienConventions: '/',
    },
    historiques: [
      {
        date: formaterEnDateFrancaise(new Date('2025-02-23')),
        editeur: 'Par Laetitia Henrich',
        libelle: '1 poste rendu',
      },
      {
        date: formaterEnDateFrancaise(new Date('2024-02-23')),
        editeur: 'Par Laetitia Henrich',
        libelle: 'Feuille de route modifiée',
      },
      {
        date: formaterEnDateFrancaise(new Date('2023-02-23')),
        editeur: 'Par Emilie Dubois',
        libelle: 'Note de contexte modifiée',
      },
    ],
    identite: {
      adresse: '201 bis rue de la plaine, 69000 Lyon',
      departement: 'Rhône',
      editeur: 'Lucie Bruno',
      edition: formaterEnDateFrancaise(new Date('2024-11-23')),
      identifiant: '#7889',
      nom: 'CC des Monts du Lyonnais',
      region: 'Auvergne Rhône-Alpes',
      siret: '79227291600034',
      typologie: 'Collectivité, EPCI',
    },
    role: {
      feuillesDeRoute: [
        {
          libelle: 'Feuille de route inclusion',
          lien: feuilleDeRouteLink(codeDepartement, '113'),
        },
        {
          libelle: 'Feuille de route numérique du Rhône',
          lien: feuilleDeRouteLink(codeDepartement, '114'),
        },
      ],
      membreDepuisLe: formaterEnDateFrancaise(new Date('2024-03-22')),
      roles: [
        toRoleViewModel('coporteur'),
        toRoleViewModel('cofinanceur'),
      ],
    },
    uid: 'structure-79227291600034',
  }
}

export type MembreViewModel = Readonly<{
  aidantsEtMediateurs: Readonly<{
    liste: ReadonlyArray<{
      fonction: string
      lienFiche: string
      logos: ReadonlyArray<string>
      nom: string
    }>
    totalAidant: number
    totalCoordinateur: number
    totalMediateur: number
  }>
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
    telephone: string
  }>
  conventionsEtFinancements: Readonly<{
    conventions: ReadonlyArray<{
      documents: ReadonlyArray<{
        conseilleNumerique: string
        contratDeTravail: 'CDD' | 'CDI'
        expiration: string
        libelle: string
        lien: string
        lienConseilleNumerique: string
        statut: Statut
        telechargement: string
      }>
      expiration: string
      libelle: string
      statut: Statut
      telechargement: string
    }>
    creditsEngagesParLEtat: string
    enveloppes: ReadonlyArray<{
      color: 'france' | 'menthe' | 'tilleul'
      libelle: string
      montant: number
      montantFormate: string
    }>
    lienConventions: string
  }>
  historiques: ReadonlyArray<HistoriqueViewModel>
  identite: Readonly<{
    adresse: string
    departement: string
    editeur: string
    edition: string
    identifiant: string
    nom: string
    region: string
    siret: string
    typologie: string
  }>
  role: Readonly<{
    feuillesDeRoute: ReadonlyArray<{
      libelle: string
      lien: string
    }>
    membreDepuisLe: string
    roles: ReadonlyArray<RoleViewModel>
  }>
  uid: string
}>

type Statut = Readonly<{
  libelle: 'En cours' | 'Expirée'
  variant: 'error' | 'info' | 'new' | 'success' | 'warning'
}>
