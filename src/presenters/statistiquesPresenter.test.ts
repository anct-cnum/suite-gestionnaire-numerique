import { describe, expect, it } from 'vitest'

import {
  accompagnementsAffiches,
  periodeStatistiquesPresenter,
  tableauAccompagnementsPresenter,
} from './statistiquesPresenter'

describe('statistiques presenter', () => {
  describe(accompagnementsAffiches, () => {
    it('garde toutes les périodes quand il y en a 30 ou moins', () => {
      // GIVEN
      const donnees = jours(30)

      // WHEN
      const affiches = accompagnementsAffiches(donnees)

      // THEN
      expect(affiches).toStrictEqual(donnees)
    })

    it('ne garde que les 30 dernières périodes au-delà, comme l’histogramme', () => {
      // GIVEN
      const donnees = jours(31)

      // WHEN
      const affiches = accompagnementsAffiches(donnees)

      // THEN
      expect(affiches).toHaveLength(30)
      expect(affiches[0]).toStrictEqual(donnees[1])
      expect(affiches.at(-1)).toStrictEqual(donnees[30])
    })
  })

  describe(tableauAccompagnementsPresenter, () => {
    it('par mois : mois en toutes lettres et nombre exact, avec les en-têtes de colonnes', () => {
      // GIVEN
      const donnees = [
        { count: 2813, label: '11/25' },
        { count: 0, label: '12/25' },
        { count: 1234567, label: '01/26' },
      ]

      // WHEN
      const tableau = tableauAccompagnementsPresenter(donnees, 'mois')

      // THEN
      expect(tableau).toStrictEqual({
        caption: 'Nombre d’accompagnements par mois',
        enTetes: ['Mois', 'Accompagnements'],
        lignes: [
          ['novembre 2025', '2 813'],
          ['décembre 2025', '0'],
          ['janvier 2026', '1 234 567'],
        ],
      })
    })

    it('par mois : au-delà de 12 mois, ne garde que les 12 derniers, comme l’histogramme, et le dit', () => {
      // GIVEN
      const donnees = [
        ...Array.from({ length: 12 }, (_, index) => ({
          count: index,
          label: `${String(index + 1).padStart(2, '0')}/25`,
        })),
        { count: 12, label: '01/26' },
      ]

      // WHEN
      const tableau = tableauAccompagnementsPresenter(donnees, 'mois')

      // THEN
      expect(tableau.caption).toBe('Nombre d’accompagnements par mois, 12 derniers mois de la période')
      expect(tableau.lignes).toHaveLength(12)
      expect(tableau.lignes[0]).toStrictEqual(['février 2025', '1'])
      expect(tableau.lignes.at(-1)).toStrictEqual(['janvier 2026', '12'])
    })

    it('par jour : jour en toutes lettres (« 1er » pour le premier du mois) et nombre exact', () => {
      // GIVEN
      const donnees = [
        { count: 12, label: '31/10' },
        { count: 121, label: '01/11' },
        { count: 0, label: '02/11' },
      ]

      // WHEN
      const tableau = tableauAccompagnementsPresenter(donnees, 'jour')

      // THEN
      expect(tableau).toStrictEqual({
        caption: 'Nombre d’accompagnements par jour',
        enTetes: ['Jour', 'Accompagnements'],
        lignes: [
          ['31 octobre', '12'],
          ['1er novembre', '121'],
          ['2 novembre', '0'],
        ],
      })
    })

    it('par jour : au-delà de 30 jours, suit l’histogramme (30 derniers jours) et le dit dans le titre', () => {
      // GIVEN
      const donnees = jours(45)

      // WHEN
      const tableau = tableauAccompagnementsPresenter(donnees, 'jour')

      // THEN
      expect(tableau.caption).toBe('Nombre d’accompagnements par jour, 30 derniers jours de la période')
      expect(tableau.lignes).toHaveLength(30)
      expect(tableau.lignes[0]).toStrictEqual(['16 janvier', '15'])
      expect(tableau.lignes.at(-1)).toStrictEqual(['14 février', '44'])
    })

    it('garde le libellé d’origine s’il n’a pas le format attendu', () => {
      // GIVEN
      const donnees = [{ count: 3, label: 'inconnu' }]

      // WHEN
      const tableau = tableauAccompagnementsPresenter(donnees, 'mois')

      // THEN
      expect(tableau.lignes).toStrictEqual([['inconnu', '3']])
    })
  })

  describe(periodeStatistiquesPresenter, () => {
    it.each([
      { attendu: 'Données du 1er janvier 2026 au 30 juin 2026', au: '2026-06-30', du: '2026-01-01' },
      { attendu: 'Données du 17 novembre 2020 au 1er décembre 2026', au: '2026-12-01', du: '2020-11-17' },
    ])('annonce la période affichée en toutes lettres : $attendu', ({ attendu, au, du }) => {
      // WHEN
      const periode = periodeStatistiquesPresenter(du, au)

      // THEN
      expect(periode).toBe(attendu)
    })
  })
})

// 1er janvier, 2 janvier… : un jour par élément, nombre = rang
function jours(nombre: number): ReadonlyArray<Readonly<{ count: number; label: string }>> {
  return Array.from({ length: nombre }, (_, index) => {
    const mois = index < 31 ? 1 : 2
    const jour = index < 31 ? index + 1 : index - 30
    return { count: index, label: `${String(jour).padStart(2, '0')}/${String(mois).padStart(2, '0')}` }
  })
}
