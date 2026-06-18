import { describe, expect, it } from 'vitest'

import { ModifierNomStructure } from './ModifierNomStructure'
import {
  ModifierNomStructureData,
  ModifierNomStructureRepository,
  NomActuelStructure,
} from './shared/StructureRepository'

describe('modifier le nom d’une structure', () => {
  it('enregistre le nom saisi (espaces retirés) sur une structure « antenne »', async () => {
    // GIVEN
    const lireNomStructure = lecture({ denominationAntenne: 'ville de Villiers sur Marne' })
    const modifierNom = ecriture(true)

    // WHEN
    const result = await new ModifierNomStructure({ lireNomStructure, modifierNom }).handle({
      nomAffichage: '  Paris Est Marne et Bois  ',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('OK')
    expect(modifierNom).toHaveBeenCalledWith({ denominationAntenne: 'Paris Est Marne et Bois', structureId: 978 })
  })

  it('efface le nom d’affichage (null) quand le champ est vide — retombe sur le nom SIRENE', async () => {
    // GIVEN
    const lireNomStructure = lecture({ denominationAntenne: 'ville de Villiers sur Marne' })
    const modifierNom = ecriture(true)

    // WHEN
    await new ModifierNomStructure({ lireNomStructure, modifierNom }).handle({ nomAffichage: '   ', structureId: 978 })

    // THEN
    expect(modifierNom).toHaveBeenCalledWith({ denominationAntenne: null, structureId: 978 })
  })

  it('refuse de renommer une structure canonique (denomination_antenne null)', async () => {
    // GIVEN
    const lireNomStructure = lecture({ denominationAntenne: null })
    const modifierNom = ecriture(true)

    // WHEN
    const result = await new ModifierNomStructure({ lireNomStructure, modifierNom }).handle({
      nomAffichage: 'Nouveau nom',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('structureCanoniqueNonRenommable')
    expect(modifierNom).not.toHaveBeenCalled()
  })

  it('renvoie une erreur quand la structure est introuvable', async () => {
    // GIVEN
    const lireNomStructure = lecture(null)

    // WHEN
    const result = await new ModifierNomStructure({ lireNomStructure, modifierNom: ecriture(true) }).handle({
      nomAffichage: 'Nouveau nom',
      structureId: 0,
    })

    // THEN
    expect(result).toBe('structureIntrouvable')
  })

  it('remonte un conflit d’unicité quand le nom est déjà utilisé pour ce SIRET', async () => {
    // GIVEN
    const lireNomStructure = lecture({ denominationAntenne: 'antenne A' })

    // WHEN
    const result = await new ModifierNomStructure({ lireNomStructure, modifierNom: ecriture(false) }).handle({
      nomAffichage: 'antenne B',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('nomDejaUtilise')
  })
})

function lecture(resultat: NomActuelStructure | null): ModifierNomStructureRepository['lireNomStructure'] {
  return vi.fn<(structureId: number) => Promise<NomActuelStructure | null>>().mockResolvedValue(resultat)
}

function ecriture(succes: boolean): ModifierNomStructureRepository['modifierNom'] {
  return vi.fn<(data: ModifierNomStructureData) => Promise<boolean>>().mockResolvedValue(succes)
}
