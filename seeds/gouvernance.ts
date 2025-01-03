/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComiteRecord, GouvernanceRecord, MembreGouvernanceDepartementRecord, MembreGouvernanceSgarRecord, MembreGouvernanceEpciRecord, MembreGouvernanceCommuneRecord, MembreGouvernanceStructureRecord, NoteDeContexteRecord } from '@prisma/client'

import { Prisma as PrismaFNE } from './fne/client-fne'
import prismaFNE from './fne/prismaClientFne'
import prisma from '../prisma/prismaClient'

void (async function migrate(): Promise<void> {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des gouvernances commence')

  const gouvernancesFNE = await prismaFNE.gouvernance
    .findMany({
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
        relationEpci: true,
        relationInformationSiret: true,
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
            noteDeContexte: {
              not: '',
            },
          },
          {
            OR: [
              {
                perimetre: {
                  in: ['departement', 'region', 'autre'],
                },
              },
              {
                perimetre: null,
              },
            ],
          },
        ],
      },
    })

  console.log(greenColor, `${gouvernancesFNE.length} gouvernances FNE sont récupérées`)

  const groupes = await prisma.gouvernanceRecord.createManyAndReturn({
    data: gouvernancesFNE.map((gouvernanceFNE) => ({
      departementCode: gouvernanceFNE.departementCode,
    })),
    skipDuplicates: true,
  })
    .then(async (gouvernances) =>
      associerDonneesFNEAuxUtilisateurs(gouvernances, gouvernancesFNE as ReadonlyArray<GouvernanceFNE>))
    .then(formaterDonneesACreer)

  const notesDeContexteCreees = await prisma.noteDeContexteRecord.createMany({
    data: groupes.map(({ noteDeContexte }) => noteDeContexte),
    skipDuplicates: true,
  })

  const comitesCrees = await prisma.comiteRecord.createMany({
    data: groupes.flatMap(({ comites }) => comites),
    skipDuplicates: true,
  })

  const membres = groupes.map(({ membres }) => membres)

  const membresDepartementCrees = await prisma.membreGouvernanceDepartementRecord.createMany({
    data: membres.flatMap(({ departements }) => departements),
    skipDuplicates: true,
  })

  const membresRegionCrees = await prisma.membreGouvernanceSgarRecord.createMany({
    data: membres.flatMap(({ sgars }) => sgars),
    skipDuplicates: true,
  })

  const membresEpciCrees = await prisma.membreGouvernanceEpciRecord.createMany({
    data: membres.flatMap(({ epcis }) => epcis),
    skipDuplicates: true,
  })

  const membresCommuneCrees = await prisma.membreGouvernanceCommuneRecord.createMany({
    data: membres.flatMap(({ communes }) => communes),
    skipDuplicates: true,
  })

  const membresStructureCrees = await prisma.membreGouvernanceStructureRecord.createMany({
    data: membres.flatMap(({ structures }) => structures),
    skipDuplicates: true,
  })

  const nombreDeMembres = membresDepartementCrees.count
    + membresRegionCrees.count
    + membresEpciCrees.count
    + membresCommuneCrees.count
    + membresStructureCrees.count

  console.log(greenColor, `${notesDeContexteCreees.count} gouvernances sont insérées`)
  console.log(greenColor, `${comitesCrees.count} comites sont insérés`)
  console.log(greenColor, `${nombreDeMembres} triplets membre + gouvernance + rôle sont insérés`)

  const nombreDeMembresUniques = await prisma.$queryRaw`SELECT
 (SELECT COUNT(distinct commune) FROM membre_gouvernance_commune)
 + (SELECT COUNT(distinct "sgarCode") FROM  membre_gouvernance_sgar)
 + (SELECT COUNT(distinct epci) FROM  membre_gouvernance_epci)
 + (SELECT COUNT(distinct "departementCode" ) FROM  membre_gouvernance_departement)
 + (SELECT COUNT(distinct "structure") FROM membre_gouvernance_structure)
 as distinct_count_membres`

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  console.log(greenColor, `${nombreDeMembresUniques[0].distinct_count_membres} membres uniques présents en base`)
  console.log(greenColor, 'La migration des gouvernances est finie')
}())

async function associerDonneesFNEAuxUtilisateurs(
  gouvernances: ReadonlyArray<GouvernanceRecord>,
  gouvernancesFNE: ReadonlyArray<GouvernanceFNE>
): Promise<ReadonlyArray<GouvernanceEtAssociations>> {
  const gouvernancesIdByCodeDepartement = gouvernances
    .reduce<Record<string, GouvernanceRecord>>((gouvernanceIdByCodeDepartement, gouvernance) => ({
      ...gouvernanceIdByCodeDepartement,
      [gouvernance.departementCode]: gouvernance,
    }), {})
  const gouvernancesFNEEtGouvernances = gouvernancesFNE.map((gouvernanceFNE) => [
    gouvernanceFNE,
    gouvernancesIdByCodeDepartement[gouvernanceFNE.departementCode],
  ] as const)
  return Promise.all(
    gouvernancesFNEEtGouvernances.map(async ([gouvernanceFNE, gouvernance]) => Promise.all([
      gouvernanceFNE,
      gouvernance,
      prisma.utilisateurRecord
        .findUniqueOrThrow({
          where: {
            ssoEmail: gouvernanceFNE.relationUserCreateur.email,
          },
        })
        .then(({ ssoId, id }) => [ssoId, id] as const),
    ]).then(([gouvernanceFNE, gouvernance, [createurId, utilisateurId]]) => ({
      createurId,
      editeurNoteDeContexteId: utilisateurId,
      gouvernance,
      gouvernanceFNE,
    })))
  )
}

function formaterDonneesACreer(
  donneesAFormaterGroupees: ReadonlyArray<GouvernanceEtAssociations>
): ReadonlyArray<GroupeGouvernance> {
  return donneesAFormaterGroupees
    .map(({ editeurNoteDeContexteId, gouvernanceFNE, gouvernance, createurId }) => ({
      comites: gouvernanceFNE.comites.map(comiteFromComiteFNE(gouvernance.id, createurId)),
      gouvernance,
      membres: gouvernanceFNE.membres.reduce<GroupeGouvernance['membres']>((membres, membreFNE) => {
        const extracteur = extraireMembres(gouvernance.id, gouvernanceFNE, membreFNE)
        return {
          communes: membres.communes.concat(extracteur.communes()),
          departements: membres.departements.concat(extracteur.departements()),
          epcis: membres.epcis.concat(extracteur.epcis()),
          sgars: membres.sgars.concat(extracteur.sgars()),
          structures: membres.structures.concat(extracteur.structures()),
        }
      }, {
        communes: [],
        departements: [],
        epcis: [],
        sgars: [],
        structures: [],
      }),

      noteDeContexte: noteDeContexteFromGouvernanceFNE(editeurNoteDeContexteId, gouvernanceFNE, gouvernance.id),
    }))

  function comiteFromComiteFNE(gouvernanceFNEId: number, editeurUtilisateurId: string) {
    return (comiteFNE: GouvernanceFNE['comites'][number]): Comite => ({
      commentaire: comiteFNE.commentaire,
      creation: comiteFNE.creation,
      date: null,
      derniereEdition: comiteFNE.modification,
      editeurUtilisateurId,
      frequence: comiteFNE.frequence,
      gouvernanceId: gouvernanceFNEId,
      type: comiteFNE.type === 'autre' ? comiteFNE.typeAutrePrecision ?? '' : comiteFNE.type.toString(),
    })
  }

  function extraireMembres(
    gouvernanceId: number,
    gouvernanceFNE: GouvernanceFNE,
    membreFNE: GouvernanceFNE['membres'][number]
  ): Readonly<{
      communes(): ReadonlyArray<MembreGouvernanceCommuneRecord>
      departements(): ReadonlyArray<MembreGouvernanceDepartementRecord>
      epcis(): ReadonlyArray<MembreGouvernanceEpciRecord>
      sgars(): ReadonlyArray<MembreGouvernanceSgarRecord>
      structures(): ReadonlyArray<MembreGouvernanceStructureRecord>
    }> {
    const isCoporteur = membreFNE.coporteur
    const isBeneficiaire = isDemandeSubventionAcceptee(membreFNE)
    const recipiendaire = gouvernanceFNE.relationBeneficiaireDotationFormation

    return {
      communes(): ReadonlyArray<MembreGouvernanceCommuneRecord> {
        return extraire<'communes'>(
          gouvernanceId,
          Boolean(membreFNE.relationCommune),
          false,
          null,
          'commune',
          'relationCommune',
          // @ts-expect-error
          'nom'
        )
      },

      // departements(): ReadonlyArray<MembreGouvernanceDepartement> {
      departements(): ReadonlyArray<MembreGouvernanceDepartementRecord> {
        return extraire<'departements'>(
          gouvernanceId,
          Boolean(membreFNE.departementCode),
          Boolean(gouvernanceFNE.porteurDepartementCode),
          'porteurDepartementCode',
          'departementCode',
          'departementCode'
        )
      },

      epcis(): ReadonlyArray<MembreGouvernanceEpciRecord> {
        return extraire<'epcis'>(
          gouvernanceId,
          Boolean(membreFNE.epciCode),
          Boolean(gouvernanceFNE.porteurEpciCode),
          'porteurEpciCode',
          'epci',
          'epciCode'
        )
      },

      sgars(): ReadonlyArray<MembreGouvernanceSgarRecord> {
        return extraire<'sgars'>(
          gouvernanceId,
          Boolean(membreFNE.regionCode),
          Boolean(gouvernanceFNE.porteurRegionCode),
          'porteurRegionCode',
          'sgarCode',
          'regionCode'
        )
      },

      structures(): ReadonlyArray<MembreGouvernanceStructureRecord> {
        return extraire<'structures'>(
          gouvernanceId,
          Boolean(membreFNE.nomStructure),
          Boolean(gouvernanceFNE.porteurSiret),
          'porteurSiret',
          'structure',
          'relationInformationSiret',
          // @ts-expect-error
          'nom'
        )
      },
    }

    function extraire<K extends keyof GroupeGouvernance['membres']>(
      gouvernanceId: number,
      isMembreDeCeType: boolean,
      isPorteur: boolean,
      indicationPorteurDepuisGouvernance: keyof GouvernanceFNE | null,
      identifiantMembre: keyof GroupeGouvernance['membres'][K][number],
      identifiantMembreFNE: keyof MembreGouvernanceFNE,
      identifiantIdentifiantMembreFNE?: keyof MembreGouvernanceFNE[typeof identifiantMembreFNE]
    ): GroupeGouvernance['membres'][K] {
      const membres = []
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const [valeurMembreFNE, valeurRecipiendaireFNE] = identifiantIdentifiantMembreFNE
        ? [
          membreFNE[identifiantMembreFNE]?.[identifiantIdentifiantMembreFNE],
          recipiendaire?.[identifiantMembreFNE]?.[identifiantIdentifiantMembreFNE],
        ]
        : [
          membreFNE[identifiantMembreFNE],
          recipiendaire?.[identifiantMembreFNE],
        ]
      if (isPorteur) {
        membres.push({
          gouvernanceId,
          [identifiantMembre]: gouvernanceFNE[indicationPorteurDepuisGouvernance!],
          role: 'coporteur',
        })
      }
      if (isCoporteur && valeurMembreFNE) {
        membres.push({
          gouvernanceId,
          [identifiantMembre]: valeurMembreFNE,
          role: 'coporteur',
        })
      }
      if (isBeneficiaire && valeurMembreFNE) {
        membres.push({ gouvernanceId, [identifiantMembre]: valeurMembreFNE, role: 'beneficiaire' })
      }
      if (recipiendaire && valeurRecipiendaireFNE) {
        membres.push({ gouvernanceId, [identifiantMembre]: valeurRecipiendaireFNE, role: 'recipiendaire' })
      }
      if (!membres.length && isMembreDeCeType) {
        membres.push({ gouvernanceId, [identifiantMembre]: valeurMembreFNE!, role: 'roleindefini' })
      }
      // @ts-expect-error
      return membres
    }

    function isDemandeSubventionAcceptee(membre: MembreGouvernanceFNE): boolean {
      return membre.beneficiairesSubventions
        .some(({ relationDemandeDeSubvention: { acceptee } }) => Boolean(acceptee))
    }
  }
}

function noteDeContexteFromGouvernanceFNE(
  editeurId: number,
  gouvernanceFNE: GouvernanceFNE,
  gouvernanceId: number
): NoteDeContexte {
  return {
    contenu: gouvernanceFNE.noteDeContexte,
    derniereEdition: gouvernanceFNE.modification,
    editeurId,
    gouvernanceId,
  }
}

type MembreGouvernanceFNE = PrismaFNE.$MembreGouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: PrismaFNE.$EpciPayload['scalars'] | null
    relationInformationSiret: PrismaFNE.$InformationSiretPayload['scalars'] | null
    relationCommune: PrismaFNE.$CommunePayload['scalars'] | null
    beneficiairesSubventions: ReadonlyArray<
      PrismaFNE.$BeneficiaireSubventionPayload['scalars'] & Readonly<{
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

type GouvernanceEtAssociations = Readonly<{
  gouvernanceFNE: GouvernanceFNE
  gouvernance: GouvernanceRecord
  createurId: string
  editeurNoteDeContexteId: number
}>

type NoteDeContexte = Omit<NoteDeContexteRecord, 'id'>

type Comite = Omit<ComiteRecord, 'id'>

type GroupeGouvernance = Readonly<{
  gouvernance: GouvernanceRecord
  noteDeContexte: NoteDeContexte
  comites: ReadonlyArray<Comite>
  membres: Readonly<{
    departements: ReadonlyArray<MembreGouvernanceDepartementRecord>
    sgars: ReadonlyArray<MembreGouvernanceSgarRecord>
    epcis: ReadonlyArray<MembreGouvernanceEpciRecord>
    communes: ReadonlyArray<MembreGouvernanceCommuneRecord>
    structures: ReadonlyArray<MembreGouvernanceStructureRecord>
  }>
}>
