import { modifierMesInformationsPersonnellesAction } from './modifierMesInformationsPersonnellesAction'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { ModifierMesInformationsPersonnelles } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

describe('modifier mes informations personnelles action', () => {
  it('si les informations personnelles sont correctes alors c’est valide', async () => {
    // GIVEN
    const sub = 'fooId'
    // @ts-expect-error
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub } })
    vi.spyOn(ModifierMesInformationsPersonnelles.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)

    // THEN
    expect(ModifierMesInformationsPersonnelles.prototype.execute).toHaveBeenCalledWith({
      modification: {
        email: 'martin.tartempion@example.com',
        nom: 'Tartempion',
        prenom: 'Martin',
        telephone: '0102030405',
      },
      uid: sub,
    })
    expect(result).toBe('OK')
  })

  it('si l’e-mail est mal formaté alors s’affiche un message d’erreur', async () => {
    // WHEN
    const result = await modifierMesInformationsPersonnellesAction('emailNonValide', nom, prenom, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('L’email doit être valide')
  })

  it('si le nom est vide alors s’affiche un message d’erreur car il doit contenir au moins un caractère', async () => {
    // GIVEN
    const nomVide = ''

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nomVide, prenom, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le nom doit contenir au moins 1 caractère')
  })

  it('si le prénom est vide alors s’affiche un message d’erreur car il doit contenir au moins un caractère', async () => {
    // GIVEN
    const prenomVide = ''

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenomVide, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le prénom doit contenir au moins 1 caractère')
  })

  it.each([
    '1234',
    '+1234',
    '+1234567890123478',
    '1234567890123478',
  ])('si le téléphone est mal formaté alors s’affiche un message d’erreur', async (telephoneMalFormate) => {
    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephoneMalFormate)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le téléphone doit être au format 0102030405 ou +33102030405')
  })

  it('si le téléphone est vide alors c’est valide car il n’est pas obligatoire', async () => {
    // GIVEN
    // @ts-expect-error
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub: 'fooId' } })
    vi.spyOn(ModifierMesInformationsPersonnelles.prototype, 'execute').mockResolvedValueOnce('OK')
    const telephoneVide = ''

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephoneVide)

    // THEN
    expect(result).toBe('OK')
  })

  const email = 'martin.tartempion@example.com'
  const nom = 'Tartempion'
  const prenom = 'Martin'
  const telephone = '0102030405'
})
