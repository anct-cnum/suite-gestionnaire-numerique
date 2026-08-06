export interface StockageDocumentGateway {
  televerser(chemin: string, contenu: Buffer): Promise<void>
}
