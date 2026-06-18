import { describe, expect, it } from 'vitest'

import { ModifierNomStructure } from './ModifierNomStructure'
import { ModifierNomStructureData, ModifierNomStructureRepository } from './shared/StructureRepository'

describe('modifier le nom d’une structure', () => {
  it('enregistre le nom saisi (espaces retirés) comme nom d’affichage', async () => {
    // GIVEN
    const modifierNom = vi.fn<(data: ModifierNomStructureData) => Promise<void>>().mockResolvedValue(undefined)
    const repository: ModifierNomStructureRepository = { modifierNom }

    // WHEN
    const result = await new ModifierNomStructure(repository).handle({
      nomAffichage: '  Paris Est Marne et Bois  ',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('OK')
    expect(modifierNom).toHaveBeenCalledWith({ denominationAntenne: 'Paris Est Marne et Bois', structureId: 978 })
  })

  it('efface le nom d’affichage (null) quand le champ est vide — retombe sur le nom SIRENE', async () => {
    // GIVEN
    const modifierNom = vi.fn<(data: ModifierNomStructureData) => Promise<void>>().mockResolvedValue(undefined)

    // WHEN
    await new ModifierNomStructure({ modifierNom }).handle({ nomAffichage: '   ', structureId: 978 })

    // THEN
    expect(modifierNom).toHaveBeenCalledWith({ denominationAntenne: null, structureId: 978 })
  })
})
