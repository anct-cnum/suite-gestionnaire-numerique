import { describe, expect, it } from 'vitest'

import { filtresDeLAdresse } from './filtresDeLAdresse'

describe('filtres des résultats lus dans l’adresse', () => {
  it('garde les filtres bien formés', () => {
    // WHEN
    const filtres = filtresDeLAdresse({ canal: 'telephone', codePostal: '31670', mois: '2026-11' })

    // THEN
    expect(filtres).toStrictEqual({ canal: 'telephone', codePostal: '31670', mois: '2026-11' })
  })

  it.each([
    { intention: 'un canal inconnu', parametres: { canal: 'courrier' } },
    { intention: 'un code postal mal formé', parametres: { codePostal: '316' } },
    { intention: 'un mois mal formé', parametres: { mois: 'novembre' } },
    { intention: 'un filtre répété', parametres: { mois: ['2026-11', '2026-12'] } },
    { intention: 'des filtres vides', parametres: { canal: '', codePostal: '', mois: '' } },
  ])('ignore $intention : les résultats portent alors sur toute la campagne', ({ parametres }) => {
    // WHEN
    const filtres = filtresDeLAdresse(parametres)

    // THEN
    expect(filtres).toStrictEqual({})
  })
})
