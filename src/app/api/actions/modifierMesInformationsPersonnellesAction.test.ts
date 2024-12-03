import * as nextCache from 'next/cache'

import { modifierMesInformationsPersonnellesAction } from './modifierMesInformationsPersonnellesAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierMesInformationsPersonnelles } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

describe('modifier mes informations personnelles action', () => {
  it('si les informations personnelles sont correctes, alors c’est valide', async () => {
    // GIVEN
    const path = '/mes-informations-personnelles'
    const sub = 'fooId'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(ModifierMesInformationsPersonnelles.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact,
      nom,
      path,
      prenom,
      telephone,
    })

    // THEN
    expect(ModifierMesInformationsPersonnelles.prototype.execute).toHaveBeenCalledWith({
      modification: {
        emailDeContact: 'martin.tartempion@example.com',
        nom: 'Tartempion',
        prenom: 'Martin',
        telephone: '0102030405',
      },
      uid: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(messages).toStrictEqual(['OK'])
  })

  it('si l’e-mail est mal formaté alors, s’affiche un message d’erreur', async () => {
    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({ emailDeContact: 'emailNonValide', nom, path, prenom, telephone })

    // THEN
    expect(messages).toStrictEqual(['L’email doit être valide'])
  })

  it('si le nom est vide alors s’affiche un message d’erreur car il doit contenir au moins un caractère', async () => {
    // GIVEN
    const nomVide = ''

    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact,
      nom: nomVide,
      path,
      prenom,
      telephone,
    })

    // THEN
    expect(messages).toStrictEqual(['Le nom doit contenir au moins 1 caractère'])
  })

  it('si le prénom est vide alors s’affiche un message d’erreur car il doit contenir au moins un caractère', async () => {
    // GIVEN
    const prenomVide = ''

    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact,
      nom,
      path,
      prenom: prenomVide,
      telephone,
    })

    // THEN
    expect(messages).toStrictEqual(['Le prénom doit contenir au moins 1 caractère'])
  })

  it('si le path est vide alors cela renvoie une erreur car il doit contenir au moins un caractère', async () => {
    // GIVEN
    const pathIncorrect = ''

    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact,
      nom,
      // @ts-expect-error
      path: pathIncorrect,
      prenom,
      telephone,
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin n’est pas correct'])
  })

  it.each([
    '1234',
    '+1234',
    '+1234567890123478',
    '1234567890123478',
  ])('si le téléphone est mal formaté, alors s’affiche un message d’erreur', async (telephoneMalFormate) => {
    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact,
      nom,
      path,
      prenom,
      telephone: telephoneMalFormate,
    })

    // THEN
    expect(messages).toStrictEqual(['Le téléphone doit être au format 0102030405 ou +33102030405'])
  })

  it('si le téléphone est vide, alors c’est valide car il n’est pas obligatoire', async () => {
    // GIVEN
    const sub = 'fooId'
    const telephoneVide = ''
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(ModifierMesInformationsPersonnelles.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact,
      nom,
      path,
      prenom,
      telephone: telephoneVide,
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })

  const emailDeContact = 'martin.tartempion@example.com'
  const nom = 'Tartempion'
  const prenom = 'Martin'
  const telephone = '0102030405'
  const path = '/'
})
