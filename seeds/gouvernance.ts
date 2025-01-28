/* eslint-disable no-console */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */

import {
  ComiteRecord,
  GouvernanceRecord,
  MembreGouvernanceDepartementRecord,
  MembreGouvernanceSgarRecord,
  MembreGouvernanceEpciRecord,
  MembreGouvernanceCommuneRecord,
  MembreGouvernanceStructureRecord,
  NoteDeContexteRecord,
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
      gouvernancesFNE.map(async (gouvernanceFNE) => Promise.all([
        gouvernanceFNE,
        prisma.gouvernanceRecord.create({
          data: { departementCode: gouvernanceFNE.departementCode },
        }),
        prisma.utilisateurRecord.findUniqueOrThrow({
          where: {
            ssoEmail: gouvernanceFNE.relationUserCreateur.email,
          },
        }),
      ]))
    ))
    .then(async (gouvernancesFNEGouvernancesEtCreateurs) => {
      console.log(greenColor, `${gouvernancesFNEGouvernancesEtCreateurs.length} gouvernances sont insérées`)
      const groupe = grouperDonneesACreer(gouvernancesFNEGouvernancesEtCreateurs)
      return Promise.all([
        prisma.comiteRecord.createMany({ data: groupe.comites, skipDuplicates: true }),
        prisma.noteDeContexteRecord.createMany({ data: groupe.notesDeContexte, skipDuplicates: true }),
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
    .then(async ([comitesCrees]) => {
      console.log(greenColor, `${comitesCrees.count} comites sont insérés`)
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
        gouvernances: groupe.gouvernances.concat(gouvernance),
        notesDeContexte: groupe.notesDeContexte.concat(
          noteDeContexteFromGouvernanceFNE(gouvernanceFNE, gouvernance.departementCode, ssoId)
        ),
      }
    },
    {
      comites: [],
      gouvernances: [],
      membresCommunes: [],
      membresDepartements: [],
      membresEpcis: [],
      membresSgars: [],
      membresStructures: [],
      notesDeContexte: [],
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

  function noteDeContexteFromGouvernanceFNE(
    gouvernanceFNE: GouvernanceFNE,
    departementCode: string,
    editeurId: string
  ): NoteDeContexte {
    return {
      contenu: gouvernanceFNE.noteDeContexte,
      derniereEdition: gouvernanceFNE.modification,
      editeurId,
      gouvernanceDepartementCode: departementCode,
    }
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
      const gouvernanceIdEtRole = { gouvernanceDepartementCode: departementCode, role }
      switch (true) {
        case Boolean(membreFNE.departementCode):
          membres = {
            ...membres,
            membresDepartements: membres.membresDepartements.concat({
              ...gouvernanceIdEtRole,
              departementCode: membreFNE.departementCode!,
            }),
          }
          break
        case Boolean(membreFNE.communeCode):
          membres = {
            ...membres,
            membresCommunes: membres.membresCommunes.concat({
              ...gouvernanceIdEtRole,
              commune: membreFNE.relationCommune!.nom,
            }),
          }
          break
        case Boolean(membreFNE.epciCode):
          membres = {
            ...membres,
            membresEpcis: membres.membresEpcis.concat({
              ...gouvernanceIdEtRole,
              epci: membreFNE.relationEpci!.nom,
            }),
          }
          break
        case Boolean(membreFNE.regionCode):
          membres = {
            ...membres,
            membresSgars: membres.membresSgars.concat({
              ...gouvernanceIdEtRole,
              sgarCode: membreFNE.regionCode!,
            }),
          }
          break
        case Boolean(membreFNE.siret):
          membres = {
            ...membres,
            membresStructures: membres.membresStructures.concat({
              ...gouvernanceIdEtRole,
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
    membres: ReadonlyArray<MembreGouvernanceFNE>
  }>

type NoteDeContexte = Omit<NoteDeContexteRecord, 'id'>

type Comite = Omit<ComiteRecord, 'id'>

type GroupeGouvernance = Readonly<{
  gouvernances: Array<GouvernanceRecord>
  notesDeContexte: Array<NoteDeContexte>
  comites: Array<Comite>
}> & GroupeMembres

type GroupeMembres = Readonly<{
  membresDepartements: Array<MembreGouvernanceDepartementRecord>
  membresSgars: Array<MembreGouvernanceSgarRecord>
  membresEpcis: Array<MembreGouvernanceEpciRecord>
  membresCommunes: Array<MembreGouvernanceCommuneRecord>
  membresStructures: Array<MembreGouvernanceStructureRecord>
}>
