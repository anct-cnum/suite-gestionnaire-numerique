// Stryker disable all
import { Action } from './Action'
import { CoFinancement } from './CoFinancement'
import { Comite } from './Comite'
import { DemandeDeSubvention } from './DemandeDeSubvention'
import { Departement, DepartementState } from './Departement'
import { FeuilleDeRoute } from './FeuilleDeRoute'
import { Gouvernance } from './Gouvernance'
import { Membre } from './Membre'
import { membreFactory } from './MembreFactory'
import { TypologieRole } from './Role'
import { UtilisateurFactory } from './UtilisateurFactory'
import { Utilisateur } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

export function utilisateurFactory(
  override?: Partial<
    ConstructorParameters<typeof UtilisateurFactory>[0] &
    Readonly<{ codeOrganisation: string; role: TypologieRole }>
  >
): Utilisateur {
  return new UtilisateurFactory({
    derniereConnexion: epochTime,
    emailDeContact: 'martin.tartempion@example.net',
    inviteLe: epochTime,
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    telephone: '0102030405',
    uid: { email: 'martin.tartempion@example.net', value: 'userFooId' },
    ...override,
  }).create(override?.role ?? 'Instructeur', override?.codeOrganisation)
}

export function gouvernanceFactory(override?: Partial<Parameters<typeof Gouvernance.create>[0]>): Gouvernance {
  return Gouvernance.create({
    departement: {
      code: '75',
      codeRegion: '11',
      nom: 'Paris',
    },
    noteDeContexte: undefined,
    notePrivee: undefined,
    uid: 'gouvernanceFooId',
    ...override,
  })
}

export function comiteFactory(override?: Partial<Parameters<typeof Comite.create>[0]>): Comite {
  return Comite.create({
    commentaire: 'un commentaire',
    date: epochTime,
    dateDeCreation: epochTime,
    dateDeModification: epochTime,
    frequence: 'annuelle',
    type: 'strategique',
    uid: {
      value: 'comiteFooId',
    },
    uidEditeur: {
      email: 'martin.tartempion@example.net',
      value: 'userFooId',
    },
    uidGouvernance: {
      value: 'gouvernanceFooId',
    },
    ...override,
  }) as Comite
}

export function feuilleDeRouteFactory(override?: Partial<Parameters<typeof FeuilleDeRoute.create>[0]>): FeuilleDeRoute {
  return FeuilleDeRoute.create({
    dateDeCreation: epochTime,
    dateDeModification: epochTime,
    nom: 'Feuille de route 69',
    perimetreGeographique: 'departemental',
    uid: {
      value: 'feuilleDeRouteFooId',
    },
    uidEditeur: {
      email: 'martin.tartempion@example.net',
      value: 'userFooId',
    },
    uidGouvernance: {
      value: 'gouvernanceFooId',
    },
    uidPorteur: 'porteurFooId',
    ...override,
  }) as FeuilleDeRoute
}

export function actionFactory(override?: Partial<Parameters<typeof Action.create>[0]>): Action {
  return Action.create({
    besoins: ['besoin 1'],
    budgetGlobal: 10_000,
    contexte: 'Un contexte',
    dateDeCreation: epochTime,
    dateDeDebut: '2024',
    dateDeFin: '2025',
    description: 'Description de test',
    destinataires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
    nom: 'Feuille de route 69',
    uid: {
      value: 'feuilleDeRouteFooId',
    },
    uidCreateur: 'userFooId',
    uidFeuilleDeRoute: {
      value: 'feuilleDeRouteFooId',
    },
    uidPorteurs: ['porteurFooId'],
    ...override,
  }) as Action
}

export function membrePotentielFactory(override?: Partial<Parameters<typeof membreFactory>[0]>): Membre {
  return membreFactory({
    nom: 'La Poste',
    roles: ['observateur'],
    statut: 'candidat',
    uid: {
      value: 'membrePotentielFooId',
    },
    uidGouvernance: {
      value: 'gouvernanceFooId',
    },
    ...override,
  }) as Membre
}

export function membreConfirmeFactory(override?: Partial<Parameters<typeof membreFactory>[0]>): Membre {
  return membreFactory({
    nom: 'La Poste',
    roles: ['observateur'],
    statut: 'confirme',
    uid: {
      value: 'membreConfirmeFooId',
    },
    uidGouvernance: {
      value: 'gouvernanceFooId',
    },
    ...override,
  }) as Membre
}

export function departementFactory(override?: Partial<DepartementState>): Departement {
  return new Departement({
    code: '75',
    codeRegion: '11',
    nom: 'Paris',
    ...override,
  })
}

export function demandeDeSubventionFactory(
  override?: Partial<Parameters<typeof DemandeDeSubvention.create>[0]>
): DemandeDeSubvention {
  return DemandeDeSubvention.create({
    beneficiaires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
    dateDeCreation: epochTime,
    derniereModification: epochTime,
    statut: 'en_cours',
    subventionDemandee: 5000,
    subventionEtp: 2000,
    subventionPrestation: 3000,
    uid: {
      value: 'demandeDeSubventionFooId',
    },
    uidAction: {
      value: 'actionFooId',
    },
    uidCreateur: 'userFooId',
    uidEnveloppeFinancement: {
      value: 'enveloppeFinancementFooId',
    },
    ...override,
  }) as DemandeDeSubvention
}

export function coFinancementFactory(override?: Partial<Parameters<typeof CoFinancement.create>[0]>): CoFinancement {
  return CoFinancement.create({
    montant: 2000,
    uid: {
      value: 'coFinancementFooId',
    },
    uidAction: {
      value: 'actionFooId',
    },
    uidMembre: 'membreFooId',
    ...override,
  }) as CoFinancement
}

