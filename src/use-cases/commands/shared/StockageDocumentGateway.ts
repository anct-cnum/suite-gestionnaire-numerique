export interface StockageDocumentGateway {
  supprimer(chemin: string): Promise<void>
  televerser(chemin: string, contenu: Buffer): Promise<void>
}
