import { StatistiquesCoopLoader, StatistiquesCoopReadModel, StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'

export interface MockConfig {
  delaySeconds: number
  shouldFail: boolean
}

export class MockStatistiquesCoopLoader implements StatistiquesCoopLoader {
  private readonly config: MockConfig
  
  constructor(config: MockConfig = { delaySeconds: 0.8, shouldFail: false }) {
    this.config = config
  }

  async recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel> {
    // Simulation d'un délai d'API
    await new Promise(resolve => {
      setTimeout(resolve, this.config.delaySeconds * 1000)
    })

    // Simulation d'erreur si configuré
    if (this.config.shouldFail) {
      throw new Error('API Coop simulée : Erreur de connexion')
    }

    // Données différentes selon le filtre géographique
    const estDepartemental = filtres?.departements !== undefined && filtres.departements.length > 0
    const departement = estDepartemental ? filtres.departements[0] : null
    
    // Calculer un facteur temporel si des dates sont fournies
    let facteurTemporel = 1
    if (filtres?.du !== undefined && filtres.au !== undefined) {
      const dateDebut = new Date(filtres.du)
      const dateFin = new Date(filtres.au)
      const joursEcoules = Math.round((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
      
      // Si période de 30 jours ou moins, diviser par 100
      // Si période entre 30 et 365 jours, ajuster proportionnellement
      if (joursEcoules <= 30) {
        facteurTemporel = 0.01 // Diviser par 100
      } else if (joursEcoules <= 365) {
        facteurTemporel = joursEcoules / 365 // Proportionnel à l'année
      }
      // Sinon garder facteur 1 (toutes les données)
    }

    return {
      accompagnementsParJour: this.genererAccompagnementsParJour(),
      accompagnementsParMois: this.genererAccompagnementsParMois(),
      activites: this.genererActivites(Boolean(estDepartemental), facteurTemporel),
      beneficiaires: this.genererBeneficiaires(Boolean(estDepartemental), facteurTemporel),
      totaux: this.genererTotaux(Boolean(estDepartemental), departement, facteurTemporel),
    }
  }

  private genererAccompagnementsParJour(): StatistiquesCoopReadModel['accompagnementsParJour'] {
    return [
      { count: 2456, label: '10/08' },
      { count: 2789, label: '11/08' },
      { count: 2134, label: '12/08' },
      { count: 2890, label: '13/08' },
      { count: 3012, label: '14/08' },
    ]
  }

  private genererAccompagnementsParMois(): StatistiquesCoopReadModel['accompagnementsParMois'] {
    return [
      { count: 98450, label: 'Jan.' },
      { count: 105230, label: 'Fév.' },
      { count: 112890, label: 'Mars' },
      { count: 98760, label: 'Avr.' },
      { count: 87430, label: 'Mai' },
      { count: 94560, label: 'Juin' },
      { count: 76540, label: 'Juil.' },
      { count: 45620, label: 'Août' },
    ]
  }

  private genererActivites(estDepartemental: boolean, facteurTemporel = 1): StatistiquesCoopReadModel['activites'] {
    const facteur = (estDepartemental ? 0.08 : 1) * facteurTemporel
    
    return {
      durees: [
        {
          count: Math.round(450000 * facteur),
          label: '1h à 3h',
          proportion: 47.4,
          value: 'UneHeureTroisHeures',
        },
        {
          count: Math.round(320000 * facteur),
          label: 'Moins d\'1h',
          proportion: 33.7,
          value: 'MoinsUneHeure',
        },
        {
          count: Math.round(180000 * facteur),
          label: 'Plus de 3h',
          proportion: 18.9,
          value: 'PlusTroisHeures',
        },
      ],
      materiels: [
        {
          count: Math.round(480000 * facteur),
          label: 'Ordinateur',
          proportion: 50.5,
          value: 'Ordinateur',
        },
        {
          count: Math.round(320000 * facteur),
          label: 'Téléphone',
          proportion: 33.7,
          value: 'Telephone',
        },
        {
          count: Math.round(100000 * facteur),
          label: 'Tablette',
          proportion: 10.5,
          value: 'Tablette',
        },
        {
          count: Math.round(50000 * facteur),
          label: 'Autre',
          proportion: 5.3,
          value: 'Autre',
        },
      ],
      thematiques: [
        {
          count: Math.round(180000 * facteur),
          label: 'Prise en main d\'un ordinateur',
          proportion: 18.9,
          value: 'PriseEnMainOrdinateur',
        },
        {
          count: Math.round(170000 * facteur),
          label: 'Navigation sur internet',
          proportion: 17.9,
          value: 'NavigationInternet',
        },
        {
          count: Math.round(160000 * facteur),
          label: 'Aide aux démarches administratives',
          proportion: 16.8,
          value: 'AideAuxDemarchesAdministratives',
        },
        {
          count: Math.round(140000 * facteur),
          label: 'Messagerie électronique',
          proportion: 14.7,
          value: 'MessagerieElectronique',
        },
        {
          count: Math.round(120000 * facteur),
          label: 'Culture numérique',
          proportion: 12.6,
          value: 'CultureNumerique',
        },
      ],
      total: Math.round(950000 * facteur),
      typeActivites: [
        {
          count: Math.round(520000 * facteur),
          label: 'Accompagnement individuel',
          proportion: 54.7,
          value: 'Individuel',
        },
        {
          count: Math.round(280000 * facteur),
          label: 'Atelier collectif',
          proportion: 29.5,
          value: 'Collectif',
        },
      ],
      typeLieu: [
        {
          count: Math.round(380000 * facteur),
          label: 'À distance',
          proportion: 40.0,
          value: 'ADistance',
        },
        {
          count: Math.round(320000 * facteur),
          label: 'Dans un lieu dédié',
          proportion: 33.7,
          value: 'LieuActivite',
        },
        {
          count: Math.round(250000 * facteur),
          label: 'À domicile',
          proportion: 26.3,
          value: 'Domicile',
        },
      ],
    }
  }

  private genererBeneficiaires(estDepartemental: boolean, facteurTemporel = 1): StatistiquesCoopReadModel['beneficiaires'] {
    const facteur = (estDepartemental ? 0.08 : 1) * facteurTemporel // 8% pour un département vs France entière
    
    return {
      genres: [
        {
          count: Math.round(380000 * facteur),
          label: 'Féminin',
          proportion: 44.7,
          value: 'Feminin',
        },
        {
          count: Math.round(320000 * facteur), 
          label: 'Masculin',
          proportion: 37.6,
          value: 'Masculin',
        },
        {
          count: Math.round(150000 * facteur),
          label: 'Non communiqué', 
          proportion: 17.7,
          value: 'NonCommunique',
        },
      ],
      statutsSocial: [
        {
          count: Math.round(280000 * facteur),
          label: 'Sans emploi',
          proportion: 32.9,
          value: 'SansEmploi',
        },
        {
          count: Math.round(230000 * facteur),
          label: 'Retraité',
          proportion: 27.1,
          value: 'Retraite',
        },
        {
          count: Math.round(180000 * facteur),
          label: 'En emploi',
          proportion: 21.2,
          value: 'EnEmploi',
        },
        {
          count: Math.round(160000 * facteur),
          label: 'Autre',
          proportion: 18.8,
          value: 'Autre',
        },
      ],
      total: Math.round(850000 * facteur),
      trancheAges: [
        {
          count: Math.round(180000 * facteur),
          label: '25 - 39 ans',
          proportion: 21.2,
          value: 'VingtCinqTrenteNeuf',
        },
        {
          count: Math.round(220000 * facteur),
          label: '40 - 59 ans',
          proportion: 25.9,
          value: 'QuaranteCinquanteNeuf',
        },
        {
          count: Math.round(200000 * facteur),
          label: '60 - 69 ans',
          proportion: 23.5,
          value: 'SoixanteSoixanteNeuf',
        },
        {
          count: Math.round(170000 * facteur),
          label: '70 ans et plus',
          proportion: 20.0,
          value: 'SoixanteDixPlus',
        },
        {
          count: Math.round(80000 * facteur),
          label: '18 - 24 ans',
          proportion: 9.4,
          value: 'DixHuitVingtQuatre',
        },
      ],
    }
  }

  private genererTotaux(
    estDepartemental: boolean, 
    departement: null | string, 
    facteurTemporel = 1
  ): StatistiquesCoopReadModel['totaux'] {
    const facteur = estDepartemental ? 0.08 : 1
    
    // Ajustements spécifiques par département pour plus de réalisme
    let facteurDept = facteur
    if (departement !== null && departement !== '') {
      switch (departement) {
        case '13': // Bouches-du-Rhône  
          facteurDept = 0.10
          break
        case '59': // Nord
          facteurDept = 0.11
          break
        case '69': // Rhône
          facteurDept = 0.09
          break
        case '75': // Paris
          facteurDept = 0.12
          break
        default:
          facteurDept = 0.08
      }
    }
    
    // Appliquer le facteur temporel
    facteurDept *= facteurTemporel
    
    return {
      accompagnements: {
        collectifs: {
          proportion: 66.4,
          total: Math.round(850000 * facteurDept),
        },
        demarches: {
          proportion: 3.9,
          total: Math.round(50000 * facteurDept),
        },
        individuels: {
          proportion: 29.7,
          total: Math.round(380000 * facteurDept),
        },
        total: Math.round(1280000 * facteurDept),
      },
      activites: {
        collectifs: {
          participants: Math.round(850000 * facteurDept),
          proportion: 30.6,
          total: Math.round(190000 * facteurDept),
        },
        demarches: {
          proportion: 8.1,
          total: Math.round(50000 * facteurDept),
        },
        individuels: {
          proportion: 61.3,
          total: Math.round(380000 * facteurDept),
        },
        total: Math.round(620000 * facteurDept),
      },
      beneficiaires: {
        anonymes: Math.round(722000 * facteurDept),
        nouveaux: Math.round(125000 * facteurDept),
        suivis: Math.round(78000 * facteurDept),
        total: Math.round(925000 * facteurDept),
      },
    }
  }
}