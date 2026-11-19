import { Prisma } from '../../../prisma/generated/client'
import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  CommuneReadModel,
  DepartementIfnReadModel,
  DepartementsReadModel,
  IndicesLoader,
} from '@/use-cases/queries/RecupererMesIndicesDeFragilite'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaIndicesDeFragiliteLoader implements IndicesLoader {
  async getForCommunes(codesInsee: ReadonlyArray<string>): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>> {
    try {
      const [communes, noms] = await Promise.all([
        prisma.ifnCommune.findMany({
          select: {
            codeInsee: true,
            score: true,
          },
          where: {
            codeInsee: {
              in: [...codesInsee],
            },
          },
        }),
        prisma.commune.findMany({
          select: { code_insee: true, nom: true },
          where: { code_insee: { in: [...codesInsee] } },
        }),
      ])

      return avecNomsDeCommunes(new Set(codesInsee), communes, noms)
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        operation: 'getForCommunes',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }

  async getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>> {
    try {
      const [communes, noms] = await Promise.all([
        prisma.ifnCommune.findMany({
          select: {
            codeInsee: true,
            score: true,
          },
          where: {
            codeInsee: {
              startsWith: codeDepartement,
            },
          },
        }),
        prisma.commune.findMany({
          select: { code_insee: true, nom: true },
          where: { code_insee: { startsWith: codeDepartement } },
        }),
      ])

      const codesInsee = new Set([
        ...communes.map(({ codeInsee }) => codeInsee),
        ...noms.map(({ code_insee }) => code_insee),
      ])
      return avecNomsDeCommunes(codesInsee, communes, noms)
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        codeDepartement,
        operation: 'getForDepartement',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }

  async getForDepartements(
    codesDepartement: ReadonlyArray<string>
  ): Promise<ErrorReadModel | ReadonlyArray<DepartementIfnReadModel>> {
    try {
      const [departements, noms] = await Promise.all([
        prisma.ifn_departement.findMany({
          select: {
            code: true,
            score: true,
          },
          where: {
            code: {
              in: [...codesDepartement],
            },
          },
        }),
        prisma.admin_departement.findMany({
          select: { code: true, nom: true },
          where: { code: { in: [...codesDepartement] } },
        }),
      ])

      return avecNomsDeDepartements(departements, noms)
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        operation: 'getForDepartements',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }

  async getForFrance(): Promise<DepartementsReadModel | ErrorReadModel> {
    try {
      const [departements, icpDepartements, noms] = await Promise.all([
        prisma.ifn_departement.findMany({
          select: {
            code: true,
            score: true,
          },
        }),
        prisma.icp_departement.findMany({
          select: {
            code: true,
            label: true,
          },
        }),
        prisma.admin_departement.findMany({ select: { code: true, nom: true } }),
      ])
      const nomParCode = new Map(noms.map(({ code, nom }) => [code, nom]))

      const icpMap = new Map(
        icpDepartements.map((icp: { code: string; label: null | string }) => [icp.code, icp.label])
      )

      const statistiquesicp = {
        appuinecessaire: 0,
        atteignable: 0,
        compromis: 0,
        nonenregistres: 0,
        securise: 0,
      }

      const departementsWithIcp = departements.map((departement) => {
        const label = icpMap.get(departement.code)

        switch (label) {
          case 'appuis nécessaires':
            statistiquesicp.appuinecessaire += 1
            break
          case 'objectifs atteignables':
            statistiquesicp.atteignable += 1
            break
          case 'objectifs compromis':
            statistiquesicp.compromis += 1
            break
          case 'objectifs sécurisés':
            statistiquesicp.securise += 1
            break
          case null:
          case undefined:
          default:
            statistiquesicp.nonenregistres += 1
            break
        }

        return {
          codeDepartement: departement.code,
          ifn: Number(departement.score),
          indiceConfiance: label ?? null,
          nom: nomParCode.get(departement.code),
        }
      })

      // Un département sans indice reste affiché, avec une donnée non disponible
      const departementsSansIndice = avecNomsDeDepartements(departements, noms)
        .filter(({ ifn }) => ifn === null)
        .map((departement) => ({ ...departement, indiceConfiance: icpMap.get(departement.codeDepartement) ?? null }))

      return {
        departements: [...departementsWithIcp, ...departementsSansIndice],
        statistiquesicp,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        operation: 'getForFrance',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }
}

function avecNomsDeCommunes(
  codesInsee: ReadonlySet<string>,
  communes: ReadonlyArray<Readonly<{ codeInsee: string; score: Prisma.Decimal }>>,
  noms: ReadonlyArray<Readonly<{ code_insee: string; nom: string }>>
): ReadonlyArray<CommuneReadModel> {
  const scoreParCode = new Map(communes.map(({ codeInsee, score }) => [codeInsee, Number(score)]))
  const nomParCode = new Map(noms.map(({ code_insee: codeInsee, nom }) => [codeInsee, nom]))
  return [...codesInsee].map((codeInsee) => ({
    codeInsee,
    ifn: scoreParCode.get(codeInsee) ?? null,
    nom: nomParCode.get(codeInsee),
  }))
}

function avecNomsDeDepartements(
  departements: ReadonlyArray<Readonly<{ code: string; score: Prisma.Decimal }>>,
  noms: ReadonlyArray<Readonly<{ code: string; nom: string }>>
): ReadonlyArray<DepartementIfnReadModel> {
  const scoreParCode = new Map(departements.map(({ code, score }) => [code, Number(score)]))
  const nomParCode = new Map(noms.map(({ code, nom }) => [code, nom]))
  const codes = new Set([...nomParCode.keys(), ...scoreParCode.keys()])
  return [...codes].map((code) => ({
    codeDepartement: code,
    ifn: scoreParCode.get(code) ?? null,
    nom: nomParCode.get(code),
  }))
}
