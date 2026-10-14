import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const MESSAGE_DROITS_STRUCTURE_INSUFFISANTS = "Vous n'avez pas les droits pour modifier cette structure"
export const MESSAGE_CONTACT_HORS_STRUCTURE = "Ce contact n'appartient pas à cette structure"

// Vérification partagée par les actions qui écrivent sur une structure (contacts…) :
// session → contexte de l'utilisateur → droit de gestion sur la structure réellement visée.
// Le périmètre est celui de la fiche structure : sa propre structure, ou un département dont
// la gouvernance compte cette structure parmi ses membres confirmés.
export async function verifierDroitsStructure(structureId: number): Promise<VerificationDroitsStructure> {
  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const membreLoader = new PrismaMembreLoader()
  const contexte = await resoudreContexte(utilisateur, membreLoader)

  const appartenances = await membreLoader.getToutesAppartenancesParStructureId(structureId)
  const codesDepartements = appartenances.map((appartenance) => appartenance.codeDepartement)

  if (!contexte.peutGererStructure(structureId, codesDepartements)) {
    return { message: MESSAGE_DROITS_STRUCTURE_INSUFFISANTS, statut: 'refus' }
  }

  return { statut: 'ok' }
}

type VerificationDroitsStructure = Readonly<{ message: string; statut: 'refus' }> | Readonly<{ statut: 'ok' }>
