import { createChallenge, verifySolution } from 'altcha-lib'
import { deriveKey } from 'altcha-lib/algorithms/sha'
import { z } from 'zod'

import { DefiAProposer, Difficulte } from '@/domain/mesure-impact/AntiAbus'
import { PreuveVerifiee, VerificateurDePreuve } from '@/use-cases/mesure-impact/DeposerUneReponse'
import { FabriqueDeDefi } from '@/use-cases/mesure-impact/ProposerUnDefi'

// Preuve de travail ALTCHA (bibliothèque MIT), hébergée par MIN : aucun service externe.
// Le défi est signé par HMAC avec une clé secrète du serveur. Il porte son échéance et la campagne,
// couvertes par la signature. Le navigateur cherche un nombre dont l'empreinte SHA-256 commence par
// un préfixe : chaque chiffre hexadécimal de plus multiplie le calcul par 16.
export class AltchaPreuveDeTravail implements FabriqueDeDefi, VerificateurDePreuve {
  readonly #cleHmac: string | undefined

  constructor(cleHmac: string | undefined) {
    this.#cleHmac = cleHmac
  }

  async creer({ difficulte, expiration, identifiantPublic }: DefiCree): Promise<string> {
    const defi = await createChallenge({
      algorithm: 'SHA-256',
      cost: 1,
      data: { campagne: identifiantPublic },
      deriveKey,
      expiresAt: expiration,
      hmacSignatureSecret: this.#cle(),
      keyPrefix: PREFIXES[difficulte],
    })
    return JSON.stringify(defi)
  }

  async verifier(preuve: string, identifiantPublic: string): Promise<null | PreuveVerifiee> {
    const lue = lirePreuve(preuve)
    if (lue === null) {
      return null
    }
    const { challenge, solution } = lue
    const verification = await verifySolution({ challenge, deriveKey, hmacSignatureSecret: this.#cle(), solution })
    const { data, expiresAt } = challenge.parameters
    if (!verification.verified || data?.campagne !== identifiantPublic || expiresAt === undefined) {
      return null
    }
    return { empreinte: challenge.signature, expiration: new Date(expiresAt * 1000) }
  }

  #cle(): string {
    if (this.#cleHmac === undefined || this.#cleHmac === '') {
      throw new Error('La clé ALTCHA_HMAC_KEY n’est pas définie')
    }
    return this.#cleHmac
  }
}

type DefiCree = DefiAProposer & Readonly<{ identifiantPublic: string }>

const PREFIXES: Readonly<Record<Difficulte, string>> = {
  // Environ 4 000 essais en moyenne : imperceptible, même sur un téléphone ancien
  normale: '000',
  // Environ 65 000 essais : quelques secondes, le temps de répondre aux dernières questions
  renforcee: '0000',
}

// La preuve vient du navigateur : sa forme est vérifiée avant tout calcul, sa signature ensuite
function lirePreuve(preuve: string): null | z.infer<typeof schemaPreuve> {
  try {
    const resultat = schemaPreuve.safeParse(JSON.parse(preuve))
    return resultat.success ? resultat.data : null
  } catch {
    return null
  }
}

const schemaPreuve = z.object({
  challenge: z.object({
    parameters: z.object({
      algorithm: z.string().max(20),
      cost: z.number(),
      data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
      expiresAt: z.number().optional(),
      keyLength: z.number(),
      keyPrefix: z.string().max(100),
      nonce: z.string().max(200),
      salt: z.string().max(200),
    }),
    signature: z.string().max(200),
  }),
  solution: z.object({ counter: z.number(), derivedKey: z.string().max(200) }),
})
