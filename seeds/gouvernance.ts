/* eslint-disable no-console */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-case-declarations*/

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

const gouvernancesFNEQuery: Parameters<typeof prismaFNE.gouvernance.findMany>[0] = {
  include: {
    comites: true,
    feuillesDeRoute: {
      include: {
        membresFeuilleDeRoute: true,
      },
    },
    membres: {
      include: {
        beneficiairesSubventions: {
          include: {
            relationDemandeDeSubvention: true,
          },
        },
        relationCommune: true,
        relationEpci: true,
        relationFormulaireGouvernance: {
          include: {
            relationContactPolitique: true,
            relationContactStructure: true,
            relationContactTechnique: true,
          },
        },
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

const membresCandidatsEtSuggeresFNEQuery: Parameters<typeof prismaFNE.formulaireGouvernance.findMany>[0] = {
  include: {
    membresGouvernance: true,
    relationCommune: true,
    relationContactPolitique: true,
    relationContactStructure: true,
    relationContactTechnique: true,
    relationEpci: {
      include: {
        communes: true,
      },
    },
    relationInformationSiret: true,
    relationRegion: {
      include: {
        departements: true,
      },
    },
  },
  where: {
    NOT: {
      membresGouvernance: {
        some: {},
      },
    },
  },
}

void (async function migrate(): Promise<void> {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des gouvernances commence')

  await Promise.all([
    prismaFNE.gouvernance.findMany(gouvernancesFNEQuery),
    prismaFNE.contactFormulaireGouvernance.findMany(),
  ] as const)
    .then(([gouvernancesFNE, membresFNE]) => {
      console.log(greenColor, `${gouvernancesFNE.length} gouvernances FNE sont récupérées`)
      return [gouvernancesFNE as unknown as ReadonlyArray<GouvernanceFNE>, membresFNE] as const
    })
    .then(async ([gouvernancesFNE, membresFNE]) => {
      const gouvernancesFNEGouvernancesEtCreateurs = Promise.all(
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
      )
      return Promise.all([
        gouvernancesFNEGouvernancesEtCreateurs,
        prismaFNE.formulaireGouvernance.findMany(membresCandidatsEtSuggeresFNEQuery),
        prisma.contactMembreGouvernanceRecord.createMany({
          data: membresFNE.map(({ email, fonction, nom, prenom }) => ({
            email: email.toLowerCase(),
            fonction,
            nom,
            prenom,
          })),
          skipDuplicates: true,
        }),
      ])
    })
    .then(async ([gouvernancesFNEGouvernancesEtCreateurs, membresFNENonConfirmes]) => {
      console.log(greenColor, `${gouvernancesFNEGouvernancesEtCreateurs.length} gouvernances sont insérées`)
      const groupe = grouperDonneesACreer(
        gouvernancesFNEGouvernancesEtCreateurs,
        // @ts-expect-error
        associerMembresNonConfirmesAuxGouvernances(membresFNENonConfirmes)
      )
      return Promise.all([
        groupe,
        prisma.membreRecord.createMany({ data: groupe.membres.map(membreWithIdFNEToMembre), skipDuplicates: true }),
      ])
    })
    .then(async ([groupe, membresCrees]) => {
      const membresByIdFNE = Object.groupBy(groupe.membres, ({ idFNE }) => idFNE)
      return Promise.all([
        membresCrees,
        prisma.comiteRecord.createMany({ data: groupe.comites.slice() }),
        prisma.feuilleDeRouteRecord.createMany({
          // @ts-expect-error
          data: groupe.feuillesDeRoute.map(feuilleDeRouteWithIdFNEPorteurToFeuilleDeRoute(membresByIdFNE)),
        }),
        prisma.membreGouvernanceCommuneRecord.createMany({
          data: Object.values(groupe.membresCommunes).flatMap(associerMembresAuxRoles),
          skipDuplicates: true,
        }),
        prisma.membreGouvernanceDepartementRecord.createMany({
          data: Object.values(groupe.membresDepartements).flatMap(associerMembresAuxRoles),
          skipDuplicates: true,
        }),
        prisma.membreGouvernanceEpciRecord.createMany({
          data: Object.values(groupe.membresEpcis).flatMap(associerMembresAuxRoles),
          skipDuplicates: true,
        }),
        prisma.membreGouvernanceSgarRecord.createMany({
          data: Object.values(groupe.membresSgars).flatMap(associerMembresAuxRoles),
          skipDuplicates: true,
        }),
        prisma.membreGouvernanceStructureRecord.createMany({
          data: Object.values(groupe.membresStructures).flatMap(associerMembresAuxRoles),
          skipDuplicates: true,
        }),
      ])
    })
    .then(([membresCrees, comitesCrees, feuillesDeRouteCreees]) => {
      console.log(greenColor, `${comitesCrees.count} comites sont insérés`)
      console.log(greenColor, `${feuillesDeRouteCreees.count} feuilles de route sont insérées`)
      console.log(greenColor, `${membresCrees.count} membres uniques par gouvernance sont insérés`)
      console.log(greenColor, 'La migration des gouvernances est finie')
    })
}())

function associerMembresNonConfirmesAuxGouvernances(
  membresNonConfirmes: ReadonlyArray<MembreGouvernanceFNENonConfirme>
): Readonly<Record<string, ReadonlyArray<MembreGouvernanceFNENonConfirme>>> {
  return membresNonConfirmes.reduce<MembresFNENonConfirmesByCodeDepartement>((membresByDepartement, membre) => {
    const codesDepartement = new Set<string>()
    switch (membre.persona) {
      case 'commune':
        if (membre.relationCommune) {
          codesDepartement.add(membre.relationCommune.codeDepartement)
        }
        break
      case 'epci':
        if (membre.relationEpci) {
          membre.relationEpci.communes.forEach(({ codeDepartement }) => {
            codesDepartement.add(codeDepartement)
          })
        }
        break
      case 'conseil-regional':
        if (membre.relationRegion) {
          membre.relationRegion.departements.forEach(({ code }) => {
            codesDepartement.add(code)
          })
        }
        break
      default:
        if (membre.departementCode) {
          codesDepartement.add(membre.departementCode)
        }
        break
    }
    return {
      ...membresByDepartement,
      ...Array.from(codesDepartement).reduce((membresByCode, code) => ({
        [code]: (membresByCode[code] ?? []).concat(membre),
      }), membresByDepartement),
    }
  }, {})
}

function grouperDonneesACreer(
  donneesAFormaterGroupees: ReadonlyArray<Readonly<[GouvernanceFNE, GouvernanceRecord, UtilisateurRecord]>>,
  membresNonConfirmes: Readonly<Record<string, ReadonlyArray<MembreGouvernanceFNENonConfirme>>>
): GroupeGouvernance {
  return donneesAFormaterGroupees.reduce<GroupeGouvernance>(
    (groupe, [gouvernanceFNE, gouvernance, { ssoId }]) => {
      return {
        ...groupe,
        ...[gouvernanceFNE.membres, membresNonConfirmes[gouvernanceFNE.departementCode] ?? []].flat()
          .reduce(extraireMembresGouvernances(gouvernanceFNE, gouvernance), groupe),
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
      membresCommunes: {},
      membresDepartements: {},
      membresEpcis: {},
      membresSgars: {},
      membresStructures: {},
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
    return (feuilleDeRouteFNE: GouvernanceFNE['feuillesDeRoute'][number]): FeuilleDeRouteWithIdFNEPorteur => ({
      creation: feuilleDeRouteFNE.creation,
      gouvernanceDepartementCode,
      nom: feuilleDeRouteFNE.nom,
      porteurFNEId: feuilleDeRouteFNE.membresFeuilleDeRoute[0]?.membreId,
      oldUUID: feuilleDeRoute.id,
      pieceJointe: feuilleDeRoute.pieceJointe,
    })
  }

  function extraireMembresGouvernances(gouvernanceFNE: GouvernanceFNE, gouvernance: GouvernanceRecord) {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    return (groupeMembres: GroupeMembres, membreFNE: MembreGouvernanceFNE): GroupeMembres => {
      let groupe: GroupeMembres = { ...groupeMembres }
      const isConfirme = isMembreFNEConfirme(membreFNE)
      const ajouterMembres = ajouterMembresGouvernance(
        groupe,
        membreFNE,
        gouvernance.departementCode
      )
      if (isConfirme) {
        const isCoporteur = membreFNE.coporteur
        const isBeneficiaire = isDemandeSubventionAcceptee(membreFNE)
        const isRecipiendaire = gouvernanceFNE.relationBeneficiaireDotationFormation?.id === membreFNE.id
        if (!isCoporteur && !isBeneficiaire && !isRecipiendaire) {
          groupe = ajouterMembres('observateur')
        } else {
          if (isCoporteur) {
            groupe = ajouterMembres('coporteur')
          }
          if (isBeneficiaire) {
            groupe = ajouterMembres('beneficiaire')
          }
          if (isRecipiendaire) {
            groupe = ajouterMembres('recipiendaire')
          }
        }
      } else {
        groupe = ajouterMembres('observateur', membreFNE.confirmeEtEnvoye ? 'candidat' : 'suggere')
      }
      return groupe
    }
  }

  function ajouterMembresGouvernance(
    groupeMembres: GroupeMembres,
    membreFNE: MembreGouvernanceFNE,
    departementCode: string
  ) {
    return (role: string, statut = 'confirme'): GroupeMembres => {
      let groupe: GroupeMembres = { ...groupeMembres }
      let membreId: string
      let type: string
      const gouvernanceDepartementCode = departementCode
      const contacts = makeContacts(membreFNE)
      const prefectureMembreId = `prefecture-${gouvernanceDepartementCode}`
      switch (true) {
        case Boolean(membreFNE.relationCommune):
          [membreId, type] = [`commune-${membreFNE.communeCode}-${departementCode}`, 'Collectivité, commune']
          groupe = {
            ...groupe,
            membresCommunes: {
              ...groupe.membresCommunes,
              [membreId]: {
                membre: {
                  commune: membreFNE.relationCommune!.nom,
                  membreId,
                },
                roles: new Set([...groupe.membresCommunes[membreId]?.roles ?? []].concat(role)),
              },
            },
          }
          break
        case Boolean(membreFNE.relationEpci):
          [membreId, type] = [`epci-${membreFNE.epciCode}-${departementCode}`, 'Collectivité, EPCI']
          groupe = {
            ...groupe,
            membresEpcis: {
              ...groupe.membresEpcis,
              [membreId]: {
                membre: {
                  epci: membreFNE.relationEpci!.nom,
                  membreId,
                },
                roles: new Set([...groupe.membresEpcis[membreId]?.roles ?? []].concat(role)),
              },
            },
          }
          break
        case Boolean(membreFNE.regionCode):
          [membreId, type] = [`sgar-${membreFNE.regionCode}-${departementCode}`, 'Préfecture régionale']
          groupe = {
            ...groupe,
            membresSgars: {
              ...groupe.membresSgars,
              [membreId]: {
                membre: {
                  membreId,
                  sgarCode: membreFNE.regionCode!,
                },
                roles: new Set([...groupe.membresSgars[membreId]?.roles ?? []].concat(role)),
              },
            },
          }
          break
        case Boolean(membreFNE.relationInformationSiret ?? membreFNE.siret):
          membreId = `structure-${membreFNE.siret}-${departementCode}`
          groupe = {
            ...groupe,
            // @ts-expect-error
            membresStructures: {
              ...groupe.membresStructures,
              [membreId]: {
                membre: {
                  membreId,
                  structure: membreFNE.relationInformationSiret?.nom
                    ?? membreFNE.nomStructure
                    ?? membreFNE.relationInformationSiret?.siret
                    ?? membreFNE.siret,
                },
                roles: new Set([...groupe.membresStructures[membreId]?.roles ?? []].concat(role)),
              },
            },
          }
          break
        case Boolean(membreFNE.departementCode):
          [membreId, type] = [`departement-${membreFNE.departementCode}-${departementCode}`, 'Conseil départemental']
          groupe = {
            ...groupe,
            membresDepartements: {
              ...groupe.membresDepartements,
              [membreId]: {
                membre: {
                  departementCode: membreFNE.departementCode!,
                  membreId,
                },
                roles: new Set([...groupe.membresDepartements[membreId]?.roles ?? []].concat(role)),
              },
            },
          }
          break
      }
      groupe = {
        ...groupe,
        membres: groupe.membres.concat(
          {
            ...contacts,
            gouvernanceDepartementCode,
            // @ts-expect-error
            id: membreId,
            idFNE: membreFNE.id,

            statut,
            // @ts-expect-error
            type: membreFNE.relationInformationSiret?.formeJuridique ?? type,
          },
          {
            ...contacts,
            gouvernanceDepartementCode,
            id: prefectureMembreId,
            idFNE: prefectureMembreId,
            statut: 'confirme',
            type: 'Préfecture départementale',
          }
        ),
        membresDepartements: {
          ...groupe.membresDepartements,
          [prefectureMembreId]: {
            membre: {
              departementCode: gouvernanceDepartementCode,
              membreId: prefectureMembreId,
            },
            roles: new Set(['coporteur']),
          },
        },
      }
      return groupe
    }
  }

  function isDemandeSubventionAcceptee(membre: MembreGouvernanceFNEConfirme): boolean {
    return membre.beneficiairesSubventions.some(({ relationDemandeDeSubvention: { acceptee } }) =>
      Boolean(acceptee))
  }

  function isMembreFNEConfirme(membre: MembreGouvernanceFNE): membre is MembreGouvernanceFNEConfirme {
    return 'coporteur' in membre
  }

  function makeContacts(membreFNE: MembreGouvernanceFNE): Readonly<Pick<MembreRecord, 'contact' | 'contactTechnique'>> {
    const contacts = (membreFNE as MembreGouvernanceFNEConfirme).relationFormulaireGouvernance ?? membreFNE
    return {
      // @ts-expect-error
      contact: contacts.relationContactPolitique?.email.toLowerCase()
        ?? contacts.relationContactStructure?.email.toLowerCase(),
      contactTechnique: contacts.relationContactTechnique?.email.toLowerCase() ?? null,
    }
  }
}

function membreWithIdFNEToMembre(membreWithIdFNE: MembreWithIdFNE): MembreRecord {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { idFNE, ...membre } = membreWithIdFNE
  return membre
}

function feuilleDeRouteWithIdFNEPorteurToFeuilleDeRoute(
  membresByIdFNE: Readonly<Record<string, ReadonlyArray<MembreWithIdFNE>>>
) {
  return (feuilleDeRouteWithIdFNEPorteur: FeuilleDeRouteWithIdFNEPorteur): FeuilleDeRoute => {
    const { porteurFNEId, ...feuilleDeRoute } = feuilleDeRouteWithIdFNEPorteur
    return {
      ...feuilleDeRoute,
      porteurId: membresByIdFNE[porteurFNEId]?.[0].id,
    }
  }
}

function associerMembresAuxRoles<MembreSansRole extends MembreGouvernanceSansRole>(
  membreEtRoles: MembreEtRoles<MembreSansRole>
): ReadonlyArray<MembreSansRole & Readonly<{ role: string }>> {
  const roles = Array.from(membreEtRoles.roles)
  return membreEtRoles.roles.size === 1
    ? [{ ...membreEtRoles.membre, role: roles[0] }]
    : roles.filter((role) => role !== 'observateur').map((role) => ({ ...membreEtRoles.membre, role }))
}

type Contacts = Readonly<{
  relationContactPolitique: PrismaFNE.$ContactFormulaireGouvernancePayload['scalars'] | null
  relationContactStructure: PrismaFNE.$ContactFormulaireGouvernancePayload['scalars'] | null
  relationContactTechnique: PrismaFNE.$ContactFormulaireGouvernancePayload['scalars'] | null
}>

type MembreGouvernanceFNEConfirme = PrismaFNE.$MembreGouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: PrismaFNE.$EpciPayload['scalars'] | null
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationCommune: PrismaFNE.$CommunePayload['scalars'] | null
    relationFormulaireGouvernance: PrismaFNE.$FormulaireGouvernancePayload['scalars'] & Contacts
    beneficiairesSubventions: ReadonlyArray<
      PrismaFNE.$BeneficiaireSubventionPayload['scalars'] &
      Readonly<{
        relationDemandeDeSubvention: PrismaFNE.$BeneficiaireSubventionPayload['objects']['relationDemandeDeSubvention']['scalars']
      }>
    >
  }>

type MembreGouvernanceFNENonConfirme = PrismaFNE.$FormulaireGouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: (PrismaFNE.$EpciPayload['scalars']
      & Readonly<{ communes: ReadonlyArray<PrismaFNE.$CommunePayload['scalars']> }>) | null
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationCommune: PrismaFNE.$CommunePayload['scalars'] | null
    relationRegion: (PrismaFNE.$RegionPayload['scalars']
      & Readonly<{ departements: ReadonlyArray<PrismaFNE.$DepartementPayload['scalars']> }>) | null
  }> & Contacts

type MembreGouvernanceFNE = MembreGouvernanceFNEConfirme | MembreGouvernanceFNENonConfirme

type MembresFNENonConfirmesByCodeDepartement = Readonly<Record<string, ReadonlyArray<MembreGouvernanceFNENonConfirme>>>

type GouvernanceFNE = PrismaFNE.$GouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: PrismaFNE.$EpciPayload['scalars'] | null
    relationUserCreateur: PrismaFNE.$UserFNEPayload['scalars']
    relationUserDerniereModification: PrismaFNE.$UserFNEPayload['scalars']
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationBeneficiaireDotationFormation: MembreGouvernanceFNEConfirme | null
    comites: ReadonlyArray<PrismaFNE.$ComitePayload['scalars']>
    feuillesDeRoute: ReadonlyArray<
      PrismaFNE.$FeuilleDeRoutePayload['scalars']
      & Readonly<{ membresFeuilleDeRoute: ReadonlyArray<PrismaFNE.$MembreFeuilleDeRoutePayload['scalars']> }>>
    membres: ReadonlyArray<MembreGouvernanceFNEConfirme>
  }>

type Comite = Omit<ComiteRecord, 'id'>

type FeuilleDeRoute = Omit<FeuilleDeRouteRecord, 'id'>

type FeuilleDeRouteWithIdFNEPorteur = Omit<FeuilleDeRoute, 'porteurId'> & Readonly<{ porteurFNEId: string }>

type GroupeGouvernance = Readonly<{
  gouvernances: ReadonlyArray<GouvernanceRecord>
  comites: ReadonlyArray<Comite>
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteWithIdFNEPorteur>
}> & GroupeMembres

type MembreWithIdFNE = MembreRecord & Readonly<{ idFNE: string }>

type GroupeMembres = Readonly<{
  membres: ReadonlyArray<MembreWithIdFNE>
  membresDepartements: MembreEtRolesById<MembreGouvernanceDepartementSansRole>
  membresSgars: MembreEtRolesById<MembreGouvernanceSgarSansRole>
  membresEpcis: MembreEtRolesById<MembreGouvernanceEpciSansRole>
  membresCommunes: MembreEtRolesById<MembreGouvernanceCommuneSansRole>
  membresStructures: MembreEtRolesById<MembreGouvernanceStructureSansRole>
}>

type MembreEtRolesById<Membre extends MembreGouvernanceSansRole> = Readonly<Record<string, MembreEtRoles<Membre>>>

type MembreEtRoles<Membre extends MembreGouvernanceSansRole> = Readonly<{
  membre: Membre
  roles: ReadonlySet<string>
}>

type MembreGouvernanceCommuneSansRole = Omit<MembreGouvernanceCommuneRecord, 'role'>
type MembreGouvernanceDepartementSansRole = Omit<MembreGouvernanceDepartementRecord, 'role'>
type MembreGouvernanceEpciSansRole = Omit<MembreGouvernanceEpciRecord, 'role'>
type MembreGouvernanceSgarSansRole = Omit<MembreGouvernanceSgarRecord, 'role'>
type MembreGouvernanceStructureSansRole = Omit<MembreGouvernanceStructureRecord, 'role'>

type MembreGouvernanceSansRole =
  | MembreGouvernanceCommuneSansRole
  | MembreGouvernanceDepartementSansRole
  | MembreGouvernanceEpciSansRole
  | MembreGouvernanceSgarSansRole
  | MembreGouvernanceStructureSansRole
