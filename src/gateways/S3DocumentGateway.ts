// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3'

import { StockageDocumentGateway } from '@/use-cases/commands/shared/StockageDocumentGateway'

const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? '',
  },
  endpoint: process.env.S3_ENDPOINT ?? '',
  forcePathStyle: true,
  region: process.env.S3_REGION,
}

export class S3DocumentGateway implements StockageDocumentGateway {
  readonly #bucket = process.env.S3_BUCKET
  readonly #s3: S3Client

  constructor(s3: S3Client = new S3Client(s3Config)) {
    this.#s3 = s3
  }

  async recuperer(chemin: string): Promise<ReadableStream | undefined> {
    const objet = await this.#s3.send(
      new GetObjectCommand({
        Bucket: this.#bucket,
        Key: chemin,
      })
    )

    return objet.Body?.transformToWebStream()
  }

  async supprimer(chemin: string): Promise<void> {
    await this.#s3.send(
      new DeleteObjectCommand({
        Bucket: this.#bucket,
        Key: chemin,
      })
    )
  }

  async televerser(chemin: string, contenu: Buffer): Promise<void> {
    await this.#s3.send(
      new PutObjectCommand({
        Body: contenu,
        Bucket: this.#bucket,
        ContentType: 'application/pdf',
        Key: chemin,
      })
    )
  }
}
