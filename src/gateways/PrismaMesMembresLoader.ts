import { PrismaClient } from '@prisma/client'

import { MembreReadModel, MesMembresLoader, MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

export class PrismaMesMembresLoader implements MesMembresLoader {
  readonly #dataResource: PrismaClient

  constructor(dataResource: PrismaClient) {
    this.#dataResource = dataResource
  }

  async get(codeDepartementGouvernance: string): Promise<MesMembresReadModel> {
    const result: ReadonlyArray<Membre> = await this.#dataResource.$queryRaw`
    SELECT mgc.commune AS nom, m.type, ARRAY_AGG(mgc.role) AS role
    FROM membre_gouvernance_commune mgc
    INNER JOIN membre m ON m.id = mgc."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartementGouvernance}
    GROUP BY mgc.commune, m.type

    UNION ALL

    SELECT mge.epci AS nom, m.type, ARRAY_AGG(mge.role) AS role
    FROM membre_gouvernance_epci mge
    INNER JOIN membre m ON m.id = mge."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartementGouvernance}
    GROUP BY mge.epci, m.type

    UNION ALL

    SELECT mgs.structure AS nom, m.type, ARRAY_AGG(mgs.role) AS role
    FROM membre_gouvernance_structure mgs
    INNER JOIN membre m ON m.id = mgs."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartementGouvernance}
    GROUP BY mgs.structure, m.type

    UNION ALL

    SELECT d.nom AS nom, m.type, ARRAY_AGG(mgd.role) AS role
    FROM membre_gouvernance_departement mgd
    INNER JOIN departement d ON mgd."departementCode" = d.code
    INNER JOIN membre m ON m.id = mgd."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartementGouvernance}
    GROUP BY d.nom, m.type

    UNION ALL

    SELECT r.nom AS nom, m.type, ARRAY_AGG(mgr.role) AS role
    FROM membre_gouvernance_sgar mgr
    INNER JOIN region r ON mgr."sgarCode" = r.code
    INNER JOIN membre m ON m.id = mgr."membreId"
    WHERE m."gouvernanceDepartementCode" = ${codeDepartementGouvernance}
    GROUP BY r.nom, m.type

    ORDER BY nom;`

    return {
      autorisations: {
        accesMembreConfirme: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres: result.map(toMesMembresReadModel),
      roles: [],
      typologies: [],
    }
  }
}

type Membre = Readonly<{
  nom: string
  role: ReadonlyArray<string>
  type: string
}>

function toMesMembresReadModel(membre: Membre): MembreReadModel {
  return {
    contactReferent: {
      nom: 'Dupont',
      prenom: 'Valérie',
    },
    nom: membre.nom,
    roles: membre.role as MesMembresReadModel['roles'],
    suppressionDuMembreAutorise: false,
    typologie: membre.type,
  }
}
