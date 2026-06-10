import {
  MembreAConsoliderReadModel,
  MembresAConsoliderReadModel,
  RegleConsolidation,
} from '@/use-cases/queries/RechercherMembresAConsolider'

export function membresAConsoliderPresenter(readModel: MembresAConsoliderReadModel): MembresAConsoliderViewModel {
  return {
    membres: readModel.map(versLigneViewModel),
    total: readModel.length,
  }
}

export type MembresAConsoliderViewModel = Readonly<{
  membres: ReadonlyArray<MembreLigneViewModel>
  total: number
}>

// Métadonnées d'affichage des règles de détection : titre, accroche, conditions métier détaillées,
// et si la règle est branchée (sinon onglet « à venir »).
const CATALOGUE_REGLES: ReadonlyArray<
  Readonly<{
    conditions: ReadonlyArray<string>
    disponible: boolean
    id: RegleConsolidation
    sousTitre: string
    titre: string
  }>
> = [
  {
    conditions: [
      'Le membre est rattaché à une structure « antenne » (champ denomination_antenne renseigné) : le nom affiché provient de cette antenne, pas de la structure canonique.',
      'Cette structure ne porte aucune activité : ni poste, ni contrat, ni affectation, ni lieu d’inclusion.',
      'Une autre structure du même SIREN (même entité juridique) concentre cette activité — c’est l’établissement réel proposé.',
      'L’identifiant du membre correspond bien à cette entité (les cas « autre SIRET » relèvent d’une autre règle).',
    ],
    disponible: true,
    id: 'structure-fantome',
    sousTitre:
      'Membre rattaché à une antenne sans aucune activité, alors qu’un établissement actif du même SIREN existe.',
    titre: 'Structure fantôme',
  },
  {
    conditions: [
      'Le membre est rattaché à une structure dont le SIRET / SIREN ne correspond pas à son identifiant métier.',
      'La structure rattachée est une autre personne morale — parfois sur un autre territoire (ex. Angers rattaché à la mairie de Bonifacio).',
      'Le bon rattachement existe (ou doit être créé) sur l’entité réelle du membre.',
      'Geste attendu : re-rattacher le membre à la bonne structure — et non fusionner, car ce sont des entités juridiques distinctes.',
    ],
    disponible: false,
    id: 'mauvaise-entite',
    sousTitre: 'Membre rattaché à une autre entité juridique (SIRET différent), parfois un autre territoire.',
    titre: 'Mauvaise entité',
  },
  {
    conditions: [
      'Le membre est une commune, mais il est rattaché à une structure d’une autre forme juridique : son CCAS, son EPCI, un syndicat…',
      'Même territoire, mais entité « satellite » de la commune.',
      'Souvent intentionnel côté métier (c’est le satellite qui agit) — à confirmer au cas par cas.',
      'Geste attendu : arbitrage métier, puis re-rattachement à la commune si nécessaire.',
    ],
    disponible: false,
    id: 'commune-ccas-epci',
    sousTitre: 'Commune rattachée à son propre CCAS ou EPCI (même territoire, forme juridique différente).',
    titre: 'Commune via son CCAS/EPCI',
  },
  {
    conditions: [
      'Le membre est rattaché à une antenne (champ denomination_antenne renseigné).',
      'Une structure canonique (sans denomination_antenne) portant le même SIRET existe déjà en base.',
      'Le nom affiché serait correct si le membre pointait sur la canonique.',
      'Geste attendu : re-rattacher le membre à la structure canonique.',
    ],
    disponible: false,
    id: 'canonique-disponible',
    sousTitre: 'Membre sur une antenne alors que la structure canonique du même SIRET existe.',
    titre: 'Canonique disponible',
  },
]

export function reglesPresenter(regleActive: RegleConsolidation): ReadonlyArray<RegleViewModel> {
  return CATALOGUE_REGLES.map((regle) => ({
    actif: regle.id === regleActive,
    conditions: regle.conditions,
    disponible: regle.disponible,
    href: `/membres-a-consolider?regle=${regle.id}`,
    id: regle.id,
    sousTitre: regle.sousTitre,
    titre: regle.disponible ? regle.titre : `${regle.titre} (à venir)`,
  }))
}

export type RegleViewModel = Readonly<{
  actif: boolean
  conditions: ReadonlyArray<string>
  disponible: boolean
  href: string
  id: RegleConsolidation
  sousTitre: string
  titre: string
}>

export type MembreLigneViewModel = Readonly<{
  departement: string
  estCoporteur: boolean
  // ids des SA du SIREN à comparer/fusionner via l'outil existant.
  idsParam: string
  membreId: string
  nbSaDuSiren: number
  // Nom actuellement AFFICHÉ dans MIN = denomination_antenne de la SA rattachée (souvent faux).
  nomActuelAffiche: string
  // Nom porté historiquement par le membre (membre.nom) — la vérité métier.
  nomOrigine: string
  // Établissement réel proposé comme survivant (SA-terrain).
  saTerrainNom: string
  saTerrainOp: number
}>

function versLigneViewModel(membre: MembreAConsoliderReadModel): MembreLigneViewModel {
  return {
    departement: membre.departementGouvernance ?? '—',
    estCoporteur: membre.estCoporteur,
    idsParam: membre.saIdsDuSiren,
    membreId: membre.membreId,
    nbSaDuSiren: membre.nbSaDuSiren,
    nomActuelAffiche: membre.saActuelleAntenne ?? membre.saActuelleDenomination ?? `Structure #${membre.saActuelleId}`,
    nomOrigine: membre.membreNom ?? membre.membreId,
    saTerrainNom: membre.saTerrainAntenne ?? membre.saTerrainDenomination ?? `Structure #${membre.saTerrainId}`,
    saTerrainOp: membre.saTerrainOp,
  }
}
