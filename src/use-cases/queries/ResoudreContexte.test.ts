import { describe, expect, it } from 'vitest'

import { resoudreContexte, ScopeLoader } from './ResoudreContexte'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'
import { epochTime } from '@/shared/testHelper'

describe('résoudre contexte - scopes', () => {
  it('un administrateur dispositif a le scope france', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('administrateur_dispositif')

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([{ type: 'france' }])
  })

  it('un gestionnaire département a le scope département', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '69' })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([{ code: '69', type: 'departement' }])
  })

  it('un gestionnaire région sans structure a le scope région et un scope membre par département de sa région', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84' })
    const loader = loaderStub({ departementsDeLaRegion: ['01', '69'] })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '84', type: 'region' },
      { code: '01', type: 'membre' },
      { code: '69', type: 'membre' },
    ])
    expect(contexte.codesDepartements()).toStrictEqual(['01', '69'])
    expect(contexte.scopeFiltre()).toStrictEqual({ codes: ['01', '69'], type: 'departemental' })
    expect(contexte.nbGouvernances()).toBe(2)
  })

  it('un gestionnaire région dont la structure est coporteur a un scope coporteur sur ce département, membre ailleurs', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84', structureId: 42 })
    const loader = loaderStub({
      appartenances: [
        { codeDepartement: '69', estCoporteur: true },
        { codeDepartement: '01', estCoporteur: false },
      ],
      departementsDeLaRegion: ['01', '38', '69'],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '84', type: 'region' },
      { code: '01', type: 'membre' },
      { code: '38', type: 'membre' },
      { code: '69', type: 'coporteur' },
      { code: '42', type: 'structure' },
    ])
    expect(contexte.nbGouvernances()).toBe(3)
    expect(contexte.estCoporteur()).toBe(true)
  })

  it('un gestionnaire région ignore les appartenances de sa structure hors de sa région', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84', structureId: 42 })
    const loader = loaderStub({
      appartenances: [{ codeDepartement: '75', estCoporteur: true }],
      departementsDeLaRegion: ['01', '69'],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '84', type: 'region' },
      { code: '01', type: 'membre' },
      { code: '69', type: 'membre' },
      { code: '42', type: 'structure' },
    ])
  })

  it('un gestionnaire région avec structure de rattachement reçoit un scope structure (menu « Ma structure »)', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84', structureId: 42 })
    const loader = loaderStub({ departementsDeLaRegion: ['01'] })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.idStructure()).toBe(42)
  })

  it('un gestionnaire groupement a un scope vide', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_groupement')

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([])
  })

  it('un gestionnaire structure co-porteur a les scopes structure et coporteur', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({
      appartenances: [{ codeDepartement: '75', estCoporteur: true }],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '42', type: 'structure' },
      { code: '75', type: 'coporteur' },
    ])
  })

  it('un gestionnaire structure membre simple a les scopes structure et membre', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({
      appartenances: [{ codeDepartement: '64', estCoporteur: false }],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '42', type: 'structure' },
      { code: '64', type: 'membre' },
    ])
  })

  it('un gestionnaire structure multi-appartenance a tous ses scopes', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({
      appartenances: [
        { codeDepartement: '64', estCoporteur: false },
        { codeDepartement: '75', estCoporteur: true },
      ],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '42', type: 'structure' },
      { code: '64', type: 'membre' },
      { code: '75', type: 'coporteur' },
    ])
  })

  it('un gestionnaire département avec une structure reçoit les scopes département et structure, sans les appartenances de la structure aux gouvernances', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '75', structureId: 42 })
    const loader = loaderStub({
      appartenances: [{ codeDepartement: '64', estCoporteur: true }],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '75', type: 'departement' },
      { code: '42', type: 'structure' },
    ])
    expect(contexte.nbGouvernances()).toBe(1)
    expect(contexte.idStructure()).toBe(42)
  })

  it('un gestionnaire département sans structure ne reçoit que le scope département', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '75', structureId: null })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([{ code: '75', type: 'departement' }])
    expect(contexte.idStructure()).toBe(0)
  })

  it('un gestionnaire structure sans structure a un scope vide', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: null })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([])
  })

  it('peutGererStructure — admin peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('administrateur_dispositif')
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, ['15'])).toBe(true)
  })

  it('peutGererStructure — gestionnaire structure de la bonne structure peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, [])).toBe(true)
  })

  it('peutGererStructure — gestionnaire structure d une autre structure ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 99 })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, [])).toBe(false)
  })

  it('peutGererStructure — gestionnaire département du bon code peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '15' })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, ['15'])).toBe(true)
  })

  it('peutGererStructure — gestionnaire département d un autre code ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '93' })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, ['15'])).toBe(false)
  })

  it('peutGererStructure — coporteur du bon département peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 99 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '15', estCoporteur: true }] })
    const contexte = await resoudreContexte(utilisateur, loader)

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, ['15'])).toBe(true)
  })

  it('peutGererStructure — coporteur d un autre département ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 99 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '93', estCoporteur: true }] })
    const contexte = await resoudreContexte(utilisateur, loader)

    // WHEN / THEN
    expect(contexte.peutGererStructure(42, ['15'])).toBe(false)
  })

  it('peutGererGouvernance — admin peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('administrateur_dispositif')
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(true)
  })

  it('peutGererGouvernance — gestionnaire département du bon code peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '15' })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(true)
  })

  it('peutGererGouvernance — gestionnaire département d un autre code ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '93' })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(false)
  })

  it('peutGererGouvernance — gestionnaire structure coporteur du bon département peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '15', estCoporteur: true }] })
    const contexte = await resoudreContexte(utilisateur, loader)

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(true)
  })

  it('peutGererGouvernance — gestionnaire structure coporteur d un autre département ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '93', estCoporteur: true }] })
    const contexte = await resoudreContexte(utilisateur, loader)

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(false)
  })

  it('peutGererGouvernance — gestionnaire structure membre simple ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '15', estCoporteur: false }] })
    const contexte = await resoudreContexte(utilisateur, loader)

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(false)
  })

  it('peutGererGouvernance — gestionnaire région non coporteur ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84' })
    const contexte = await resoudreContexte(utilisateur, loaderStub({ departementsDeLaRegion: ['15'] }))

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(false)
  })

  it('peutGererGouvernance — gestionnaire région dont la structure est coporteur du département peut gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84', structureId: 42 })
    const loader = loaderStub({
      appartenances: [{ codeDepartement: '15', estCoporteur: true }],
      departementsDeLaRegion: ['15', '43'],
    })
    const contexte = await resoudreContexte(utilisateur, loader)

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(true)
    expect(contexte.peutGererGouvernance('43')).toBe(false)
  })

  it('scopeFiltre — administrateur dispositif retourne national', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('administrateur_dispositif')

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopeFiltre()).toStrictEqual({ type: 'national' })
  })

  it('scopeFiltre — gestionnaire département retourne son code', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '69' })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopeFiltre()).toStrictEqual({ codes: ['69'], type: 'departemental' })
  })

  it('scopeFiltre — gestionnaire structure coporteur retourne les codes de ses gouvernances', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({
      appartenances: [
        { codeDepartement: '64', estCoporteur: false },
        { codeDepartement: '75', estCoporteur: true },
      ],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopeFiltre()).toStrictEqual({ codes: ['64', '75'], type: 'departemental' })
  })

  it('scopeFiltre — gestionnaire structure membre simple retourne son id de structure', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({
      appartenances: [{ codeDepartement: '64', estCoporteur: false }],
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.scopeFiltre()).toStrictEqual({ id: 42, type: 'structure' })
  })

  it('scopeFiltre — gestionnaire structure sans gouvernance retourne son id de structure', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopeFiltre()).toStrictEqual({ id: 42, type: 'structure' })
  })

  it('estCoporteur — gestionnaire structure coporteur retourne true', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '75', estCoporteur: true }] })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.estCoporteur()).toBe(true)
  })

  it('estCoporteur — gestionnaire structure membre simple retourne false', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })
    const loader = loaderStub({ appartenances: [{ codeDepartement: '75', estCoporteur: false }] })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loader)

    // THEN
    expect(contexte.estCoporteur()).toBe(false)
  })

  it('estCoporteur — gestionnaire structure sans gouvernance retourne false', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: 42 })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.estCoporteur()).toBe(false)
  })

  it('le contexte contient le rôle de l utilisateur', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_departement', { departementCode: '69' })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.role).toBe('gestionnaire_departement')
  })
})

function utilisateurAvecRole(
  type: UnUtilisateurReadModel['role']['type'],
  overrides: Partial<Pick<UnUtilisateurReadModel, 'departementCode' | 'regionCode' | 'structureId'>> = {}
): UnUtilisateurReadModel {
  return {
    departementCode: overrides.departementCode ?? null,
    derniereConnexion: epochTime,
    displayMenusPilotage: false,
    email: 'test@example.com',
    groupementId: null,
    inviteLe: epochTime,
    isActive: true,
    isBetaTesteur: false,
    isGestionnaireDepartement: type === 'gestionnaire_departement',
    isSuperAdmin: false,
    nom: 'Doe',
    prenom: 'John',
    regionCode: overrides.regionCode ?? null,
    role: {
      categorie: 'anct',
      doesItBelongToGroupeAdmin: type === 'administrateur_dispositif',
      nom: type,
      organisation: 'Test',
      rolesGerables: [],
      type,
    },
    structureId: overrides.structureId ?? null,
    telephone: '',
    uid: 1,
  }
}

type AppartenanceStub = Readonly<{ codeDepartement: string; estCoporteur: boolean }>

function loaderStub(
  options: Readonly<{
    appartenances?: ReadonlyArray<AppartenanceStub>
    departementCode?: string
    departementsDeLaRegion?: ReadonlyArray<string>
  }> = {}
): ScopeLoader {
  return {
    getDepartementCodeByStructureId: vi
      .fn<() => Promise<null | string>>()
      .mockResolvedValue(options.departementCode ?? null),
    getDepartementsByRegionCode: vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValue(options.departementsDeLaRegion ?? []),
    getToutesAppartenancesParStructureId: vi
      .fn<() => Promise<ReadonlyArray<AppartenanceStub>>>()
      .mockResolvedValue(options.appartenances ?? []),
  }
}
