import { describe, expect, it } from 'vitest'

import { blocsParContexte } from './registreBlocs'
import { Contexte, Scope } from '@/use-cases/queries/ResoudreContexte'

describe('blocs par contexte', () => {
  it('un gestionnaire de structure membre simple (non coporteur) voit le tableau de bord de sa structure', () => {
    // GIVEN
    const contexte = new Contexte('gestionnaire_structure', [
      { code: '42', type: 'structure' },
      { code: '93', type: 'membre' },
    ])

    // WHEN
    const blocs = blocsParContexte(contexte)

    // THEN
    expect(blocs).toContain('donneesStructure')
    expect(blocs).toContain('financements')
    expect(blocs).not.toContain('etatDesLieux')
    expect(blocs).not.toContain('gouvernance')
    expect(blocs).not.toContain('rejoindreGouvernance')
  })

  it('un gestionnaire de structure coporteur voit la vue départementale de la gouvernance', () => {
    // GIVEN
    const contexte = new Contexte('gestionnaire_structure', [
      { code: '42', type: 'structure' },
      { code: '93', type: 'coporteur' },
    ])

    // WHEN
    const blocs = blocsParContexte(contexte)

    // THEN
    expect(blocs).toContain('etatDesLieux')
    expect(blocs).toContain('gouvernance')
    expect(blocs).toContain('financements')
    expect(blocs).not.toContain('donneesStructure')
  })

  it('un gestionnaire de structure hors gouvernance voit sa structure et l’invitation à rejoindre une gouvernance', () => {
    // GIVEN
    const contexte = new Contexte('gestionnaire_structure', [{ code: '42', type: 'structure' }])

    // WHEN
    const blocs = blocsParContexte(contexte)

    // THEN
    expect(blocs).toContain('donneesStructure')
    expect(blocs).toContain('rejoindreGouvernance')
    expect(blocs).toContain('cartographie')
    expect(blocs).not.toContain('etatDesLieux')
    expect(blocs).not.toContain('gouvernance')
  })

  it.each([
    {
      intention: 'administrateur dispositif',
      role: 'administrateur_dispositif' as const,
      scopes: [{ type: 'france' } as Scope],
    },
    {
      intention: 'gestionnaire département',
      role: 'gestionnaire_departement' as const,
      scopes: [{ code: '93', type: 'departement' } as Scope],
    },
  ])('un $intention voit la vue départementale, les financements et les bénéficiaires', ({ role, scopes }) => {
    // GIVEN
    const contexte = new Contexte(role, scopes)

    // WHEN
    const blocs = blocsParContexte(contexte)

    // THEN
    expect(blocs).toContain('etatDesLieux')
    expect(blocs).toContain('gouvernance')
    expect(blocs).toContain('financements')
    expect(blocs).toContain('beneficiaires')
    expect(blocs).not.toContain('donneesStructure')
  })
})
