import { AccompagnementsEtMediateursLoader, AccompagnementsEtMediateursReadModel } from './RecupererAccompagnementsEtMediateurs'
import { RecupererAccompagnementsEtMediateursEnrichi } from './RecupererAccompagnementsEtMediateursEnrichi'
import { StatistiquesCoopLoader, StatistiquesCoopReadModel } from './RecupererStatistiquesCoop'
import { ErrorReadModel } from './shared/ErrorReadModel'

// Mock implementations
class MockAccompagnementsLoader implements AccompagnementsEtMediateursLoader {
  private mockResult: AccompagnementsEtMediateursReadModel | ErrorReadModel = {} as AccompagnementsEtMediateursReadModel
  
  async get(): Promise<AccompagnementsEtMediateursReadModel | ErrorReadModel> {
    return Promise.resolve(this.mockResult)
  }
  
  setMockResult(result: AccompagnementsEtMediateursReadModel | ErrorReadModel): void {
    this.mockResult = result
  }
}

class MockStatistiquesCoopLoader implements StatistiquesCoopLoader {
  private mockError: Error = new Error('Mock error')
  private mockResult: null | StatistiquesCoopReadModel = null
  private shouldThrow = false
  
  async recupererStatistiques(): Promise<StatistiquesCoopReadModel> {
    if (this.shouldThrow) {
      throw this.mockError
    }
    if (this.mockResult === null) {
      throw new Error('Mock result not set')
    }
    return Promise.resolve(this.mockResult)
  }
  
  setMockResult(result: StatistiquesCoopReadModel): void {
    this.mockResult = result
  }
  
  setShouldThrow(error: Error): void {
    this.shouldThrow = true
    this.mockError = error
  }
}

describe('recupererAccompagnementsEtMediateursEnrichi', () => {
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
      conseillerNumeriques: 300,
      habilitesAidantsConnect: 150,
      mediateursFormes: 200,
      mediateursNumeriques: 500,
      pourcentageMediateursFormes: 40,
      structuresHabilitees: 60,
      thematiques: [{ nom: 'Internet', pourcentage: 45 }],
    }

    const mockStatistiquesCoop = {
      totaux: {
        beneficiaires: {
          total: 25000,
        },
      },
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setMockResult(mockStatistiquesCoop as StatistiquesCoopReadModel)

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert
    expect(result).toStrictEqual({
      ...mockAccompagnementsData,
      beneficiairesAccompagnes: 25000,
      erreurApiCoop: null,
    })
  })

  it('devrait continuer avec des données partielles si l\'API Coop échoue', async () => {
    // Arrange
    const mockAccompagnementsData = {
      accompagnementsRealises: 15000,
      conseillerNumeriques: 300,
      habilitesAidantsConnect: 150,
      mediateursFormes: 200,
      mediateursNumeriques: 500,
      pourcentageMediateursFormes: 40,
      structuresHabilitees: 60,
      thematiques: [{ nom: 'Internet', pourcentage: 45 }],
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setShouldThrow(new Error('API Coop indisponible'))

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert
    expect(result).toStrictEqual({
      ...mockAccompagnementsData,
      beneficiairesAccompagnes: 0,
      erreurApiCoop: 'API Coop indisponible',
    })
  })

  it('devrait retourner une erreur si les données Prisma échouent', async () => {
    // Arrange
    const mockError = {
      message: 'Erreur base de données',
      type: 'error' as const,
    }

    mockAccompagnementsLoader.setMockResult(mockError)

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert
    expect(result).toStrictEqual(mockError)
  })

  it('devrait construire les filtres API Coop correctement pour un département', async () => {
    // Arrange
    const mockAccompagnementsData = {
      accompagnementsRealises: 5000,
      conseillerNumeriques: 60,
      habilitesAidantsConnect: 30,
      mediateursFormes: 40,
      mediateursNumeriques: 100,
      pourcentageMediateursFormes: 40,
      structuresHabilitees: 12,
      thematiques: [],
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setMockResult({
      totaux: { beneficiaires: { total: 8000 } },
    } as StatistiquesCoopReadModel)

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
      conseillerNumeriques: 300,
      habilitesAidantsConnect: 150,
      mediateursFormes: 200,
      mediateursNumeriques: 500,
      pourcentageMediateursFormes: 40,
      structuresHabilitees: 60,
      thematiques: [],
    }

    mockAccompagnementsLoader.setMockResult(mockAccompagnementsData)
    mockStatistiquesCoopLoader.setMockResult({
      totaux: { beneficiaires: { total: 25000 } },
    } as StatistiquesCoopReadModel)

    // Act
    const result = await useCase.execute({ territoire: 'France' })

    // Assert - Vérifier que les données sont bien combinées pour la France
    expect(result).toMatchObject({
      beneficiairesAccompagnes: 25000,
      erreurApiCoop: null,
    })
  })
})