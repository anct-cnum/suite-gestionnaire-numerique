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

const gouvernancesFNEQuery: Parameters<typeof prismaFNE.gouvernance.findMany>[0] = {
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
        prisma.membreRecord.createMany({ data: groupe.membres.slice(), skipDuplicates: true }),
      ])
    })
    .then(async ([groupe, membresCrees]) => Promise.all([
      membresCrees,
      prisma.comiteRecord.createMany({ data: groupe.comites.slice() }),
      prisma.feuilleDeRouteRecord.createMany({ data: groupe.feuillesDeRoute.slice() }),
      prisma.membreGouvernanceDepartementRecord.createMany({
        data: groupe.membresDepartements.slice(),
        skipDuplicates: true,
      }),
      prisma.membreGouvernanceCommuneRecord.createMany({ data: groupe.membresCommunes.slice(), skipDuplicates: true }),
      prisma.membreGouvernanceEpciRecord.createMany({ data: groupe.membresEpcis.slice(), skipDuplicates: true }),
      prisma.membreGouvernanceSgarRecord.createMany({ data: groupe.membresSgars.slice(), skipDuplicates: true }),
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

function associerMembresNonConfirmesAuxGouvernances(
  membresNonConfirmes: ReadonlyArray<MembreFNENonConfirme>
): Readonly<Record<string, ReadonlyArray<MembreFNENonConfirme>>> {
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
  membresNonConfirmes: Readonly<Record<string, ReadonlyArray<MembreFNENonConfirme>>>
): GroupeGouvernance {
  return donneesAFormaterGroupees.reduce<GroupeGouvernance>(
    (groupe, [gouvernanceFNE, gouvernance, { ssoId }]) => {
      const prefectureMembreId = `prefecture-${gouvernance.departementCode}`
      return {
        ...groupe,
        ...[gouvernanceFNE.membres, membresNonConfirmes[gouvernanceFNE.departementCode] ?? []].flat()
          .reduce(extraireMembresGouvernances(gouvernanceFNE, gouvernance), {
            ...groupe,
            membres: groupe.membres.concat({
              gouvernanceDepartementCode: gouvernance.departementCode,
              id: prefectureMembreId,
              statut: 'confirme',
              type: 'Préfecture départementale',
              ...contactsPrefecture(gouvernanceFNE.membres, gouvernance.departementCode),
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

  function contactsPrefecture(
    membres: ReadonlyArray<MembreGouvernanceFNE>,
    departementCode: string
  ): Pick<MembreRecord, 'contact' | 'contactTechnique'> {
    const formulaire = membres
      .find((membre) => membre.departementCode === departementCode)
      ?.relationFormulaireGouvernance
    return {
      contact: formulaire?.relationContactPolitique?.email.toLowerCase()
        ?? formulaire?.relationContactStructure?.email.toLowerCase()
        ?? null,
      contactTechnique: formulaire?.relationContactTechnique?.email.toLowerCase() ?? null,
    }
  }

  function extraireMembresGouvernances(gouvernanceFNE: GouvernanceFNE, gouvernance: GouvernanceRecord) {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    return (groupeMembres: GroupeMembres, membreFNE: MembreGouvernanceFNE | MembreFNENonConfirme): GroupeMembres => {
      let groupe: GroupeMembres = { ...groupeMembres }
      const isConfirme = isMembreFNEConfirme(membreFNE)
      const ajouterMembres = ajouterMembresGouvernance(
        groupe,
        membreFNE,
        isConfirme ? membreFNE.relationFormulaireGouvernance : membreFNE,
        gouvernance.departementCode
      )
      if (isConfirme) {
        const isCoporteur = membreFNE.coporteur
        const isBeneficiaire = isDemandeSubventionAcceptee(membreFNE)
        const isRecipiendaire = gouvernanceFNE.relationBeneficiaireDotationFormation
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
    membreFNE: MembreGouvernanceFNE | MembreFNENonConfirme,
    contacts: Contacts,
    departementCode: string
  ) {
    return (role: string, statut = 'confirme'): GroupeMembres => {
      let groupe: GroupeMembres = { ...groupeMembres }
      let membreId: string
      let type: string
      const gouvernanceDepartementCode = departementCode
      switch (true) {
        case Boolean(membreFNE.relationCommune):
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
        case Boolean(membreFNE.relationEpci):
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
        case Boolean(membreFNE.relationInformationSiret):
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
      }
      groupe = {
        ...groupe,
        membres: groupe.membres.concat({
          // @ts-expect-error
          contact: contacts.relationContactPolitique?.email.toLowerCase()
            ?? contacts.relationContactStructure?.email.toLowerCase(),
          contactTechnique: contacts.relationContactTechnique?.email.toLowerCase(),
          gouvernanceDepartementCode,
          // @ts-expect-error
          id: membreId,
          statut,
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

  function isMembreFNEConfirme(membre: MembreGouvernanceFNE | MembreFNENonConfirme): membre is MembreGouvernanceFNE {
    return 'coporteur' in membre
  }
}

type Contacts = Readonly<{
  relationContactPolitique: PrismaFNE.$ContactFormulaireGouvernancePayload['scalars'] | null
  relationContactStructure: PrismaFNE.$ContactFormulaireGouvernancePayload['scalars'] | null
  relationContactTechnique: PrismaFNE.$ContactFormulaireGouvernancePayload['scalars'] | null
}>

type MembreGouvernanceFNE = PrismaFNE.$MembreGouvernancePayload['scalars'] &
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

type MembreFNENonConfirme = PrismaFNE.$FormulaireGouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: (PrismaFNE.$EpciPayload['scalars']
      & Readonly<{ communes: ReadonlyArray<PrismaFNE.$CommunePayload['scalars']> }>) | null
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationCommune: PrismaFNE.$CommunePayload['scalars'] | null
    relationRegion: (PrismaFNE.$RegionPayload['scalars']
      & Readonly<{ departements: ReadonlyArray<PrismaFNE.$DepartementPayload['scalars']> }>) | null
  }> & Contacts

type MembresFNENonConfirmesByCodeDepartement = Readonly<Record<string, ReadonlyArray<MembreFNENonConfirme>>>

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
  gouvernances: ReadonlyArray<GouvernanceRecord>
  comites: ReadonlyArray<Comite>
  feuillesDeRoute: ReadonlyArray<FeuilleDeRoute>
}> & GroupeMembres

type GroupeMembres = Readonly<{
  membres: ReadonlyArray<MembreRecord>
  membresDepartements: ReadonlyArray<MembreGouvernanceDepartementRecord>
  membresSgars: ReadonlyArray<MembreGouvernanceSgarRecord>
  membresEpcis: ReadonlyArray<MembreGouvernanceEpciRecord>
  membresCommunes: ReadonlyArray<MembreGouvernanceCommuneRecord>
  membresStructures: ReadonlyArray<MembreGouvernanceStructureRecord>
}>
