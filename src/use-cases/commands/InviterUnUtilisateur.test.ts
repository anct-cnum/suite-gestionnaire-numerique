import { InviterUnUtilisateur } from './InviterUnUtilisateur'
import { AddUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur } from '../../domain/Utilisateur'

describe('inviter un utilisateur', () => {
  it('quand j’invite un utilisateur, il est enregistré', async () => {
    // GIVEN
    const repository = new RepositoryStub()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as TypologieRole,
      uidUtilisateurCourant: 'utilisateurAdminUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('OK')
  })

  it('quand j’invite un utilisateur et que je n’ai pas le droit de l’inviter, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositoryStub()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as TypologieRole,
      uidUtilisateurCourant: 'utilisateurGestionnaireUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
  })
})

const utilisateursByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurAdminUid: Utilisateur.create({
    email: 'martin.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Banque des territoires',
    prenom: 'Martin',
    role: 'Instructeur',
    uid: 'utilisateurAdminUid',
  }),
  utilisateurGestionnaireUid: Utilisateur.create({
    email: 'martina.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Dispositif lambda',
    prenom: 'Martine',
    role: 'Gestionnaire région',
    uid: 'utilisateurGestionnaireUid',
  }),
}

class RepositoryStub implements AddUtilisateurRepository {
  async find(uid: string): Promise<Utilisateur | null> {
    return Promise.resolve(utilisateursByUid[uid])
  }
  async add(): Promise<void> {
    return Promise.resolve()
  }
}

