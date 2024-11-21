import { Utilisateur } from '@/domain/Utilisateur'

export function utilisateurFactory(
  override?: Partial<Parameters<typeof Utilisateur.create>[0]>
): Utilisateur {
  return Utilisateur.create({
    derniereConnexion: new Date(0),
    email: 'martin.tartempion@example.net',
    inviteLe: new Date(0),
    isSuperAdmin: false,
    nom: 'Tartempion',
    codeOrganisation: 'Banque des territoires',
    prenom: 'Martin',
    role: 'Instructeur',
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  })
}
