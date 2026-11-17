import { z } from 'zod'

// Forme d'un questionnaire envoyé, en ligne ou en saisie : sa cohérence avec le questionnaire est vérifiée
// ensuite par le domaine
const texte = z.string().max(2000)

const reponseQuestion = z
  .object({
    autre: texte.optional(),
    lequel: z.array(z.string().max(100)).max(20).optional(),
    lequelTexte: texte.optional(),
    pourquoi: texte.optional(),
    valeur: z.union([
      z.string().max(100),
      z.array(z.string().max(100)).max(30),
      z.record(z.string().max(100), z.string().max(100)),
    ]),
  })
  .strict()

export const contenuValidator = z
  .record(z.string().max(20), reponseQuestion)
  .refine((contenu) => Object.keys(contenu).length <= 40, { message: 'Trop de réponses' })
