import { describe, expect, it, vi } from 'vitest'

import { RechercherUneEntreprise, SireneLoader } from './RechercherUneEntreprise'

describe('rechercherUneEntreprise', () => {
  it('doit retourner les données d\'une entreprise quand le SIRET existe', async () => {
    // Given
    const mockEntreprise = {
      activitePrincipale: '6201Z - Programmation informatique',
      adresse: '8 RUE DE LONDRES, 75009 PARIS 9',
      categorieJuridiqueCode: '5499',
      categorieJuridiqueLibelle: 'Société par actions simplifiée',
      codePostal: '75009',
      commune: 'PARIS 9',
      denomination: 'GOOGLE FRANCE',
      identifiant: '73282932000074',
    }
    
    const mockSireneLoader: SireneLoader = {
      rechercherParIdentifiant: vi.fn<(siret: string) => 
      Promise<typeof mockEntreprise>>().mockResolvedValue(mockEntreprise),
    }
    
    const rechercherUneEntreprise = new RechercherUneEntreprise(mockSireneLoader)

    // When
    const resultat = await rechercherUneEntreprise.handle({ siret: '73282932000074' })

    // Then
    expect(mockSireneLoader.rechercherParIdentifiant).toHaveBeenCalledWith('73282932000074')
    expect(resultat).toStrictEqual(mockEntreprise)
  })

  it('doit propager l\'erreur quand le loader échoue', async () => {
    // Given
    const mockSireneLoader: SireneLoader = {
      rechercherParIdentifiant: vi.fn<(siret: string) => Promise<never>>().mockRejectedValue(new Error('SIRET inexistant')),
    }
    
    const rechercherUneEntreprise = new RechercherUneEntreprise(mockSireneLoader)

    // When & Then
    await expect(rechercherUneEntreprise.handle({ siret: '12345678901234' }))
      .rejects.toThrow('SIRET inexistant')
  })
})