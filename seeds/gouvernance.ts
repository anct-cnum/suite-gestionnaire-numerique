/* eslint-disable no-console */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */

import {
  ComiteRecord,
  FeuilleDeRouteRecord,
  GouvernanceRecord,
  MembreGouvernanceDepartementRecord,
  MembreGouvernanceSgarRecord,
  MembreGouvernanceEpciRecord,
  MembreGouvernanceCommuneRecord,
  MembreGouvernanceStructureRecord,
  UtilisateurRecord,
} from '@prisma/client'

import { Prisma as PrismaFNE } from './fne/client-fne'
import prismaFNE from './fne/prismaClientFne'
import prisma from '../prisma/prismaClient'

void (async function migrate(): Promise<void> {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des gouvernances commence')

  await prismaFNE.gouvernance.findMany(gouvernancesFNEQuery())
    .then((gouvernancesFNE) => {
      console.log(greenColor, `${gouvernancesFNE.length} gouvernances FNE sont récupérées`)
      return gouvernancesFNE as unknown as ReadonlyArray<GouvernanceFNE>
    })
    .then(async (gouvernancesFNE) => Promise.all(
      gouvernancesFNE.map(async (gouvernanceFNE) => {
        const utilisateur = await prisma.utilisateurRecord.findUniqueOrThrow({
          where: {
            ssoEmail: gouvernanceFNE.relationUserCreateur.email,
          },
        })
        const gouvernance = await prisma.gouvernanceRecord.create({
          data: {
            departementCode: gouvernanceFNE.departementCode,
            derniereEditionNoteDeContexte: gouvernanceFNE.modification,
            editeurNoteDeContexteId: utilisateur.ssoId,
            noteDeContexte: gouvernanceFNE.noteDeContexte || null,
          },
        })
        return [gouvernanceFNE, gouvernance, utilisateur] as const
      })
    ))
    .then(async (gouvernancesFNEGouvernancesEtCreateurs) => {
      console.log(greenColor, `${gouvernancesFNEGouvernancesEtCreateurs.length} gouvernances sont insérées`)
      const groupe = grouperDonneesACreer(gouvernancesFNEGouvernancesEtCreateurs)
      return Promise.all([
        prisma.comiteRecord.createMany({ data: groupe.comites, skipDuplicates: true }),
        prisma.feuilleDeRouteRecord.createMany({ data: groupe.feuillesDeRoute, skipDuplicates: true }),
        prisma.membreGouvernanceDepartementRecord.createMany({
          data: groupe.membresDepartements,
          skipDuplicates: true,
        }),
        prisma.membreGouvernanceSgarRecord.createMany({ data: groupe.membresSgars, skipDuplicates: true }),
        prisma.membreGouvernanceEpciRecord.createMany({ data: groupe.membresEpcis, skipDuplicates: true }),
        prisma.membreGouvernanceCommuneRecord.createMany({ data: groupe.membresCommunes, skipDuplicates: true }),
        prisma.membreGouvernanceStructureRecord.createMany({ data: groupe.membresStructures, skipDuplicates: true }),
      ])
    })
    .then(async ([comitesCrees, feuillesDeRouteCreees]) => {
      console.log(greenColor, `${comitesCrees.count} comites sont insérés`)
      console.log(greenColor, `${feuillesDeRouteCreees.count} feuilles de route sont insérées`)
      return prisma.$queryRaw`SELECT
        (SELECT COUNT(distinct commune) FROM membre_gouvernance_commune)
        + (SELECT COUNT(distinct "sgarCode") FROM  membre_gouvernance_sgar)
        + (SELECT COUNT(distinct epci) FROM  membre_gouvernance_epci)
        + (SELECT COUNT(distinct "departementCode" ) FROM  membre_gouvernance_departement)
        + (SELECT COUNT(distinct "structure") FROM membre_gouvernance_structure)` as Promise<Readonly<[string, bigint]>>
    })
    .then((nombreDeMembresUniques) => {
      console.log(greenColor, `${Object.values(nombreDeMembresUniques[0])[0]} membres uniques présents en base`)
      console.log(greenColor, 'La migration des gouvernances est finie')
    })
}())

function gouvernancesFNEQuery(): Parameters<typeof prismaFNE.gouvernance.findMany>[0] {
  return {
    include: {
      comites: true,
      feuillesDeRoute: true,
      membres: {
        include: {
          beneficiairesSubventions: {
            include: {
              relationDemandeDeSubvention: true,
            },
          },
          relationCommune: true,
          relationEpci: true,
          relationInformationSiret: true,
        },
      },
      relationBeneficiaireDotationFormation: {
        include: {
          relationCommune: true,
          relationEpci: true,
          relationInformationSiret: true,
        },
      },
      relationUserCreateur: true,
      relationUserDerniereModification: true,
    },
    where: {
      AND: [
        {
          suppression: {
            equals: null,
          },
        },
        {
          enregistree: {
            not: null,
          },
        },
      ],
    },
  }
}

function grouperDonneesACreer(
  donneesAFormaterGroupees: ReadonlyArray<Readonly<[GouvernanceFNE, GouvernanceRecord, UtilisateurRecord]>>
): GroupeGouvernance {
  return donneesAFormaterGroupees.reduce<GroupeGouvernance>(
    (groupe, [gouvernanceFNE, gouvernance, { ssoId }]) => {
      return {
        ...groupe,
        ...gouvernanceFNE.membres.reduce(extraireMembresGouvernances(gouvernanceFNE, gouvernance), groupe),
        comites: groupe.comites.concat(
          gouvernanceFNE.comites.map(comiteFromComiteFNE(gouvernance.departementCode, ssoId))
        ),
        feuillesDeRoute: groupe.feuillesDeRoute.concat(
          gouvernanceFNE.feuillesDeRoute.map(feuilleDeRouteFromFeuilleDeRouteFNE(gouvernance.departementCode))
        ),
        gouvernances: groupe.gouvernances.concat(gouvernance),

      }
    },
    {
      comites: [],
      feuillesDeRoute: [],
      gouvernances: [],
      membresCommunes: [],
      membresDepartements: [],
      membresEpcis: [],
      membresSgars: [],
      membresStructures: [],
    }
  )

  function comiteFromComiteFNE(departementCode: string, editeurUtilisateurId: string) {
    return (comiteFNE: GouvernanceFNE['comites'][number]): Comite => ({
      commentaire: comiteFNE.commentaire,
      creation: comiteFNE.creation,
      date: null,
      derniereEdition: comiteFNE.modification,
      editeurUtilisateurId,
      frequence: comiteFNE.frequence,
      gouvernanceDepartementCode: departementCode,
      type:
        comiteFNE.type === 'autre'
          ? comiteFNE.typeAutrePrecision ?? ''
          : comiteFNE.type.toString(),
    })
  }

  function feuilleDeRouteFromFeuilleDeRouteFNE(gouvernanceDepartementCode: string) {
    return (feuilleDeRoute: GouvernanceFNE['feuillesDeRoute'][number]): FeuilleDeRoute => ({
      creation: feuilleDeRoute.creation,
      gouvernanceDepartementCode,
      nom: feuilleDeRoute.nom,
    })
  }

  function extraireMembresGouvernances(gouvernanceFNE: GouvernanceFNE, gouvernance: GouvernanceRecord) {
    return (groupeMembres: GroupeMembres, membreFNE: GouvernanceFNE['membres'][number]): GroupeMembres => {
      const isCoporteur = membreFNE.coporteur
      const isBeneficiaire = isDemandeSubventionAcceptee(membreFNE)
      const isRecipiendaire = gouvernanceFNE.relationBeneficiaireDotationFormation
      const ajouterMembres = ajouterMembresGouvernance(membreFNE, gouvernance.departementCode)
      let membres: GroupeMembres = {
        membresCommunes: groupeMembres.membresCommunes,
        membresDepartements: [
          ...groupeMembres.membresDepartements,
          {
            departementCode: gouvernance.departementCode,
            gouvernanceDepartementCode: gouvernance.departementCode,
            role: 'coporteur',
            type: 'Préfecture départementale',
          },
        ],
        membresEpcis: groupeMembres.membresEpcis,
        membresSgars: groupeMembres.membresSgars,
        membresStructures: groupeMembres.membresStructures,
      }
      if (!isCoporteur && !isBeneficiaire && !isRecipiendaire) {
        membres = ajouterMembres(membres, 'N/A')
      } else {
        if (isCoporteur) {
          membres = ajouterMembres(membres, 'coporteur')
        }
        if (isBeneficiaire) {
          membres = ajouterMembres(membres, 'beneficiaire')
        }
        if (isRecipiendaire) {
          membres = ajouterMembres(membres, 'recipiendaire')
        }
      }
      return membres
    }
  }

  function ajouterMembresGouvernance(membreFNE: GouvernanceFNE['membres'][number], departementCode: string) {
    return (groupeMembres: GroupeMembres, role: string): GroupeMembres => {
      let membres: GroupeMembres = { ...groupeMembres }
      const common = {
        gouvernanceDepartementCode: departementCode,
        role,
        type: membreFNE.relationInformationSiret?.formeJuridique ?? null,
      }
      switch (true) {
        case Boolean(membreFNE.departementCode):
          membres = {
            ...membres,
            membresDepartements: membres.membresDepartements.concat({
              ...common,
              departementCode: membreFNE.departementCode!,
            }),
          }
          break
        case Boolean(membreFNE.communeCode):
          membres = {
            ...membres,
            membresCommunes: membres.membresCommunes.concat({
              ...common,
              commune: membreFNE.relationCommune!.nom,
            }),
          }
          break
        case Boolean(membreFNE.epciCode):
          membres = {
            ...membres,
            membresEpcis: membres.membresEpcis.concat({
              ...common,
              epci: membreFNE.relationEpci!.nom,
            }),
          }
          break
        case Boolean(membreFNE.regionCode):
          membres = {
            ...membres,
            membresSgars: membres.membresSgars.concat({
              ...common,
              sgarCode: membreFNE.regionCode!,
            }),
          }
          break
        case Boolean(membreFNE.siret):
          membres = {
            ...membres,
            membresStructures: membres.membresStructures.concat({
              ...common,
              structure: membreFNE.relationInformationSiret!.nom ?? membreFNE.relationInformationSiret!.siret,
            }),
          }
          break
      }
      return membres
    }
  }

  function isDemandeSubventionAcceptee(membre: MembreGouvernanceFNE): boolean {
    return membre.beneficiairesSubventions.some(({ relationDemandeDeSubvention: { acceptee } }) =>
      Boolean(acceptee))
  }
}

type MembreGouvernanceFNE = PrismaFNE.$MembreGouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: PrismaFNE.$EpciPayload['scalars'] | null
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationCommune: PrismaFNE.$CommunePayload['scalars'] | null
    beneficiairesSubventions: ReadonlyArray<
      PrismaFNE.$BeneficiaireSubventionPayload['scalars'] &
      Readonly<{
        relationDemandeDeSubvention: PrismaFNE.$BeneficiaireSubventionPayload['objects']['relationDemandeDeSubvention']['scalars']
      }>
    >
  }>

type GouvernanceFNE = PrismaFNE.$GouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: PrismaFNE.$EpciPayload['scalars'] | null
    relationUserCreateur: PrismaFNE.$UserFNEPayload['scalars']
    relationUserDerniereModification: PrismaFNE.$UserFNEPayload['scalars']
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationBeneficiaireDotationFormation: MembreGouvernanceFNE | null
    comites: ReadonlyArray<PrismaFNE.$ComitePayload['scalars']>
    feuillesDeRoute: ReadonlyArray<PrismaFNE.$FeuilleDeRoutePayload['scalars']>
    membres: ReadonlyArray<MembreGouvernanceFNE>
  }>

type Comite = Omit<ComiteRecord, 'id'>

type FeuilleDeRoute = Omit<FeuilleDeRouteRecord, 'id'>

type GroupeGouvernance = Readonly<{
  gouvernances: Array<GouvernanceRecord>
  comites: Array<Comite>
  feuillesDeRoute: Array<FeuilleDeRoute>
}> & GroupeMembres

type GroupeMembres = Readonly<{
  membresDepartements: Array<MembreGouvernanceDepartementRecord>
  membresSgars: Array<MembreGouvernanceSgarRecord>
  membresEpcis: Array<MembreGouvernanceEpciRecord>
  membresCommunes: Array<MembreGouvernanceCommuneRecord>
  membresStructures: Array<MembreGouvernanceStructureRecord>
}>
