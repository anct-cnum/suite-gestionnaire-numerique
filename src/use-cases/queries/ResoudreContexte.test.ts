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

  it('un gestionnaire région a le scope région', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84' })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([{ code: '84', type: 'region' }])
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

  it('un gestionnaire structure sans structure a un scope vide', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_structure', { structureId: null })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([])
  })

  it('les scopes s accumulent — un user avec région et département a les deux', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', {
      departementCode: '69',
      regionCode: '84',
    })

    // WHEN
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // THEN
    expect(contexte.scopes).toStrictEqual([
      { code: '84', type: 'region' },
      { code: '69', type: 'departement' },
    ])
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

  it('peutGererGouvernance — gestionnaire région ne peut pas gérer', async () => {
    // GIVEN
    const utilisateur = utilisateurAvecRole('gestionnaire_region', { regionCode: '84' })
    const contexte = await resoudreContexte(utilisateur, loaderStub())

    // WHEN / THEN
    expect(contexte.peutGererGouvernance('15')).toBe(false)
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
    uid: 'uid-test',
  }
}

type AppartenanceStub = Readonly<{ codeDepartement: string; estCoporteur: boolean }>

function loaderStub(
  options: Readonly<{
    appartenances?: ReadonlyArray<AppartenanceStub>
    departementCode?: string
  }> = {}
): ScopeLoader {
  return {
    getDepartementCodeByStructureId: vi
      .fn<() => Promise<null | string>>()
      .mockResolvedValue(options.departementCode ?? null),
    getToutesAppartenancesParStructureId: vi
      .fn<() => Promise<ReadonlyArray<AppartenanceStub>>>()
      .mockResolvedValue(options.appartenances ?? []),
  }
}
