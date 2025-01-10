import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { departementRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

describe('gouvernance loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une gouvernance est demandée par son code département existant, alors elle est renvoyée', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })
    await prisma.noteDeContexteRecord.create({
      data: {
        contenu: '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
        derniereEdition: new Date('2024-11-23'),
        editeurId: 123,
        gouvernanceId: gouvernance.id,
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        dateProchainComite: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        nom: 'Comité stratégique 1',
        type: 'stratégique',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        dateProchainComite: new Date('2024-08-01'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        nom: 'Comité stratégique 2',
        type: 'technique',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          commentaire: 'commentaire',
          dateProchainComite: new Date('2024-11-23'),
          nom: 'Comité stratégique 1',
          periodicite: 'trimestrielle',
          type: 'stratégique',
        },
        {
          commentaire: 'commentaire',
          dateProchainComite: new Date('2024-08-01'),
          nom: 'Comité stratégique 2',
          periodicite: 'trimestrielle',
          type: 'technique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [
            { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
            { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
          ],
          beneficiairesSubventionFormation: [
            { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
            { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
          ],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 5_000,
          montantSubventionDemande: 40_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion 1',
          porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
          totalActions: 3,
        },
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [
            { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
            { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
          ],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 5_000,
          montantSubventionDemande: 40_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion 2',
          porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
          totalActions: 2,
        },
      ],
      membres: [
        {
          contactReferent: {
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route inclusion',
            },
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route numérique du Rhône',
            },
          ],
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Administration',
          typologieMembre: 'Préfecture départementale',

        },
        {
          contactReferent: {
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 30_000,
              montantSubventionFormationAccorde: 20_000,
              nom: 'Feuille de route inclusion',
            },
          ],
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            mailContact: 'coco.dupont@rhones.gouv.fr',
            nom: 'Coco',
            poste: 'chargé de mission',
            prenom: 'Dupont',
          },
          contactTechnique: 'coco.dupont@rhones.gouv.fr',
          feuillesDeRoute: [],
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
      noteDeContexte: {
        dateDeModification: new Date('2024-11-23'),
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte:
          '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
      },
      uid: '123456',
    })
  })

  it('quand une gouvernance est demandée par son code département inexistant, alors elle n’est pas renvoyée', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const codeDepartementInexistant = 'zzz'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = gouvernanceLoader.trouverEtEnrichir(codeDepartementInexistant)

    // THEN
    await expect(async () => gouvernanceReadModel).rejects.toThrow('Le département n’existe pas')
  })

  it('quand une gouvernance est demandée par son code département existant et qu‘elle n’a pas de note de contexte ni comité, alors elle est renvoyée sans note de contexte ni comité', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })

    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: undefined,
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      membres: [
        {
          contactReferent: {
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route inclusion',
            },
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route numérique du Rhône',
            },
          ],
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 30_000,
              montantSubventionFormationAccorde: 20_000,
              nom: 'Feuille de route inclusion',
            },
          ],
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            mailContact: 'coco.dupont@rhones.gouv.fr',
            nom: 'Coco',
            poste: 'chargé de mission',
            prenom: 'Dupont',
          },
          contactTechnique: 'coco.dupont@rhones.gouv.fr',
          feuillesDeRoute: [],
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
      noteDeContexte: undefined,
      uid: '123456',
    })
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans date de prochain comité, alors elle est renvoyée sans date de prochain comité', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        nom: 'Comité stratégique 1',
        type: 'stratégique',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          commentaire: 'commentaire',
          dateProchainComite: undefined,
          nom: 'Comité stratégique 1',
          periodicite: 'trimestrielle',
          type: 'stratégique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      membres: [
        {
          contactReferent: {
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route inclusion',
            },
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route numérique du Rhône',
            },
          ],
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,

          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 30_000,
              montantSubventionFormationAccorde: 20_000,
              nom: 'Feuille de route inclusion',
            },
          ],
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,

          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            mailContact: 'coco.dupont@rhones.gouv.fr',
            nom: 'Coco',
            poste: 'chargé de mission',
            prenom: 'Dupont',
          },
          contactTechnique: 'coco.dupont@rhones.gouv.fr',
          feuillesDeRoute: [],
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,

          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
      noteDeContexte: undefined,
      uid: '123456',
    })
  })
  it('quand une gouvernance est demandée par son code département existant avec un comité sans commentaire, alors elle est renvoyée sans commentaire', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        creation: new Date('2024-11-23'),
        dateProchainComite: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        nom: 'Comité stratégique 1',
        type: 'stratégique',
      },
    })

    const codeDepartement = '93'

    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          commentaire: '',
          dateProchainComite: new Date('2024-11-23'),
          nom: 'Comité stratégique 1',
          periodicite: 'trimestrielle',
          type: 'stratégique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      membres: [
        {
          contactReferent: {
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route inclusion',
            },
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route numérique du Rhône',
            },
          ],
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,

          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 30_000,
              montantSubventionFormationAccorde: 20_000,
              nom: 'Feuille de route inclusion',
            },
          ],
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,

          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            mailContact: 'coco.dupont@rhones.gouv.fr',
            nom: 'Coco',
            poste: 'chargé de mission',
            prenom: 'Dupont',
          },
          contactTechnique: 'coco.dupont@rhones.gouv.fr',
          feuillesDeRoute: [],
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,

          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
      noteDeContexte: undefined,
      uid: '123456',
    })
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans nom, alors elle est renvoyée sans nom', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        dateProchainComite: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        type: 'stratégique',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          commentaire: 'commentaire',
          dateProchainComite: new Date('2024-11-23'),
          nom: '',
          periodicite: 'trimestrielle',
          type: 'stratégique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      membres: [
        {
          contactReferent: {
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route inclusion',
            },
            {
              montantSubventionAccorde: 5_000,
              montantSubventionFormationAccorde: 5_000,
              nom: 'Feuille de route numérique du Rhône',
            },
          ],
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            {
              montantSubventionAccorde: 30_000,
              montantSubventionFormationAccorde: 20_000,
              nom: 'Feuille de route inclusion',
            },
          ],
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            mailContact: 'coco.dupont@rhones.gouv.fr',
            nom: 'Coco',
            poste: 'chargé de mission',
            prenom: 'Dupont',
          },
          contactTechnique: 'coco.dupont@rhones.gouv.fr',
          feuillesDeRoute: [],
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '',
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
      noteDeContexte: undefined,
      uid: '123456',
    })
  })
})

const feuillesDeRoute = [
  {
    beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
    beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
    budgetGlobal: 145_000,
    montantSubventionAccorde: 5_000,
    montantSubventionDemande: 40_000,
    montantSubventionFormationAccorde: 5_000,
    nom: 'Feuille de route inclusion 1',
    porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
    totalActions: 3,
  },
  {
    beneficiairesSubvention: [],
    beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
    budgetGlobal: 145_000,
    montantSubventionAccorde: 5_000,
    montantSubventionDemande: 40_000,
    montantSubventionFormationAccorde: 5_000,
    nom: 'Feuille de route inclusion 2',
    porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
    totalActions: 2,
  },
]
