// Stryker disable all
import { Comite } from './Comite'
import { Departement, DepartementState } from './Departement'
import { Gouvernance } from './Gouvernance'
import { TypologieRole } from './Role'
import { UtilisateurFactory } from './UtilisateurFactory'
import { Utilisateur, UtilisateurUid } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

export function utilisateurFactory(
  override?: Partial<
    ConstructorParameters<typeof UtilisateurFactory>[0] &
    Readonly<{ role: TypologieRole; codeOrganisation: string }>
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
    noteDeContexte: {
      contenu: '<p>contenu HTML</p>',
      dateDeModification: epochTime,
      uidEditeur: new UtilisateurUid(utilisateurFactory().state.uid),
    },
    notePrivee: {
      contenu: 'un contenu quelconque',
      dateDeModification: new Date('2000-01-01'),
      uidEditeur: new UtilisateurUid(utilisateurFactory().state.uid),
    },
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

export function departementFactory(override?: Partial<DepartementState>): Departement {
  return new Departement({
    code: '75',
    codeRegion: '11',
    nom: 'Paris',
    ...override,
  })
}
