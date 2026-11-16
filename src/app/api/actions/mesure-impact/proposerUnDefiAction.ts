'use server'

import { z } from 'zod'

import { AltchaPreuveDeTravail } from '@/gateways/mesure-impact/AltchaPreuveDeTravail'
import { PrismaReponseLoader } from '@/gateways/mesure-impact/PrismaReponseLoader'
import { ProposerUnDefi } from '@/use-cases/mesure-impact/ProposerUnDefi'

// Défi anti-abus demandé par le questionnaire public avant l'envoi. Lecture seule : rien à journaliser.
export async function proposerUnDefiAction(actionParams: ActionParams): Promise<string> {
  const { identifiantPublic } = validator.parse(actionParams)
  return new ProposerUnDefi(
    new PrismaReponseLoader(),
    new AltchaPreuveDeTravail(process.env.ALTCHA_HMAC_KEY),
    new Date()
  ).handle({ identifiantPublic })
}

type ActionParams = Readonly<{
  identifiantPublic: string
}>

const validator = z.object({
  identifiantPublic: z.string().min(1).max(100),
})
