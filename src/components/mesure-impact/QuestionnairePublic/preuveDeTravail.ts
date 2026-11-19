import { Challenge, ChallengeParameters, DeriveKeyFunctionResult, solveChallenge } from 'altcha-lib'

import { proposerUnDefiAction } from '@/app/api/actions/mesure-impact/proposerUnDefiAction'

// Anti-abus du questionnaire public : le navigateur résout un défi signé par le serveur (preuve de travail
// ALTCHA). Rien n'est affiché : le calcul tourne pendant que la personne répond aux dernières questions.
export async function preparerUnePreuve(identifiantPublic: string): Promise<string> {
  const challenge = JSON.parse(await proposerUnDefiAction({ identifiantPublic })) as Challenge
  const solution = await solveChallenge({ challenge, deriveKey: empreinte })
  if (solution === null) {
    throw new Error('Le défi anti-abus n’a pas été résolu à temps')
  }
  return JSON.stringify({ challenge, solution })
}

// Empreinte SHA du navigateur (Web Crypto), répétée `cost` fois : le pendant de altcha-lib/algorithms/sha,
// qui repose sur node:crypto
async function empreinte(
  parameters: ChallengeParameters,
  salt: Uint8Array,
  password: Uint8Array
): Promise<DeriveKeyFunctionResult> {
  const depart = new Uint8Array(salt.length + password.length)
  depart.set(salt)
  depart.set(password, salt.length)
  const derivedKey = await hacher(parameters.algorithm, depart, Math.max(1, parameters.cost))
  return { derivedKey: derivedKey.subarray(0, parameters.keyLength) }
}

async function hacher(algorithme: string, donnees: Uint8Array, fois: number): Promise<Uint8Array> {
  const resultat = new Uint8Array(await crypto.subtle.digest(algorithme, donnees as Uint8Array<ArrayBuffer>))
  return fois === 1 ? resultat : hacher(algorithme, resultat, fois - 1)
}
