/* eslint-disable no-console */
import { Prisma } from '@prisma/client'

import { Prisma as PrismaFNE } from './fne/client-fne'
import prismaFNE from './fne/prismaClientFne'
import prisma from '../prisma/prismaClient'

void (async function migrate(): Promise<void> {

  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des gouvernances commence')

  const { gouvernances, notesDeContexte, comites } = await prismaFNE.gouvernance
    .findMany({
      include: {
        comites: true,
        relationEpci: true,
        relationUserCreateur: true,
        relationUserDerniereModification: true,
      },
      where: {
        suppression: null,
      },
    })
    .then(grouperDonneesACreer)
    .then(formaterDonneesACreer)

  console.log(greenColor, `${gouvernances.length} gouvernances FNE sont récupérées`)
  console.log(greenColor, `${comites.length} comites FNE sont récupérés`)

  await prisma.gouvernanceRecord.createMany({ data: [...gouvernances], skipDuplicates: true })

  const gouvernanceIdsByFNEIds = await recupererLesIdsGouvernance()

  const gouvernancesCreees = await prisma.noteDeContexteRecord.createMany({
    data: [...remplacerFNEIdsParIdsGeneres(gouvernanceIdsByFNEIds, notesDeContexte)],
    skipDuplicates: true,
  })
  const comitesCrees = await prisma.comiteRecord.createMany({
    data: [...remplacerFNEIdsParIdsGeneres(gouvernanceIdsByFNEIds, comites)],
    skipDuplicates: true,
  })

  console.log(greenColor, `${gouvernancesCreees.count} gouvernances sont insérées`)
  console.log(greenColor, `${comitesCrees.count} comites sont insérés`)

  console.log(greenColor, 'La migration des gouvernances est finie')
})()

async function grouperDonneesACreer(
  gouvernancesFNE: ReadonlyArray<GouvernanceFNE>
): Promise<GouvernanceFNEEtAssociations> {
  return Promise.all(
    gouvernancesFNE.map(async (gouvernanceFNE) =>
      Promise.all([
        gouvernanceFNE,
        idUtilisateurViaEmail(gouvernanceFNE.relationUserCreateur.email),
        idUtilisateurViaEmail(gouvernanceFNE.relationUserDerniereModification.email),
      ]).then(([gouvernanceFNE, createurId, editeurNoteDeContexteId]) => ({
        createurId,
        editeurNoteDeContexteId,
        gouvernanceFNE,
      })))
  )
}

function formaterDonneesACreer(donneesAFormaterGroupees: GouvernanceFNEEtAssociations): GroupeGouvernances {
  return donneesAFormaterGroupees
    .reduce<GroupeGouvernances>(
      (groupe, { createurId, editeurNoteDeContexteId, gouvernanceFNE }) => ({
        comites: [
          ...groupe.comites,
          gouvernanceFNE.comites.map((comiteFNE) => ({
            commentaire: comiteFNE.commentaire,
            creation: comiteFNE.creation,
            derniereEdition: comiteFNE.modification,
            frequence: comiteFNE.frequence,
            gouvernanceFNEId: gouvernanceFNE.id,
            type: comiteFNE.type !== 'autre' ? comiteFNE.type.toString() : comiteFNE.typeAutrePrecision ?? '',
          })),
        ].flat(),
        gouvernances: [
          ...groupe.gouvernances,
          {
            createurId,
            departementCode: gouvernanceFNE.departementCode,
            departementPorteurCode: gouvernanceFNE.porteurDepartementCode,
            epciPorteur: gouvernanceFNE.relationEpci?.nom,
            idFNE: gouvernanceFNE.id,
            sgarPorteurCode: gouvernanceFNE.porteurRegionCode,
            siretPorteur: gouvernanceFNE.porteurSiret,
          },
        ],
        notesDeContexte: [
          ...groupe.notesDeContexte,
          {
            contenu: gouvernanceFNE.noteDeContexte,
            derniereEdition: gouvernanceFNE.modification,
            editeurId: editeurNoteDeContexteId,
            gouvernanceFNEId: gouvernanceFNE.id,
          },
        ],
      }),
      { comites: [], gouvernances: [], notesDeContexte: [] }
    )
}

async function recupererLesIdsGouvernance(): Promise<GouvernanceIdsByFNEId> {
  return prisma.gouvernanceRecord.findMany({
    select: {
      id: true,
      idFNE: true,
    },
  }).then((ids) => ids.reduce((idByFNEId, { id, idFNE }) => ({ ...idByFNEId, [idFNE]: id }), {}))
}

function remplacerFNEIdsParIdsGeneres<T extends WithGouvernanceFNEId>(
  gouvernanceIdsByFNEIds: GouvernanceIdsByFNEId,
  withGouvernanceFNEIds: ReadonlyArray<T>
): ReadonlyArray<Omit<T, 'gouvernanceFNEId'> & Readonly<{gouvernanceId: number}>> {
  return withGouvernanceFNEIds.map(({ gouvernanceFNEId, ...rest }) => ({
    ...rest,
    gouvernanceId: gouvernanceIdsByFNEIds[gouvernanceFNEId],
  }))
}

async function idUtilisateurViaEmail(email: string): Promise<number> {
  return prisma.utilisateurRecord
    .findUniqueOrThrow({
      where: {
        ssoEmail: email,
      },
    })
    .then(({ id }) => id)
}

type GouvernanceFNE = PrismaFNE.$GouvernancePayload['scalars'] &
  Readonly<{
    relationEpci: PrismaFNE.$EpciPayload['scalars'] | null
    relationUserCreateur: PrismaFNE.$UserFNEPayload['scalars']
    relationUserDerniereModification: PrismaFNE.$UserFNEPayload['scalars']
    comites: ReadonlyArray<PrismaFNE.$ComitePayload['scalars']>
  }>

type GouvernanceFNEEtAssociations = ReadonlyArray<{
  gouvernanceFNE: GouvernanceFNE
  createurId: number
  editeurNoteDeContexteId: number
}>

type WithGouvernanceFNEId = Readonly<{ gouvernanceFNEId: string }>

type NoteDeContexteAvecGouvernanceFNEId = Omit<Prisma.NoteDeContexteRecordUncheckedCreateInput, 'gouvernanceId'>
  & WithGouvernanceFNEId

type ComiteAvecGouvernanceFNEId = Omit<Prisma.ComiteRecordUncheckedCreateInput, 'gouvernanceId'> & WithGouvernanceFNEId

type GouvernanceIdsByFNEId = Readonly<Record<string, number>>

type GroupeGouvernances = Readonly<{
  gouvernances: ReadonlyArray<Prisma.GouvernanceRecordUncheckedCreateInput>
  notesDeContexte: ReadonlyArray<NoteDeContexteAvecGouvernanceFNEId>
  comites: ReadonlyArray<ComiteAvecGouvernanceFNEId>
}>
