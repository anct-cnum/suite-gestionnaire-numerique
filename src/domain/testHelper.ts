// Stryker disable all
import { Departement, DepartementState } from './Departement'
import { FactoryParams, Gouvernance } from './Gouvernance'
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
    uid: { email: 'martin.tartempion@example.net', value: 'fooId' },
    ...override,
  }).create(override?.role ?? 'Instructeur', override?.codeOrganisation)
}

export function gouvernanceFactory(override?: Partial<FactoryParams>): Gouvernance {
  return Gouvernance.create({
    noteDeContexte: {
      contenu: '<p>contenu HTML</p>',
      dateDeModification: new Date(0),
      uidUtilisateurLAyantModifie: new UtilisateurUid(utilisateurFactory().state.uid),
    },
    uid: 'fooGouvernanceUid',
    utilisateurUid: {
      email: 'martin.tartempion@example.net',
      value: 'fooId',
    },
    ...override,
  })
}

export function departementFactory(override?: Partial<DepartementState>): Departement {
  return new Departement({
    code: '75',
    codeRegion: '11',
    nom: 'Paris',
    ...override,
  })
}
