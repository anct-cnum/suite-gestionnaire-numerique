import { FeuilleDeRouteDocumentRecord } from '@prisma/client'

// Étape 2 de la refonte des documents : la table feuille_de_route_document devient la
// source de lecture, avec repli sur piece_jointe tant qu'une ligne miroir peut manquer.
export function documentDeFeuilleDeRoute(
  record: Readonly<{ documents: ReadonlyArray<FeuilleDeRouteDocumentRecord>; pieceJointe: null | string }>
): Readonly<{ chemin: string; nom: string }> | undefined {
  const document = record.documents[0] as FeuilleDeRouteDocumentRecord | undefined
  if (document) {
    return { chemin: document.chemin, nom: document.nom }
  }
  if (record.pieceJointe === null) {
    return undefined
  }
  return {
    chemin: record.pieceJointe,
    nom: record.pieceJointe.split('/').pop() ?? 'document',
  }
}
