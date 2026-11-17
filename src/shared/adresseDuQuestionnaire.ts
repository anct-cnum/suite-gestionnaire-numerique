// Adresse publique du questionnaire d'une campagne, à diffuser (lien, QR code). En production, le questionnaire
// est publié sur le site vitrine (#2263) : MIN est sur `mon.inclusion-numerique…`, la vitrine sur le même domaine
// sans `mon.`. Ailleurs, l'adresse reste sur l'hôte de l'application, pour qu'un essai ne réponde jamais en
// production.
export function adresseDuQuestionnaire(hoteDeMin: string, identifiantPublic: string): string {
  const url = new URL(hoteDeMin)
  if (url.hostname === HOTE_DE_MIN_EN_PRODUCTION) {
    url.hostname = HOTE_DE_LA_VITRINE
  }
  return `${url.origin}/questionnaire/${encodeURIComponent(identifiantPublic)}`
}

const HOTE_DE_LA_VITRINE = 'inclusion-numerique.anct.gouv.fr'

const HOTE_DE_MIN_EN_PRODUCTION = `mon.${HOTE_DE_LA_VITRINE}`
