import prisma from '../../../prisma/prismaClient'
import { classerParCategorieJuridique, FamilleDeStructure } from '@/shared/categorieJuridique'

// Membres de gouvernance confirmés et non supprimés, avec la catégorie juridique de leur structure
export async function chargerMembresConfirmes(): Promise<ReadonlyArray<MembreConfirme>> {
  const membres = await prisma.membreRecord.findMany({
    select: {
      gouvernanceDepartementCode: true,
      isCoporteur: true,
      relationStructureAdministrative: {
        select: {
          categorie_juridique: true,
        },
      },
      structureId: true,
    },
    where: {
      dateSuppression: null,
      statut: 'confirme',
    },
  })

  return membres.map((membre) => ({
    codeCategorieJuridique: membre.relationStructureAdministrative.categorie_juridique,
    gouvernance: membre.gouvernanceDepartementCode,
    isCoporteur: membre.isCoporteur,
    structureId: membre.structureId,
  }))
}

// Une structure membre de plusieurs gouvernances n'est comptée qu'une fois ;
// elle est coporteuse si elle l'est dans au moins une gouvernance.
export function synthetiserStructures(
  membres: ReadonlyArray<MembreConfirme>,
  famille: FamilleDeStructure
): SyntheseStructures {
  const structures = new Map<number, Readonly<{ estCoporteur: boolean; libelle: string }>>()

  membres.forEach((membre) => {
    const classement = classerParCategorieJuridique(membre.codeCategorieJuridique)
    if (classement.famille !== famille) {
      return
    }
    const estCoporteur = (structures.get(membre.structureId)?.estCoporteur ?? false) || membre.isCoporteur
    structures.set(membre.structureId, { estCoporteur, libelle: classement.libelle })
  })

  const ventilation = new Map<string, number>()
  structures.forEach(({ libelle }) => {
    ventilation.set(libelle, (ventilation.get(libelle) ?? 0) + 1)
  })

  return {
    nombreCoporteurs: Array.from(structures.values()).filter(({ estCoporteur }) => estCoporteur).length,
    nombreTotal: structures.size,
    ventilationParCategorie: Array.from(ventilation.entries())
      .map(([categorie, count]) => ({ categorie, count }))
      .toSorted(parNombreDecroissant),
  }
}

export type MembreConfirme = Readonly<{
  codeCategorieJuridique: null | string
  gouvernance: string
  isCoporteur: boolean
  structureId: number
}>

type SyntheseStructures = Readonly<{
  nombreCoporteurs: number
  nombreTotal: number
  ventilationParCategorie: ReadonlyArray<Readonly<{ categorie: string; count: number }>>
}>

function parNombreDecroissant(
  itemA: Readonly<{ categorie: string; count: number }>,
  itemB: Readonly<{ categorie: string; count: number }>
): number {
  return itemB.count - itemA.count || itemA.categorie.localeCompare(itemB.categorie)
}
