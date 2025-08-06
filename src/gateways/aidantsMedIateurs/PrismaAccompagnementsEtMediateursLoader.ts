import { 
  AccompagnementsEtMediateursLoader,
  AccompagnementsEtMediateursReadModel,
} from '@/use-cases/queries/RecupererAccompagnementsEtMediateurs'

export class PrismaAccompagnementsEtMediateursLoader implements AccompagnementsEtMediateursLoader {
  get(territoire = 'France'): AccompagnementsEtMediateursReadModel {
    // Données hardcodées pour le moment
    const baseDonnees = {
      accompagnementsRealises: 650230,
      beneficiairesAccompagnes: 490520,
      conseillerNumeriques: 3400,
      habilitesAidantsConnect: 2860,
      mediateursFormes: 3234,
      mediateursNumeriques: 5120,
      pourcentageMediateursFormes: 78,
      structuresHabilitees: 1200,
      thematiques: [
        { nom: 'Internet', pourcentage: 22 },
        { nom: 'Courriel', pourcentage: 21 },
        { nom: 'Équipement informatique', pourcentage: 16 },
        { nom: 'Démarches en ligne', pourcentage: 14 },
        { nom: 'Autres thématiques', nombreThematiquesRestantes: 5, pourcentage: 12 },
      ],
    }

    // Si ce n'est pas la France, diviser les chiffres par 100 (sauf les pourcentages)
    if (territoire !== 'France') {
      return {
        accompagnementsRealises: Math.round(baseDonnees.accompagnementsRealises / 100),
        beneficiairesAccompagnes: Math.round(baseDonnees.beneficiairesAccompagnes / 100),
        conseillerNumeriques: Math.round(baseDonnees.conseillerNumeriques / 100),
        habilitesAidantsConnect: Math.round(baseDonnees.habilitesAidantsConnect / 100),
        mediateursFormes: Math.round(baseDonnees.mediateursFormes / 100),
        mediateursNumeriques: Math.round(baseDonnees.mediateursNumeriques / 100),
        pourcentageMediateursFormes: baseDonnees.pourcentageMediateursFormes, // Garder le pourcentage
        structuresHabilitees: Math.round(baseDonnees.structuresHabilitees / 100),
        thematiques: baseDonnees.thematiques, // Garder les pourcentages des thématiques
      }
    }

    return baseDonnees
  }
}