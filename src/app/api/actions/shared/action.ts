import { z } from 'zod'

export const ActionValidator = z.object({
  anneeDeDebut: z.string().min(1, { message: 'La date de début est obligatoire' }),
  anneeDeFin: z.string().nullish(),
  besoins: z.array(z.string()).min(1, { message: 'Au moins un besoin est obligatoire' }),
  contexte: z.string().min(1, { message: 'Le contexte est obligatoire' }),
  demandeDeSubvention: z.object({
    enveloppe: z.object({
      budget: z.number(),
      isSelected: z.boolean(),
      label: z.string(),
      value: z.string(),
    }).nullish(),
    montantPrestation: z.number().nullish(),
    montantRh: z.number().nullish(),
    total: z.number().nullish(),
  }).nullish(),
  description: z.string().min(1, { message: 'La description est obligatoire' }),
  destinataires: z.array(z.string()).nullish(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
}).refine((data) => {
  if (data.anneeDeFin === undefined || data.anneeDeFin === '' || data.anneeDeFin === null) {return true}
  const dateDeDebut = new Date(data.anneeDeDebut)
  const dateDeFin = new Date(data.anneeDeFin)
  return dateDeFin > dateDeDebut
}, { message: 'La date de fin doit être supérieure à la date de début' }).refine((data) => {
  if (data.demandeDeSubvention === undefined || data.demandeDeSubvention === null) {return true}
  return data.destinataires?.length !== 0
}, { message: 'La liste des destinataires de la demande de subvention doit être non vide' })
  