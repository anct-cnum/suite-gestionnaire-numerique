/* eslint-disable camelcase */
import { RecupererTerritoireUtilisateur, TerritoireDepartementsLoader, TerritoireReadModel } from './RecupererTerritoireUtilisateur'
import { RoleUtilisateur, UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

describe('récupérer territoire utilisateur', () => {
  it('quand l\'utilisateur est administrateur alors le territoire est France', async () => {
    // GIVEN
    const utilisateur = createUtilisateurReadModel({ role: 'administrateur_dispositif' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub())

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['France'],
      type: 'france',
    })
  })

  it('quand l\'utilisateur est gestionnaire département alors le territoire est le département', async () => {
    // GIVEN
    const utilisateur = createUtilisateurReadModel({ departementCode: '69', role: 'gestionnaire_departement' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub())

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['69'],
      type: 'departement',
    })
  })

  it('quand l\'utilisateur est gestionnaire région alors le territoire est la région', async () => {
    // GIVEN
    const utilisateur = createUtilisateurReadModel({ regionCode: '84', role: 'gestionnaire_region' })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub())

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['84'],
      type: 'region',
    })
  })

  it('quand l\'utilisateur est gestionnaire structure alors le territoire est le département de la structure', async () => {
    // GIVEN
    const utilisateur = createUtilisateurReadModel({ role: 'gestionnaire_structure', structureId: 123 })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub('75'))

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: ['75'],
      type: 'departement',
    })
  })

  it('quand l\'utilisateur est gestionnaire structure sans département alors le territoire est vide', async () => {
    // GIVEN
    const utilisateur = createUtilisateurReadModel({ role: 'gestionnaire_structure', structureId: 123 })
    const queryHandler = new RecupererTerritoireUtilisateur(new TerritoireDepartementsLoaderStub(null))

    // WHEN
    const territoire = await queryHandler.handle(utilisateur)

    // THEN
    expect(territoire).toStrictEqual<TerritoireReadModel>({
      codes: [],
      type: 'departement',
    })
  })
})

function createUtilisateurReadModel(
  overrides: { role: RoleUtilisateur } & Partial<Omit<UnUtilisateurReadModel, 'role'>>
): UnUtilisateurReadModel {
  const roleDefaults: Record<RoleUtilisateur, { nom: string; organisation: string }> = {
    administrateur_dispositif: { nom: 'Administrateur dispositif', organisation: 'ANCT' },
    gestionnaire_departement: { nom: 'Gestionnaire département', organisation: 'Préfecture' },
    gestionnaire_groupement: { nom: 'Gestionnaire groupement', organisation: 'Groupement' },
    gestionnaire_region: { nom: 'Gestionnaire région', organisation: 'Région' },
    gestionnaire_structure: { nom: 'Gestionnaire structure', organisation: 'Structure' },
  }

  const roleInfo = roleDefaults[overrides.role]

  return {
    departementCode: overrides.departementCode ?? null,
    // eslint-disable-next-line no-restricted-syntax
    derniereConnexion: overrides.derniereConnexion ?? new Date(),
    displayMenusPilotage: overrides.role === 'gestionnaire_departement' || overrides.role === 'gestionnaire_structure',
    email: overrides.email ?? 'test@example.fr',
    groupementId: overrides.groupementId ?? null,
    // eslint-disable-next-line no-restricted-syntax
    inviteLe: overrides.inviteLe ?? new Date(),
    isActive: overrides.isActive ?? true,
    isGestionnaireDepartement: overrides.role === 'gestionnaire_departement',
    isSuperAdmin: overrides.isSuperAdmin ?? false,
    nom: overrides.nom ?? 'Dupont',
    prenom: overrides.prenom ?? 'Jean',
    regionCode: overrides.regionCode ?? null,
    role: {
      categorie: 'prefet',
      doesItBelongToGroupeAdmin: overrides.role === 'administrateur_dispositif',
      nom: roleInfo.nom,
      organisation: roleInfo.organisation,
      rolesGerables: [],
      type: overrides.role,
    },
    structureId: overrides.structureId ?? null,
    telephone: overrides.telephone ?? '0123456789',
    uid: overrides.uid ?? 'test-uid',
  }
}

class TerritoireDepartementsLoaderStub implements TerritoireDepartementsLoader {
  readonly #departementCode: null | string

  constructor(departementCode: null | string = '69') {
    this.#departementCode = departementCode
  }

  async getDepartementCodeByStructureId(): Promise<null | string> {
    return Promise.resolve(this.#departementCode)
  }
}
