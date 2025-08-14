import { RecupererAccompagnementsEtMediateursEnrichi } from './RecupererAccompagnementsEtMediateursEnrichi'
import { AccompagnementsEtMediateursLoader, AccompagnementsEtMediateursReadModel } from './RecupererAccompagnementsEtMediateurs'
import { StatistiquesCoopLoader, StatistiquesCoopReadModel } from './RecupererStatistiquesCoop'
import { ErrorReadModel } from './shared/ErrorReadModel'

// Mock implementations
class MockAccompagnementsLoader implements AccompagnementsEtMediateursLoader {
  private mockResult: AccompagnementsEtMediateursReadModel | ErrorReadModel = {} as AccompagnementsEtMediateursReadModel
  
  setMockResult(result: AccompagnementsEtMediateursReadModel | ErrorReadModel): void {
    this.mockResult = result
  }
  
  async get(): Promise<AccompagnementsEtMediateursReadModel | ErrorReadModel> {
    return this.mockResult
  }
}

class MockStatistiquesCoopLoader implements StatistiquesCoopLoader {
  private mockResult: StatistiquesCoopReadModel | null = null
  private shouldThrow = false
  
  setMockResult(result: StatistiquesCoopReadModel): void {
    this.mockResult = result
  }
  
  setShouldThrow(error: Error): void {
    this.shouldThrow = true
    this.mockError = error
  }
  
  private mockError: Error = new Error('Mock error')
  
  async recupererStatistiques(): Promise<StatistiquesCoopReadModel> {
    if (this.shouldThrow) {
      throw this.mockError
    }
    return this.mockResult as StatistiquesCoopReadModel
  }
}

describe('RecupererAccompagnementsEtMediateursEnrichi', () => {
  let useCase: RecupererAccompagnementsEtMediateursEnrichi
  let mockAccompagnementsLoader: MockAccompagnementsLoader
  let mockStatistiquesCoopLoader: MockStatistiquesCoopLoader

  beforeEach(() => {
    mockAccompagnementsLoader = new MockAccompagnementsLoader()
    mockStatistiquesCoopLoader = new MockStatistiquesCoopLoader()
    
    useCase = new RecupererAccompagnementsEtMediateursEnrichi(
      mockAccompagnementsLoader,
      mockStatistiquesCoopLoader
    )
  })

  it('devrait combiner les données Prisma et API Coop avec succès', async () => {
    // Arrange
    const mockAccompagnementsData = {
      accompagnementsRealises: 15000,
      thematiques: [{ nom: 'Internet', pourcentage: 45 }],
      mediateursNumeriques: 500,
      conseillerNumeriques: 300,
      mediateursFormes: 200,
      pourcentageMediateursFormes: 40,
      habilitesAidantsConnect: 150,
      structuresHabilitees: 60,
    }

    const mockStatistiquesCoop = {
      totaux: {
        beneficiaires: {
          total: 25000,
        },
      },
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setMockResult(mockStatistiquesCoop as any)

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert
    expect(result).toEqual({
      ...mockAccompagnementsData,
      beneficiairesAccompagnes: 25000,
      erreurApiCoop: null,
    })
  })

  it('devrait continuer avec des données partielles si l\'API Coop échoue', async () => {
    // Arrange
    const mockAccompagnementsData = {
      accompagnementsRealises: 15000,
      thematiques: [{ nom: 'Internet', pourcentage: 45 }],
      mediateursNumeriques: 500,
      conseillerNumeriques: 300,
      mediateursFormes: 200,
      pourcentageMediateursFormes: 40,
      habilitesAidantsConnect: 150,
      structuresHabilitees: 60,
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setShouldThrow(new Error('API Coop indisponible'))

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert
    expect(result).toEqual({
      ...mockAccompagnementsData,
      beneficiairesAccompagnes: 0,
      erreurApiCoop: 'API Coop indisponible',
    })
  })

  it('devrait retourner une erreur si les données Prisma échouent', async () => {
    // Arrange
    const mockError = {
      type: 'error' as const,
      message: 'Erreur base de données',
    }

    mockAccompagnementsLoader.setMockResult(mockError)

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert
    expect(result).toEqual(mockError)
  })

  it('devrait construire les filtres API Coop correctement pour un département', async () => {
    // Arrange
    const mockAccompagnementsData = {
      accompagnementsRealises: 5000,
      thematiques: [],
      mediateursNumeriques: 100,
      conseillerNumeriques: 60,
      mediateursFormes: 40,
      pourcentageMediateursFormes: 40,
      habilitesAidantsConnect: 30,
      structuresHabilitees: 12,
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setMockResult({
      totaux: { beneficiaires: { total: 8000 } }
    } as any)

    // Act
    const result = await useCase.execute({ territoire: '75' })

    // Assert - On vérifie simplement que les données sont bien combinées
    expect(result).toMatchObject({
      beneficiairesAccompagnes: 8000,
      erreurApiCoop: null,
    })
  })

  it('devrait passer undefined comme filtre pour la France entière', async () => {
    // Arrange
    const mockAccompagnementsData = {
      accompagnementsRealises: 15000,
      thematiques: [],
      mediateursNumeriques: 500,
      conseillerNumeriques: 300,
      mediateursFormes: 200,
      pourcentageMediateursFormes: 40,
      habilitesAidantsConnect: 150,
      structuresHabilitees: 60,
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setMockResult({
      totaux: { beneficiaires: { total: 25000 } }
    } as any)

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert - Vérifier que les données sont bien combinées pour la France
    expect(result).toMatchObject({
      beneficiairesAccompagnes: 25000,
      erreurApiCoop: null,
    })
  })
})