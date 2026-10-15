import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  complementAdresseDuStandard,
  courrielDuStandard,
  horairesDuStandard,
  nomDuStandard,
  presentationDetailDuStandard,
  presentationResumeDuStandard,
  siretDuStandard,
  sitesWebDuStandard,
  telephoneDuStandard,
  typologiesDuStandard,
  urlDuStandard,
} from './reglesDuStandardLieu'

describe('règles du standard des lieux de médiation numérique', () => {
  it.each([
    { intention: 'un nom renseigné', valeur: 'Médiathèque' },
    { intention: 'un nom entouré d’espaces, nettoyé', valeur: '  Médiathèque  ' },
  ])('le nom accepte $intention', ({ valeur }) => {
    // WHEN
    const resultat = nomDuStandard.safeParse(valeur)

    // THEN
    expect(resultat).toStrictEqual({ data: 'Médiathèque', success: true })
  })

  it('le nom refuse une saisie vide', () => {
    // WHEN
    const resultat = nomDuStandard.safeParse('   ')

    // THEN
    expect(messages(resultat)).toStrictEqual(['Le nom du lieu d’activité doit être renseigné'])
  })

  it.each([
    { intention: 'un SIRET dont la clé de contrôle est juste', valeur: '13002603200016' },
    { intention: 'une saisie vide (pas de SIRET)', valeur: '' },
    { intention: 'une absence de saisie', valeur: undefined },
  ])('le SIRET accepte $intention', ({ valeur }) => {
    // WHEN
    const resultat = siretDuStandard.safeParse(valeur)

    // THEN
    expect(resultat.success).toBe(true)
  })

  it.each([
    { intention: 'un SIRET dont la clé de contrôle est fausse', valeur: '13002603200017' },
    { intention: 'un RIDET : réservé aux structures, un lieu n’a qu’un SIRET', valeur: '1234567' },
    { intention: 'un identifiant de 10 chiffres', valeur: '1234567890' },
    { intention: 'des lettres', valeur: 'ABCDEFGHIJKLMN' },
  ])('le SIRET refuse $intention', ({ valeur }) => {
    // WHEN
    const resultat = siretDuStandard.safeParse(valeur)

    // THEN
    expect(messages(resultat)).toStrictEqual([
      'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle',
    ])
  })

  it.each([
    { intention: 'un complément usuel', valeur: 'Bâtiment B, 2e étage' },
    { intention: 'une saisie vide', valeur: '' },
    { intention: 'une absence de saisie', valeur: undefined },
  ])('le complément d’adresse accepte $intention', ({ valeur }) => {
    // WHEN
    const resultat = complementAdresseDuStandard.safeParse(valeur)

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('le complément d’adresse refuse un caractère que le standard n’accepte pas', () => {
    // WHEN
    const resultat = complementAdresseDuStandard.safeParse('#3')

    // THEN
    expect(messages(resultat)).toStrictEqual([
      'Ce complément contient un caractère que le schéma national n’accepte pas : évitez #, %, les guillemets droits (") et un tiret ou une arobase en tête',
    ])
  })

  it('les typologies acceptent des codes du standard', () => {
    // WHEN
    const resultat = typologiesDuStandard.safeParse(['TIERS_LIEUX', 'BIB'])

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('les typologies refusent un code inconnu du standard', () => {
    // WHEN
    const resultat = typologiesDuStandard.safeParse(['MEDIATHEQUE'])

    // THEN
    expect(messages(resultat)).toStrictEqual(['Typologie inconnue du schéma national : MEDIATHEQUE'])
  })

  it('le résumé de présentation accepte 280 caractères', () => {
    // WHEN
    const resultat = presentationResumeDuStandard.safeParse('a'.repeat(280))

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('le résumé de présentation refuse plus de 280 caractères', () => {
    // WHEN
    const resultat = presentationResumeDuStandard.safeParse('a'.repeat(281))

    // THEN
    expect(messages(resultat)).toStrictEqual(['Le résumé doit faire au plus 280 caractères'])
  })

  it('le détail de présentation refuse plus de 10000 caractères', () => {
    // WHEN
    const resultat = presentationDetailDuStandard.safeParse('a'.repeat(10001))

    // THEN
    expect(messages(resultat)).toStrictEqual(['La présentation détaillée doit faire au plus 10000 caractères'])
  })

  it.each([
    { intention: 'des horaires au format OpenStreetMap', valeur: 'Mo-Fr 09:00-12:00' },
    { intention: 'une saisie vide (horaires effacés)', valeur: '' },
  ])('les horaires acceptent $intention', ({ valeur }) => {
    // WHEN
    const resultat = horairesDuStandard.safeParse(valeur)

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('les horaires refusent un texte libre', () => {
    // WHEN
    const resultat = horairesDuStandard.safeParse('lundi matin')

    // THEN
    expect(messages(resultat)).toStrictEqual(['Les horaires ne respectent pas le format du schéma national'])
  })

  it.each([
    { intention: 'une URL complète', valeur: 'https://rdv.exemple.fr' },
    { intention: 'une saisie vide', valeur: '' },
  ])('l’URL accepte $intention', ({ valeur }) => {
    // WHEN
    const resultat = urlDuStandard.safeParse(valeur)

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('l’URL refuse une adresse sans protocole', () => {
    // WHEN
    const resultat = urlDuStandard.safeParse('rdv.exemple.fr')

    // THEN
    expect(messages(resultat)).toStrictEqual(['Veuillez renseigner une URL valide (https://…)'])
  })

  it('les sites web acceptent plusieurs URL séparées par « | »', () => {
    // WHEN
    const resultat = sitesWebDuStandard.safeParse('https://a.fr|https://b.fr')

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('les sites web refusent une liste dont une URL est invalide', () => {
    // WHEN
    const resultat = sitesWebDuStandard.safeParse('https://a.fr|b.fr')

    // THEN
    expect(messages(resultat)).toStrictEqual(['Veuillez renseigner une URL valide, ou plusieurs séparées par « | »'])
  })

  it.each([
    { attendu: '+33102030405', intention: 'un numéro national', valeur: '01 02 03 04 05' },
    { attendu: '+33102030405', intention: 'un numéro international', valeur: '+33 1 02 03 04 05' },
    { attendu: '', intention: 'une saisie vide (téléphone effacé)', valeur: '' },
    { attendu: undefined, intention: 'une absence de saisie', valeur: undefined },
  ])('le téléphone accepte $intention et le range sous sa forme canonique', ({ attendu, valeur }) => {
    // WHEN
    const resultat = telephoneDuStandard.safeParse(valeur)

    // THEN
    expect(resultat).toStrictEqual({ data: attendu, success: true })
  })

  it('le téléphone refuse un numéro que le standard ne reconnaît pas', () => {
    // WHEN
    const resultat = telephoneDuStandard.safeParse('12')

    // THEN
    expect(messages(resultat)).toStrictEqual(['Veuillez renseigner un numéro de téléphone français ou d’outre-mer'])
  })

  it.each([
    { intention: 'une adresse électronique', valeur: 'contact@exemple.fr' },
    { intention: 'une saisie vide', valeur: '' },
  ])('le courriel accepte $intention', ({ valeur }) => {
    // WHEN
    const resultat = courrielDuStandard.safeParse(valeur)

    // THEN
    expect(resultat.success).toBe(true)
  })

  it('le courriel refuse un texte qui n’en est pas un', () => {
    // WHEN
    const resultat = courrielDuStandard.safeParse('pas un courriel')

    // THEN
    expect(messages(resultat)).toStrictEqual(['Veuillez renseigner une adresse électronique valide'])
  })
})

function messages(resultat: z.SafeParseReturnType<unknown, unknown>): ReadonlyArray<string> {
  return resultat.success ? [] : resultat.error.issues.map(({ message }) => message)
}
