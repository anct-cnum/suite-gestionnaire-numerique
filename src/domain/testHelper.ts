// Stryker disable all
import { Comite, ComiteFactoryParams, ComiteUid } from './Comite'
import { Departement, DepartementState } from './Departement'
import { GouvernanceFactoryParams, Gouvernance } from './Gouvernance'
import { TypologieRole } from './Role'
import { UtilisateurFactory } from './UtilisateurFactory'
import { Utilisateur, UtilisateurUid } from '@/domain/Utilisateur'

export function utilisateurFactory(
  override?: Partial<
    ConstructorParameters<typeof UtilisateurFactory>[0] &
      Readonly<{ role: TypologieRole; codeOrganisation: string }>
  >
): Utilisateur {
  return new UtilisateurFactory({
    derniereConnexion: new Date(0),
    emailDeContact: 'martin.tartempion@example.net',
    inviteLe: new Date(0),
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    telephone: '0102030405',
    uid: { email: 'martin.tartempion@example.net', value: 'userFooId' },
    ...override,
  }).create(override?.role ?? 'Instructeur', override?.codeOrganisation)
}

export function gouvernanceFactory(override?: Partial<GouvernanceFactoryParams>): Gouvernance {
  return Gouvernance.create({
    comites: [new ComiteUid(String(new Date(0).getTime()))],
    noteDeContexte: {
      contenu: '<p>contenu HTML</p>',
      dateDeModification: new Date(0),
      uidUtilisateurLAyantModifiee: new UtilisateurUid(utilisateurFactory().state.uid),
    },
    uid: 'fooGouvernanceUid',
    utilisateurUid: {
      email: 'martin.tartempion@example.net',
      value: 'userFooId',
    },
    ...override,
  })
}

export function comiteFactory(override?: Partial<ComiteFactoryParams>): Comite {
  return Comite.create({
    commentaire: 'un commentaire',
    date: '1970-01-01',
    dateDeCreation: '1970-01-01T00:00:00.000Z',
    dateDeModification: '1970-01-01T00:00:00.000Z',
    frequence: 'Annuelle',
    type: 'Stratégique',
    uid: '',
    uidUtilisateurCourant: {
      email: 'martin.tartempion@example.net',
      value: 'userFooId',
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
