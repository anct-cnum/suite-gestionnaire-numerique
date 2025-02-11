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
  MembreRecord,
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
            noteDeContexte: gouvernanceFNE.noteDeContexte,
          },
        })
        return [gouvernanceFNE, gouvernance, utilisateur] as const
      })
    ))
    .then(async (gouvernancesFNEGouvernancesEtCreateurs) => {
      console.log(greenColor, `${gouvernancesFNEGouvernancesEtCreateurs.length} gouvernances sont insérées`)
      const groupe = grouperDonneesACreer(gouvernancesFNEGouvernancesEtCreateurs)
      return Promise.all([
        groupe,
        prisma.membreRecord.createMany({ data: groupe.membres.slice(), skipDuplicates: true }),
      ])
    })
    .then(async ([groupe, membresCrees]) => Promise.all([
      membresCrees,
      prisma.comiteRecord.createMany({ data: groupe.comites }),
      prisma.feuilleDeRouteRecord.createMany({ data: groupe.feuillesDeRoute }),
      prisma.membreGouvernanceDepartementRecord.createMany({
        data: groupe.membresDepartements.slice(),
        skipDuplicates: true,
      }),
      prisma.membreGouvernanceCommuneRecord.createMany({ data: groupe.membresCommunes.slice(), skipDuplicates: true }),
      prisma.membreGouvernanceEpciRecord.createMany({ data: groupe.membresEpcis.slice() }),
      prisma.membreGouvernanceSgarRecord.createMany({ data: groupe.membresSgars.slice() }),
      prisma.membreGouvernanceStructureRecord.createMany({
        data: groupe.membresStructures.slice(),
        skipDuplicates: true,
      }),
    ]))
    .then(([membresCrees, comitesCrees, feuillesDeRouteCreees]) => {
      console.log(greenColor, `${comitesCrees.count} comites sont insérés`)
      console.log(greenColor, `${feuillesDeRouteCreees.count} feuilles de route sont insérées`)
      console.log(greenColor, `${membresCrees.count} membres uniques par gouvernance sont insérés`)
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
      const prefectureMembreId = `prefecture-${gouvernance.departementCode}`
      return {
        ...groupe,
        ...gouvernanceFNE.membres.reduce(extraireMembresGouvernances(gouvernanceFNE, gouvernance), {
          ...groupe,
          membres: groupe.membres.concat({
            gouvernanceDepartementCode: gouvernance.departementCode,
            id: prefectureMembreId,
            statut: 'confirme',
            type: 'Préfecture départementale',
          }),
          membresDepartements: groupe.membresDepartements.concat({
            departementCode: gouvernance.departementCode,
            membreId: prefectureMembreId,
            role: 'coporteur',
          }),
        }),
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
      membres: [],
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
      let groupe: GroupeMembres = { ...groupeMembres }
      if (!isCoporteur && !isBeneficiaire && !isRecipiendaire) {
        groupe = ajouterMembres(groupe, 'observateur')
      } else {
        if (isCoporteur) {
          groupe = ajouterMembres(groupe, 'coporteur')
        }
        if (isBeneficiaire) {
          groupe = ajouterMembres(groupe, 'beneficiaire')
        }
        if (isRecipiendaire) {
          groupe = ajouterMembres(groupe, 'recipiendaire')
        }
      }
      return groupe
    }
  }

  function ajouterMembresGouvernance(membreFNE: GouvernanceFNE['membres'][number], departementCode: string) {
    return (groupeMembres: GroupeMembres, role: string): GroupeMembres => {
      let groupe: GroupeMembres = { ...groupeMembres }
      let membreId: string
      let type: string
      const gouvernanceDepartementCode = departementCode
      switch (true) {
        case Boolean(membreFNE.departementCode):
          [membreId, type] = [`departement-${membreFNE.departementCode}-${departementCode}`, 'Conseil départemental']
          groupe = {
            ...groupe,
            membresDepartements: groupe.membresDepartements.concat({
              departementCode: membreFNE.departementCode!,
              membreId,
              role,
            }),
          }
          break
        case Boolean(membreFNE.communeCode):
          [membreId, type] = [`commune-${membreFNE.communeCode}-${departementCode}`, 'Collectivité, commune']
          groupe = {
            ...groupe,
            membresCommunes: groupe.membresCommunes.concat({
              commune: membreFNE.relationCommune!.nom,
              membreId,
              role,
            }),
          }
          break
        case Boolean(membreFNE.epciCode):
          [membreId, type] = [`epci-${membreFNE.epciCode}-${departementCode}`, 'Collectivité, EPCI']
          groupe = {
            ...groupe,
            membresEpcis: groupe.membresEpcis.concat({
              epci: membreFNE.relationEpci!.nom,
              membreId,
              role,
            }),
          }
          break
        case Boolean(membreFNE.regionCode):
          [membreId, type] = [`sgar-${membreFNE.regionCode}-${departementCode}`, 'Préfecture régionale']
          groupe = {
            ...groupe,
            membresSgars: groupe.membresSgars.concat({
              membreId,
              role,
              sgarCode: membreFNE.regionCode!,
            }),
          }
          break
        case Boolean(membreFNE.siret):
          membreId = `structure-${membreFNE.siret}-${departementCode}`
          groupe = {
            ...groupe,
            membresStructures: groupe.membresStructures.concat({
              membreId,
              role,
              structure: membreFNE.relationInformationSiret!.nom ?? membreFNE.relationInformationSiret!.siret,
            }),
          }
          break
      }
      groupe = {
        ...groupe,
        membres: groupe.membres.concat({
          gouvernanceDepartementCode,
          // @ts-expect-error
          id: membreId,

          statut: 'confirme',
          // @ts-expect-error
          type: membreFNE.relationInformationSiret?.formeJuridique ?? type,
        }),
      }
      return groupe
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
  membres: ReadonlyArray<MembreRecord>
  membresDepartements: ReadonlyArray<MembreGouvernanceDepartementRecord>
  membresSgars: ReadonlyArray<MembreGouvernanceSgarRecord>
  membresEpcis: ReadonlyArray<MembreGouvernanceEpciRecord>
  membresCommunes: ReadonlyArray<MembreGouvernanceCommuneRecord>
  membresStructures: ReadonlyArray<MembreGouvernanceStructureRecord>
}>
