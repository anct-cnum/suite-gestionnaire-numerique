import { inviterUnUtilisateurAction } from './inviterUnUtilisateurAction'
import { profileFactory } from './testHelper'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { InviterUnUtilisateur } from '@/use-cases/commands/InviterUnUtilisateur'

describe('inviter un utilisateur action', () => {
  it('étant donné une invitation valide quand on invite un utilisateur alors cela invite l’utilisateur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(profileFactory({ sub }))
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

  it('étant donné une invitation valide quand on invite un utilisateur qui existe déjà alors cela renvoie une erreur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(profileFactory({ sub }))
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

  it('étant donné une invitation avec un rôle invalide quand on invite un utilisateur alors cela renvoie une erreur', async () => {
    // GIVEN
    const inviterUnUtilisateurParams = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      organisation: 'La Poste',
      prenom: 'Martin',
      role: 'Rôle bidon',
    }

    // WHEN
    const result = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le rôle n’est pas correct')
  })
})
