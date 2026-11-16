// Anti-abus du questionnaire public, sans aucune adresse IP : chaque envoi en ligne porte la preuve
// d'un petit calcul fait par le navigateur (preuve de travail), à partir d'un défi signé à usage unique.
// Le calcul passe inaperçu pour une personne qui répond, et coûte cher à qui enverrait en masse.
// Quand une campagne reçoit une rafale de réponses, le défi devient plus difficile.

export function defiAProposer(reponsesDeLHeure: number, maintenant: Date): DefiAProposer {
  return {
    difficulte: reponsesDeLHeure >= SEUIL_DE_RAFALE ? 'renforcee' : 'normale',
    expiration: new Date(maintenant.getTime() + DUREE_DE_VALIDITE),
  }
}

export type Difficulte = 'normale' | 'renforcee'

export type DefiAProposer = Readonly<{
  difficulte: Difficulte
  expiration: Date
}>

// Au-delà d'une séance collective nombreuse
const SEUIL_DE_RAFALE = 100

// Le défi est demandé à l'arrivée sur la dernière étape : une heure laisse le temps d'y répondre
const DUREE_DE_VALIDITE = 3_600_000
