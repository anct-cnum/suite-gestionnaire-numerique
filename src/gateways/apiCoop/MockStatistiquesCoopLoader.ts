import { StatistiquesCoopLoader, StatistiquesCoopReadModel, StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'

export class MockStatistiquesCoopLoader implements StatistiquesCoopLoader {
  async recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel> {
    // Simulation d'un délai d'API
    await new Promise(resolve => {
      setTimeout(resolve, 800)
    })

    // Données différentes selon le filtre géographique
    const estDepartemental = filtres?.departements && filtres.departements.length > 0
    const departement = estDepartemental ? filtres.departements[0] : null

    return {
      accompagnementsParJour: this.genererAccompagnementsParJour(),
      accompagnementsParMois: this.genererAccompagnementsParMois(),
      beneficiaires: this.genererBeneficiaires(!!estDepartemental),
      activites: this.genererActivites(!!estDepartemental),
      totaux: this.genererTotaux(!!estDepartemental, departement),
    }
  }

  private genererAccompagnementsParJour() {
    return [
      { label: '10/08', count: 2456 },
      { label: '11/08', count: 2789 },
      { label: '12/08', count: 2134 },
      { label: '13/08', count: 2890 },
      { label: '14/08', count: 3012 },
    ]
  }

  private genererAccompagnementsParMois() {
    return [
      { label: 'Jan.', count: 98450 },
      { label: 'Fév.', count: 105230 },
      { label: 'Mars', count: 112890 },
      { label: 'Avr.', count: 98760 },
      { label: 'Mai', count: 87430 },
      { label: 'Juin', count: 94560 },
      { label: 'Juil.', count: 76540 },
      { label: 'Août', count: 45620 },
    ]
  }

  private genererBeneficiaires(estDepartemental: boolean) {
    const facteur = estDepartemental ? 0.08 : 1 // 8% pour un département vs France entière
    
    return {
      total: Math.round(850000 * facteur),
      genres: [
        {
          value: 'Feminin',
          label: 'Féminin',
          count: Math.round(380000 * facteur),
          proportion: 44.7,
        },
        {
          value: 'Masculin', 
          label: 'Masculin',
          count: Math.round(320000 * facteur),
          proportion: 37.6,
        },
        {
          value: 'NonCommunique',
          label: 'Non communiqué', 
          count: Math.round(150000 * facteur),
          proportion: 17.7,
        },
      ],
      trancheAges: [
        {
          value: 'VingtCinqTrenteNeuf',
          label: '25 - 39 ans',
          count: Math.round(180000 * facteur),
          proportion: 21.2,
        },
        {
          value: 'QuaranteCinquanteNeuf',
          label: '40 - 59 ans',
          count: Math.round(220000 * facteur),
          proportion: 25.9,
        },
        {
          value: 'SoixanteSoixanteNeuf',
          label: '60 - 69 ans',
          count: Math.round(200000 * facteur),
          proportion: 23.5,
        },
        {
          value: 'SoixanteDixPlus',
          label: '70 ans et plus',
          count: Math.round(170000 * facteur),
          proportion: 20.0,
        },
        {
          value: 'DixHuitVingtQuatre',
          label: '18 - 24 ans',
          count: Math.round(80000 * facteur),
          proportion: 9.4,
        },
      ],
      statutsSocial: [
        {
          value: 'SansEmploi',
          label: 'Sans emploi',
          count: Math.round(280000 * facteur),
          proportion: 32.9,
        },
        {
          value: 'Retraite',
          label: 'Retraité',
          count: Math.round(230000 * facteur),
          proportion: 27.1,
        },
        {
          value: 'EnEmploi',
          label: 'En emploi',
          count: Math.round(180000 * facteur),
          proportion: 21.2,
        },
        {
          value: 'Autre',
          label: 'Autre',
          count: Math.round(160000 * facteur),
          proportion: 18.8,
        },
      ],
    }
  }

  private genererActivites(estDepartemental: boolean) {
    const facteur = estDepartemental ? 0.08 : 1
    
    return {
      total: Math.round(950000 * facteur),
      typeActivites: [
        {
          value: 'Individuel',
          label: 'Accompagnement individuel',
          count: Math.round(520000 * facteur),
          proportion: 54.7,
        },
        {
          value: 'Collectif',
          label: 'Atelier collectif',
          count: Math.round(280000 * facteur),
          proportion: 29.5,
        },
        {
          value: 'Demarche',
          label: 'Aide aux démarches',
          count: Math.round(150000 * facteur),
          proportion: 15.8,
        },
      ],
      durees: [
        {
          value: 'UneHeureTroisHeures',
          label: '1h à 3h',
          count: Math.round(450000 * facteur),
          proportion: 47.4,
        },
        {
          value: 'MoinsUneHeure',
          label: 'Moins d\'1h',
          count: Math.round(320000 * facteur),
          proportion: 33.7,
        },
        {
          value: 'PlusTroisHeures',
          label: 'Plus de 3h',
          count: Math.round(180000 * facteur),
          proportion: 18.9,
        },
      ],
      typeLieu: [
        {
          value: 'ADistance',
          label: 'À distance',
          count: Math.round(380000 * facteur),
          proportion: 40.0,
        },
        {
          value: 'LieuActivite',
          label: 'Dans un lieu dédié',
          count: Math.round(320000 * facteur),
          proportion: 33.7,
        },
        {
          value: 'Domicile',
          label: 'À domicile',
          count: Math.round(250000 * facteur),
          proportion: 26.3,
        },
      ],
      thematiques: [
        {
          value: 'PriseEnMainOrdinateur',
          label: 'Prise en main d\'un ordinateur',
          count: Math.round(180000 * facteur),
          proportion: 18.9,
        },
        {
          value: 'NavigationInternet',
          label: 'Navigation sur internet',
          count: Math.round(170000 * facteur),
          proportion: 17.9,
        },
        {
          value: 'AideAuxDemarchesAdministratives',
          label: 'Aide aux démarches administratives',
          count: Math.round(160000 * facteur),
          proportion: 16.8,
        },
        {
          value: 'MessagerieElectronique',
          label: 'Messagerie électronique',
          count: Math.round(140000 * facteur),
          proportion: 14.7,
        },
        {
          value: 'CultureNumerique',
          label: 'Culture numérique',
          count: Math.round(120000 * facteur),
          proportion: 12.6,
        },
      ],
      materiels: [
        {
          value: 'Ordinateur',
          label: 'Ordinateur',
          count: Math.round(480000 * facteur),
          proportion: 50.5,
        },
        {
          value: 'Telephone',
          label: 'Téléphone',
          count: Math.round(320000 * facteur),
          proportion: 33.7,
        },
        {
          value: 'Tablette',
          label: 'Tablette',
          count: Math.round(100000 * facteur),
          proportion: 10.5,
        },
        {
          value: 'Autre',
          label: 'Autre',
          count: Math.round(50000 * facteur),
          proportion: 5.3,
        },
      ],
    }
  }

  private genererTotaux(estDepartemental: boolean, departement: string | null) {
    const facteur = estDepartemental ? 0.08 : 1
    
    // Ajustements spécifiques par département pour plus de réalisme
    let facteurDept = facteur
    if (departement) {
      switch (departement) {
        case '75': // Paris
          facteurDept = 0.12
          break
        case '13': // Bouches-du-Rhône  
          facteurDept = 0.10
          break
        case '69': // Rhône
          facteurDept = 0.09
          break
        case '59': // Nord
          facteurDept = 0.11
          break
        default:
          facteurDept = 0.08
      }
    }
    
    return {
      activites: {
        total: Math.round(620000 * facteurDept),
        individuels: {
          total: Math.round(380000 * facteurDept),
          proportion: 61.3,
        },
        collectifs: {
          total: Math.round(190000 * facteurDept),
          proportion: 30.6,
          participants: Math.round(850000 * facteurDept),
        },
        demarches: {
          total: Math.round(50000 * facteurDept),
          proportion: 8.1,
        },
      },
      accompagnements: {
        total: Math.round(1280000 * facteurDept),
        individuels: {
          total: Math.round(380000 * facteurDept),
          proportion: 29.7,
        },
        collectifs: {
          total: Math.round(850000 * facteurDept),
          proportion: 66.4,
        },
        demarches: {
          total: Math.round(50000 * facteurDept),
          proportion: 3.9,
        },
      },
      beneficiaires: {
        total: Math.round(925000 * facteurDept),
        nouveaux: Math.round(125000 * facteurDept),
        suivis: Math.round(78000 * facteurDept),
        anonymes: Math.round(722000 * facteurDept),
      },
    }
  }
}