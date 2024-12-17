import { RechercherLesStructures, StructureLoader, StructuresReadModel } from './RechercherLesStructures'

describe('rechercher les structures', () => {
  beforeEach(() => {
    spiedCall = null
    spiedArgs = null
  })

  it.each([
    {
      expectedArgs: ['la poste'],
      expectedCall: 'findStructures',
      intention: ': le critère de correspondance est transmis',
    },
    {
      expectedArgs: ['la poste', '06'],
      expectedCall: 'findStructuresByDepartement',
      intention: 'et par département : le critère de correspondance ainsi que le code du département sont transmis',
      zone: { code: '06', type: 'departement' } as const,
    },
    {
      expectedArgs: ['la poste', '93'],
      expectedCall: 'findStructuresByRegion',
      intention: 'et par région : le critère de correspondance ainsi que le code de la région sont transmis',
      zone: { code: '93', type: 'region' } as const,
    },
  ])('recherche de stucture par correspondance du nom $intention', async ({ expectedCall, expectedArgs, zone }) => {
    // GIVEN
    const query = { match: 'la poste', zone }
    const rechercherLesStructures = new RechercherLesStructures(new StructuresLoaderSpy())

    // WHEN
    await rechercherLesStructures.get(query)

    // THEN
    expect(spiedCall).toBe(expectedCall)
    expect(spiedArgs).toStrictEqual(expectedArgs)
  })
})

let spiedCall: keyof StructuresLoaderSpy | null
let spiedArgs: Parameters<typeof StructuresLoaderSpy.prototype.findStructures>
  | Parameters<typeof StructuresLoaderSpy.prototype.findStructuresByDepartement>
  | Parameters<typeof StructuresLoaderSpy.prototype.findStructuresByRegion> | null

class StructuresLoaderSpy implements StructureLoader {
  async findStructures(match: string): Promise<StructuresReadModel> {
    spiedCall = 'findStructures'
    spiedArgs = [match]
    return Promise.resolve([])
  }

  async findStructuresByDepartement(match: string, codeDepartement: string): Promise<StructuresReadModel> {
    spiedCall = 'findStructuresByDepartement'
    spiedArgs = [match, codeDepartement]
    return Promise.resolve([])
  }

  async findStructuresByRegion(match: string, codeRegion: string): Promise<StructuresReadModel> {
    spiedCall = 'findStructuresByRegion'
    spiedArgs = [match, codeRegion]
    return Promise.resolve([])
  }
}