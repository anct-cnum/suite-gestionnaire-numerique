// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3'

import { StockageDocumentGateway } from '@/use-cases/commands/shared/StockageDocumentGateway'
import { PoidsDocumentLoader } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? '',
  },
  endpoint: process.env.S3_ENDPOINT ?? '',
  forcePathStyle: true,
  region: process.env.S3_REGION,
}

// Un document n'est jamais réécrit sous le même chemin (identifiant unique à chaque dépôt) : son poids peut être
// gardé en mémoire pour la durée de vie du serveur
const poidsEnCache = new Map<string, number>()

const delaiMaximalDeLecture = 2000

export class S3DocumentGateway implements PoidsDocumentLoader, StockageDocumentGateway {
  readonly #bucket = process.env.S3_BUCKET
  readonly #poidsEnCache: Map<string, number>
  readonly #s3: S3Client

  constructor(s3: S3Client = new S3Client(s3Config), cache: Map<string, number> = poidsEnCache) {
    this.#s3 = s3
    this.#poidsEnCache = cache
  }

  async lirePoids(chemin: string): Promise<number | undefined> {
    const poidsConnu = this.#poidsEnCache.get(chemin)
    if (poidsConnu !== undefined) {
      return poidsConnu
    }

    const entete = await this.#s3.send(
      new HeadObjectCommand({
        Bucket: this.#bucket,
        Key: chemin,
      }),
      { abortSignal: AbortSignal.timeout(delaiMaximalDeLecture) }
    )

    if (entete.ContentLength !== undefined) {
      this.#poidsEnCache.set(chemin, entete.ContentLength)
    }
    return entete.ContentLength
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
