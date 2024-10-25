import { modifierMesInformationsPersonnellesAction } from './modifierMesInformationsPersonnellesAction'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { ModifierMesInformationsPersonnelles } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

describe('modifier mes informations personnelles action', () => {
  it('étant donné des informations personnelles correctes quand mes informations personnelles sont modifiées alors cela modifie mon compte', async () => {
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

  it('étant donné un email mal formaté quand mes informations personnelles sont modifiées alors cela ne modifie pas mon compte', async () => {
    // GIVEN
    const email = 'emailNonValide'

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('L’email doit être valide')
  })

  it('étant donné un nom vide quand mes informations personnelles sont modifiées alors cela ne modifie pas mon compte', async () => {
    // GIVEN
    const nom = ''

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le nom doit contenir au moins 1 caractère')
  })

  it('étant donné un prénom vide quand mes informations personnelles sont modifiées alors cela ne modifie pas mon compte', async () => {
    // GIVEN
    const prenom = ''

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le prénom doit contenir au moins 1 caractère')
  })

  it('étant donné un téléphone inférieur à 10 caractères quand mes informations personnelles sont modifiées alors cela ne modifie pas mon compte', async () => {
    // GIVEN
    const telephone = '1234'

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le téléphone doit contenir 10 chiffres')
  })

  it('étant donné un téléphone vide quand mes informations personnelles sont modifiées alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'fooId'
    // @ts-expect-error
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub } })
    vi.spyOn(ModifierMesInformationsPersonnelles.prototype, 'execute').mockResolvedValueOnce('OK')
    const telephone = ''

    // WHEN
    const result = await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)

    // THEN
    expect(result).toBe('OK')
  })

  const email = 'martin.tartempion@example.com'
  const nom = 'Tartempion'
  const prenom = 'Martin'
  const telephone = '0102030405'
})
