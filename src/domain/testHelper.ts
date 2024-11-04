import { Utilisateur } from '@/domain/Utilisateur'

export function utilisateurFactory(
  override?: Partial<Parameters<typeof Utilisateur.create>[0]>
): Utilisateur {
  return Utilisateur.create({
    email: 'martin.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Banque des territoires',
    prenom: 'Martin',
    role: 'Instructeur',
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  })
}
