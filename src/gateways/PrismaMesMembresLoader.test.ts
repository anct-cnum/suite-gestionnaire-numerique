import { Prisma } from '@prisma/client'

import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import {
  creerMembres,
  creerUnBeneficiaireSubvention,
  creerUnCoFinancement,
  creerUnDepartement,
  creerUneAction,
  creerUneDemandeDeSubvention,
  creerUneEnveloppeFinancement,
  creerUneFeuilleDeRoute,
  creerUneGouvernance,
  creerUneRegion,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance sont demandés, alors ils sont renvoyés suivant cet ordre : d’abord la préfecture départementale, puis les co-porteurs rangés par ordre alphabétique, puis le reste par ordre alphabétique', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUneRegion({ code: '11', nom: 'Île-de-France' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerMembres('69')
    await creerUnUtilisateur({ id: 1 })

    // Création d'une feuille de route et d'un cofinancement
    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: '69',
      id: 1,
      nom: 'Feuille de route test',
    })

    await creerUneAction({
      budgetGlobal: 50000,
      createurId: 1,
      feuilleDeRouteId: 1,
      id: 1,
      nom: 'Action test',
    })

    await creerUneAction({
      budgetGlobal: 30000,
      createurId: 1,
      feuilleDeRouteId: 1,
      id: 2,
      nom: 'Action test 2',
    })

    await creerUneEnveloppeFinancement({
      id: 1,
      libelle: 'Enveloppe formation',
    })
    
    await creerUneEnveloppeFinancement({
      id: 2,
      libelle: 'Enveloppe autre',
    })
    
    await creerUneDemandeDeSubvention({
      actionId: 1,
      enveloppeFinancementId: 1,
      id: 1,
    })
    
    await creerUneDemandeDeSubvention({
      actionId: 2,
      enveloppeFinancementId: 2,
      id: 2,
    })
    
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'commune-blabla-69',
    })
    
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 2,
      membreId: 'epci-200072056-69',
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId:'structure-38012986643097-69',
    })
    await creerUnCoFinancement({
      actionId: 1,
      memberId: 'commune-blabla-69',
      montant: 15000,
    })

    // WHEN
    const mesMembresReadModel = await new PrismaMesMembresLoader().get('69')

    // THEN
    expect(mesMembresReadModel).toStrictEqual<MesMembresReadModel>({
      autorisations: {
        accesMembreConfirme: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres: [
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Rhône',
          roles: ['observateur', 'coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture départementale',
          uid: 'prefecture-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Bretagne',
          roles: ['observateur', 'coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'region-53-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'CC Porte du Jura',
          roles: ['observateur',  'coporteur','beneficiaire'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
          uid: 'epci-200072056-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Créteil',
          roles: ['observateur', 'coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, commune',
          uid: 'commune-94028-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Orange',
          roles: ['observateur', 'coporteur', 'recipiendaire'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Entreprise privée',
          uid: 'structure-38012986643097-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Trévérien',
          roles: [
            'observateur',
            'coporteur',
            'cofinanceur',
            'recipiendaire',
          ],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Commune',
          uid: 'commune-blabla-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'CA Tulle Agglo',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
          uid: 'epci-241927201-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Île-de-France',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'region-11-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Pipriac',
          roles: [],
          siret: 'Siret bouchonné',
          statut: 'candidat',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-110-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Pipriac',
          roles: [
            'observateur',
          ],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-113-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Rennes',
          roles: [
            'observateur',
          ],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-111-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Rennes',
          roles: [],
          siret: 'Siret bouchonné',
          statut: 'candidat',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-112-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          isDeletable: true,
          nom: 'Rhône',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          structureId: expect.any(Number),
          suppressionDuMembreAutorise: false,
          typologie: 'Conseil départemental',
          uid: 'departement-69-69',
        },
      ],
      roles: [],
      typologies: [],
      uidGouvernance: '69',
    })
  })

  it('quand des membres de gouvernance sont demandés pour un départment non existant, alors une exception est levée', async () => {
    // GIVEN
    const codeDepartementInexistant = 'code_departement_inexistant'
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })

    // WHEN
    const mesMembresReadModel = new PrismaMesMembresLoader().get(codeDepartementInexistant)

    // THEN
    await expect(mesMembresReadModel).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(mesMembresReadModel).rejects.toMatchObject({ code: 'P2025' })
  })
})
