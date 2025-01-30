import { PrismaClient } from '@prisma/client'

import { MesMembresLoader, MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

export class PrismaMesMembresLoader extends MesMembresLoader {
  readonly #dataResource: PrismaClient

  constructor(dataResource: PrismaClient) {
    super()
    this.#dataResource = dataResource
  }

  protected override async find(codeDepartementGouvernance: string): Promise<MesMembresReadModel> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result: ReadonlyArray<Membres> = await this.#dataResource.$queryRaw`
      SELECT commune AS "nomMembre", ARRAY_AGG(role) AS role FROM membre_gouvernance_commune WHERE "gouvernanceDepartementCode" = ${codeDepartementGouvernance} GROUP BY commune
      UNION ALL
      SELECT epci AS "nomMembre", ARRAY_AGG(role) AS role FROM membre_gouvernance_epci WHERE "gouvernanceDepartementCode" = ${codeDepartementGouvernance} GROUP BY epci
      UNION ALL
      SELECT structure AS "nomMembre", ARRAY_AGG(role) AS role FROM membre_gouvernance_structure WHERE "gouvernanceDepartementCode" = ${codeDepartementGouvernance} GROUP BY structure
      UNION ALL
      SELECT departement.nom AS "nomMembre", ARRAY_AGG(membre_gouvernance_departement.role) AS role FROM membre_gouvernance_departement INNER JOIN departement ON membre_gouvernance_departement."departementCode" = departement.code
      WHERE membre_gouvernance_departement."gouvernanceDepartementCode" = ${codeDepartementGouvernance} GROUP BY departement.nom
      UNION ALL
      SELECT region.nom AS "nomMembre", ARRAY_AGG(membre_gouvernance_sgar.role) AS role FROM membre_gouvernance_sgar INNER JOIN region ON membre_gouvernance_sgar."sgarCode" = region.code WHERE membre_gouvernance_sgar."gouvernanceDepartementCode" = ${codeDepartementGouvernance} GROUP BY region.nom`

    const membres: MesMembresReadModel['membres'] = [
      {
        contactReferent: {
          nom: 'Henrich',
          prenom: 'Laetitia',
        },
        nom: 'Préfecture du Rhône',
        suppressionDuMembreAutorise: false,
        typologie: 'Préfecture départementale',
      },
      {
        contactReferent: {
          nom: 'Didier',
          prenom: 'Durant',
        },
        nom: 'Département du Rhône',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité',
      },
      {
        contactReferent: {
          nom: 'Dupont',
          prenom: 'Valérie',
        },
        nom: 'Mornant',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité',
      },
      {
        contactReferent: {
          nom: 'Dupont',
          prenom: 'Valérie',
        },
        nom: 'Métropole de Lyon',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
      },
      {
        contactReferent: {
          nom: 'Dupont',
          prenom: 'Justine',
        },
        nom: 'Auvergne-Rhône-Alpes',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité',
      },
      {
        contactReferent: {
          nom: 'Dupont',
          prenom: 'Paul',
        },
        nom: 'Rhône',
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité',
      },
    ].map((membre) => ({
      ...membre,
      roles: (result.find((membreDb: Membres) => membreDb.nomMembre === membre.nom)?.role ?? []) as MesMembresReadModel['roles'],
    }))
    return {
      autorisations: {
        accesMembreValide: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres,
      roles: [],
      typologies: [],
    }
  }
}

type Membres = Readonly<{
  nomMembre: string
  role: ReadonlyArray<string>
}>
