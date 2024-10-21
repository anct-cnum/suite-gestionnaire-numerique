import { inviterUnUtilisateurAction } from './inviterUnUtilisateurAction'
import { InviterUnUtilisateur } from '../../../use-cases/commands/InviterUnUtilisateur'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'

describe('changer mon rôle action', () => {
  it('étant donné une invitation valide quand on invite un utilisateur alors cela invite l’utilisateur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    // @ts-expect-error
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub } })
    vi.spyOn(InviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')

    const inviterUnUtilisateurParams = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      organisation: 'La Poste',
      prenom: 'Martin',
      role: 'Gestionnaire département',
    }

    // WHEN
    const result = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

    // THEN
    expect(InviterUnUtilisateur.prototype.execute).toHaveBeenCalledWith({
      ...inviterUnUtilisateurParams,
      uidUtilisateurCourant: sub,
    })
    expect(result).toBe('OK')
  })

  it('étant donné une invitation invalide quand on invite un utilisateur alors cela renvoie une erreur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    // @ts-expect-error
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub } })
    vi.spyOn(InviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('emailExistant')

    const inviterUnUtilisateurParams = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      organisation: 'La Poste',
      prenom: 'Martin',
      role: 'Gestionnaire département',
    }

    // WHEN
    const result = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

    // THEN
    expect(result).toBe('emailExistant')
  })
})
