import { Prisma } from '@prisma/client'

import { Prisma as PrismaFNE } from './fne/client-fne'
import prismaFNE from './fne/prismaClientFne'
import prisma from '../prisma/prismaClient'

void (async function migrate(): Promise<void> {
  await prismaFNE.gouvernance
    .findMany({
      include: {
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
    .then(async ({ gouvernances, notesDeContexte }) => creerGouvernances(gouvernances)
      .then(async () => associerNoteDeContexteAGouvernanceId(notesDeContexte))
      .then(creerNotesDeContexte))
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
  return donneesAFormaterGroupees.reduce<GroupeGouvernances>(
    (
      { gouvernances, notesDeContexte },
      { gouvernanceFNE, createurId, editeurNoteDeContexteId }
    ) => ({
      gouvernances: [
        ...gouvernances,
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
        ...notesDeContexte,
        {
          contenu: gouvernanceFNE.noteDeContexte,
          derniereEdition: gouvernanceFNE.modification,
          editeurId: editeurNoteDeContexteId,
          gouvernanceFNEId: gouvernanceFNE.id,
        },
      ],
    }),
    { gouvernances: [], notesDeContexte: [] }
  )
}

async function creerGouvernances(
  gouvernances: ReadonlyArray<Prisma.GouvernanceRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.gouvernanceRecord
    .createMany({
      data: [...gouvernances],
      skipDuplicates: true,
    })
}

async function associerNoteDeContexteAGouvernanceId(
  notesDeContexte: ReadonlyArray<NoteDeContexteAvecGouvernanceFNEId>
): Promise<ReadonlyArray<Prisma.NoteDeContexteRecordUncheckedCreateInput>> {
  return Promise.all(
    notesDeContexte.map(async (noteDeContexte) =>
      prisma.gouvernanceRecord.findUniqueOrThrow({
        select: {
          id: true,
        },
        where: {
          idFNE: noteDeContexte.gouvernanceFNEId,
        },
      }).then(({ id }) => ({
        contenu: noteDeContexte.contenu,
        derniereEdition: noteDeContexte.derniereEdition,
        editeurId: noteDeContexte.editeurId,
        gouvernanceId: id,
      })))
  )
}

async function creerNotesDeContexte(
  notesDeContexte: ReadonlyArray<Prisma.NoteDeContexteRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.noteDeContexteRecord.createMany({
    data: [...notesDeContexte],
    skipDuplicates: true,
  })
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
  }>

type GouvernanceFNEEtAssociations = ReadonlyArray<{
  gouvernanceFNE: GouvernanceFNE
  createurId: number
  editeurNoteDeContexteId: number
}>

type NoteDeContexteAvecGouvernanceFNEId = Omit<
  Prisma.NoteDeContexteRecordUncheckedCreateInput,
  'gouvernanceId'
> & Readonly<{ gouvernanceFNEId: string }>

type GroupeGouvernances = Readonly<{
  gouvernances: ReadonlyArray<Prisma.GouvernanceRecordUncheckedCreateInput>
  notesDeContexte: ReadonlyArray<NoteDeContexteAvecGouvernanceFNEId>
}>
