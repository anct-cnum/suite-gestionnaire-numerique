import { FeuilleDeRouteDocumentRecord } from '@prisma/client'

// La table feuille_de_route_document est la seule source du document d'une feuille de
// route (étape 4 de la refonte : piece_jointe est décommissionnée).
export function documentDeFeuilleDeRoute(
  record: Readonly<{ documents: ReadonlyArray<FeuilleDeRouteDocumentRecord> }>
): Readonly<{ chemin: string; nom: string }> | undefined {
  const document = record.documents[0] as FeuilleDeRouteDocumentRecord | undefined
  if (document) {
    return { chemin: document.chemin, nom: document.nom }
  }
  return undefined
}
