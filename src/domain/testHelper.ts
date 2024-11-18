// Stryker disable all
import { Departement, DepartementState } from './Departement'
import { TypologieRole } from './Role'
import { UtilisateurFactory } from './UtilisateurFactory'
import { Utilisateur } from '@/domain/Utilisateur'

export function utilisateurFactory(
  override?: Partial<
    ConstructorParameters<typeof UtilisateurFactory>[0] &
      Readonly<{ role: TypologieRole; codeOrganisation: string }>
  >
): Utilisateur {
  return new UtilisateurFactory({
    derniereConnexion: new Date(0),
    email: 'martin.tartempion@example.net',
    inviteLe: new Date(0),
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  }).create(override?.role ?? 'Instructeur', override?.codeOrganisation)
}

export function departementFactory(override?: Partial<DepartementState>): Departement {
  return new Departement({
    code: '75',
    codeRegion: '11',
    nom: 'Paris',
    ...override,
  })
}
