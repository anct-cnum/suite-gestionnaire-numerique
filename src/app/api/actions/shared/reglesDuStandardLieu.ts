import {
  ComplementAdresse,
  Courriel,
  DETAIL_LONGUEUR_MAXIMALE,
  Horaires,
  Nom,
  RESUME_LONGUEUR_MAXIMALE,
  Siret,
  Telephone,
  telephoneCanonique,
  Typologie,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'

// Règles de saisie d'un lieu, mesurées à la bibliothèque du standard des lieux de médiation
// numérique (#2103). Le registre main.lieu_inclusion est partagé avec la Coop, qui y lit les
// écritures de MIN et les valide avec cette même bibliothèque : ce que MIN y range doit être
// ce que le standard accepte. Une saisie vide reste permise là où elle signifie « effacer ».

const SEPARATEUR_LISTE = '|'

const TYPOLOGIES_DU_STANDARD: ReadonlySet<string> = new Set(Object.values(Typologie))

export const nomDuStandard = z
  .string()
  .trim()
  .refine((valeur) => Nom.safe(valeur) !== null, { message: 'Le nom du lieu d’activité doit être renseigné' })

// Un lieu n'a qu'un SIRET (clé de Luhn), facultatif : le RIDET calédonien reste réservé aux
// structures, et le standard ne le connaît pas.
export const siretDuStandard = facultatif(
  (valeur) => Siret.safe(valeur) !== null,
  'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle'
)

export const complementAdresseDuStandard = facultatif(
  (valeur) => ComplementAdresse.safe(valeur) !== null,
  'Ce complément contient un caractère que le schéma national n’accepte pas : évitez #, %, les guillemets droits (") et un tiret ou une arobase en tête'
)

export const typologiesDuStandard = z.array(z.string()).superRefine((typologies, contexte) => {
  const inconnues = typologies.filter((typologie) => !TYPOLOGIES_DU_STANDARD.has(typologie))
  if (inconnues.length > 0) {
    contexte.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Typologie inconnue du schéma national : ${inconnues.join(', ')}`,
    })
  }
})

export const presentationResumeDuStandard = z
  .string()
  .max(RESUME_LONGUEUR_MAXIMALE, `Le résumé doit faire au plus ${RESUME_LONGUEUR_MAXIMALE} caractères`)
  .optional()

export const presentationDetailDuStandard = z
  .string()
  .max(DETAIL_LONGUEUR_MAXIMALE, `La présentation détaillée doit faire au plus ${DETAIL_LONGUEUR_MAXIMALE} caractères`)
  .optional()

export const horairesDuStandard = facultatif(
  (valeur) => Horaires.safe(valeur) !== null,
  'Les horaires ne respectent pas le format du schéma national'
)

export const urlDuStandard = facultatif(estUneUrl, 'Veuillez renseigner une URL valide (https://…)')

export const sitesWebDuStandard = facultatif(
  (valeur) => valeur.split(SEPARATEUR_LISTE).every(estUneUrl),
  'Veuillez renseigner une URL valide, ou plusieurs séparées par « | »'
)

// Le numéro se tape comme on veut ; c'est sa forme canonique (+33…) que le standard reconnaît
// et que MIN range.
export const telephoneDuStandard = z
  .string()
  .trim()
  .optional()
  .transform((valeur, contexte) => {
    if (valeur === undefined || valeur === '') {
      return valeur
    }
    const canonique = telephoneCanonique(valeur)
    if (canonique === null || Telephone.safe(canonique) === null) {
      contexte.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez renseigner un numéro de téléphone français ou d’outre-mer',
      })
      return z.NEVER
    }
    return canonique
  })

export const courrielDuStandard = facultatif(
  (valeur) => Courriel.safe(valeur) !== null,
  'Veuillez renseigner une adresse électronique valide'
)

function facultatif(
  estReconnue: (valeur: string) => boolean,
  message: string
): z.ZodOptional<z.ZodEffects<z.ZodString>> {
  return z
    .string()
    .trim()
    .refine((valeur) => valeur === '' || estReconnue(valeur), { message })
    .optional()
}

function estUneUrl(valeur: string): boolean {
  return Url.safe(valeur) !== null
}
