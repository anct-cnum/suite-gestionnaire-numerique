import { 
  NiveauDeFormationLoader,
  NiveauDeFormationReadModel,
} from '@/use-cases/queries/RecupererNiveauDeFormation'

export class PrismaNiveauDeFormationLoader implements NiveauDeFormationLoader {
  get(territoire = 'France'): NiveauDeFormationReadModel {
    // Données hardcodées pour le moment
    const baseDonnees = {
      aidantsEtMediateursFormes: 3250,
      formations: [
        { nom: 'Pix', nombre: 450 },
        { nom: 'REMN', nombre: 420 },
        { nom: 'CCP2 et CCP3', nombre: 315 },
        { nom: 'CCP1', nombre: 489 },
        { nom: 'Autres', nombre: 240 },
      ],
      totalAidantsEtMediateurs: 16000,
    }

    // Si ce n'est pas la France, diviser les chiffres par 100
    if (territoire !== 'France') {
      return {
        aidantsEtMediateursFormes: Math.round(baseDonnees.aidantsEtMediateursFormes / 100),
        formations: baseDonnees.formations.map(formation => ({
          ...formation,
          nombre: Math.round(formation.nombre / 100),
        })),
        totalAidantsEtMediateurs: Math.round(baseDonnees.totalAidantsEtMediateurs / 100),
      }
    }

    return baseDonnees
  }
}