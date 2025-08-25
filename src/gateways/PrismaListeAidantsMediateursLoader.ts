import { reportLoaderError } from './shared/sentryErrorReporter'
import { AidantMediateurReadModel, ListeAidantsMediateursLoader, ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaListeAidantsMediateursLoader implements ListeAidantsMediateursLoader {
  async get(territoire: string, page: number, limite: number)
    : Promise<ErrorReadModel | ListeAidantsMediateursReadModel> {
    try {
      const offset = page * limite

      // Récupération des aidants avec pagination
      const [aidantsData, totalCount, statsData] = await Promise.all([
        this.getAidantsPagines(territoire, limite, offset),
        this.getTotalAidants(territoire),
        this.getStatistiques(territoire),
      ])

      const totalPages = Math.ceil(totalCount / limite)

      return {
        aidants: aidantsData,
        displayPagination: totalCount > limite,
        limite,
        page,
        total: totalCount,
        totalAccompagnements: statsData.totalAccompagnements,
        totalAidantsConnect: statsData.totalAidantsConnect,
        totalBeneficiaires: statsData.totalBeneficiaires,
        totalConseillers: statsData.totalConseillers,
        totalMediateurs: statsData.totalMediateurs,
        totalPages,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader', {
        limite,
        operation: 'get',
        page,
        territoire,
      })
      return {
        message: 'Impossible de récupérer la liste des aidants et médiateurs numériques',
        type: 'error',
      }
    }
  }

  private async getAidantsPagines(_territoire: string, limite: number, offset: number)
    : Promise<Array<AidantMediateurReadModel>> {
    // Requête pour récupérer les aidants paginés
    // Pour l'instant, on utilise des données mockées mais en production,
    // cela devra être remplacé par une vraie requête SQL
    const mockAidants: Array<AidantMediateurReadModel> = [
      {
        dateModification: '2024-01-15',
        email: 'marie.dupont@example.com',
        formation: ['PIX', 'CCP1'],
        id: '1',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 25,
        nom: 'Dupont',
        nomComplet: 'Marie Dupont',
        prenom: 'Marie',
        role: ['Médiateur', 'Coordinateur'],
        statut: 'Actif',
        structureLocalisation: '75001 Paris',
        structureNom: 'Maison de Services au Public',
        telephone: '01 23 45 67 89',
        typeAidantLibelle: 'Médiateur numérique',
      },
      {
        dateModification: '2024-01-12',
        email: 'jean.martin@example.com',
        formation: ['CCP1'],
        id: '2',
        labelisation: 'Aidants Connect',
        nbAccompagnements: 18,
        nom: 'Martin',
        nomComplet: 'Jean Martin',
        prenom: 'Jean',
        role: ['Aidant'],
        statut: 'Actif',
        structureLocalisation: '69000 Lyon',
        structureNom: 'Centre Social Municipal',
        telephone: '04 56 78 90 12',
        typeAidantLibelle: 'Aidant numérique',
      },
      {
        dateModification: '2024-01-10',
        email: 'paul.bernard@example.com',
        formation: ['REMN', 'PIX'],
        id: '3',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 42,
        nom: 'Bernard',
        nomComplet: 'Paul Bernard',
        prenom: 'Paul',
        role: ['Coordinateur', 'Médiateur'],
        statut: 'Actif',
        structureLocalisation: '13000 Marseille',
        structureNom: 'Centre Numérique',
        telephone: '04 91 23 45 67',
        typeAidantLibelle: 'Coordinateur',
      },
      {
        dateModification: '2024-01-08',
        email: 'claire.moreau@example.com',
        formation: ['PIX'],
        id: '4',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 31,
        nom: 'Moreau',
        nomComplet: 'Claire Moreau',
        prenom: 'Claire',
        role: ['Médiateur'],
        statut: 'Actif',
        structureLocalisation: '31000 Toulouse',
        structureNom: 'Espace Public Numérique',
        telephone: '05 34 56 78 90',
        typeAidantLibelle: 'Médiateur numérique',
      },
      {
        dateModification: '2024-01-05',
        email: 'sophie.dubois@example.com',
        formation: ['CCP2&CCP3'],
        id: '5',
        labelisation: 'Aidants Connect',
        nbAccompagnements: 22,
        nom: 'Dubois',
        nomComplet: 'Sophie Dubois',
        prenom: 'Sophie',
        role: ['Aidant'],
        statut: 'Actif',
        structureLocalisation: '44000 Nantes',
        structureNom: 'Mairie de Nantes',
        telephone: '02 40 12 34 56',
        typeAidantLibelle: 'Aidant numérique',
      },
      {
        dateModification: '2024-01-03',
        email: 'antoine.leroy@example.com',
        formation: ['REMN', 'CCP2&CCP3'],
        id: '6',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 38,
        nom: 'Leroy',
        nomComplet: 'Antoine Leroy',
        prenom: 'Antoine',
        role: ['Coordinateur'],
        statut: 'Actif',
        structureLocalisation: '59000 Lille',
        structureNom: 'Centre Social Nord',
        telephone: '03 20 45 67 89',
        typeAidantLibelle: 'Coordinateur',
      },
      {
        dateModification: '2023-12-28',
        email: 'julie.petit@example.com',
        formation: ['PIX'],
        id: '7',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 29,
        nom: 'Petit',
        nomComplet: 'Julie Petit',
        prenom: 'Julie',
        role: ['Médiateur'],
        statut: 'Actif',
        structureLocalisation: '67000 Strasbourg',
        structureNom: 'Bibliothèque Municipale',
        telephone: '03 88 15 25 35',
        typeAidantLibelle: 'Médiateur numérique',
      },
      {
        dateModification: '2023-12-25',
        email: 'thomas.roux@example.com',
        formation: ['CCP1'],
        id: '8',
        labelisation: '',
        nbAccompagnements: 16,
        nom: 'Roux',
        nomComplet: 'Thomas Roux',
        prenom: 'Thomas',
        role: ['Aidant'],
        statut: 'Actif',
        structureLocalisation: '06000 Nice',
        structureNom: 'Association Numérique Pour Tous',
        telephone: '04 93 78 90 12',
        typeAidantLibelle: 'Aidant numérique',
      },
      {
        dateModification: '2023-12-20',
        email: 'marie.girard@example.com',
        formation: ['REMN'],
        id: '9',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 45,
        nom: 'Girard',
        nomComplet: 'Marie Girard',
        prenom: 'Marie',
        role: ['Coordinateur'],
        statut: 'Actif',
        structureLocalisation: '33000 Bordeaux',
        structureNom: 'Maison de Quartier Sud',
        telephone: '05 56 12 34 56',
        typeAidantLibelle: 'Coordinateur',
      },
      {
        dateModification: '2023-12-18',
        email: 'laurent.simon@example.com',
        formation: ['PIX'],
        id: '10',
        labelisation: 'Conseiller Numérique',
        nbAccompagnements: 33,
        nom: 'Simon',
        nomComplet: 'Laurent Simon',
        prenom: 'Laurent',
        role: ['Médiateur'],
        statut: 'Actif',
        structureLocalisation: '35000 Rennes',
        structureNom: 'Centre Culturel',
        telephone: '02 99 87 65 43',
        typeAidantLibelle: 'Médiateur numérique',
      },
      // Aidants supplémentaires pour tester la pagination
      ...Array.from({ length: 25 }, (_, index) => ({
        dateModification: `2023-12-${(15 - index).toString().padStart(2, '0')}`,
        email: `aidant${11 + index}@example.com`,
        formation: ['PIX'],
        id: String(11 + index),
        labelisation: index % 3 === 0 ?
          'Conseiller Numérique'
          : index % 2 === 0 ?
            'Aidants Connect' :
            '',
        nbAccompagnements: Math.floor(Math.random() * 50) + 10,
        nom: `Nom${11 + index}`,
        nomComplet: `Prénom${11 + index} Nom${11 + index}`,
        prenom: `Prénom${11 + index}`,
        role: [
          index % 3 === 0 ?
            'Coordinateur' :
            index % 2 === 0 ?
              'Médiateur' :
              'Aidant',
        ],
        statut: 'Actif',
        structureLocalisation: `${(10000 + index * 1000).toString().slice(0, 5)} Ville${11 + index}`,
        structureNom: `Structure ${11 + index}`,
        telephone: `0${Math.floor(Math.random() * 5) + 1} ${Math.floor(Math.random() * 90) + 10}
        ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}
        ${Math.floor(Math.random() * 90) + 10}`,
        typeAidantLibelle: index % 3 === 0 ?
          'Coordinateur' :
          index % 2 === 0 ?
            'Médiateur numérique' :
            'Aidant numérique',
      })),
    ]

    // Simulation de la pagination avec les données mockées
    return mockAidants.slice(offset, offset + limite)
  }

  private async getStatistiques(_territoire: string): Promise<{
    totalAccompagnements: number
    totalAidantsConnect: number
    totalBeneficiaires: number
    totalConseillers: number
    totalMediateurs: number
  }> {
    // Pour l'instant, retourne des statistiques mockées
    // En production, cela devra être calculé depuis la base de données
    return {
      totalAccompagnements: 1156,
      totalAidantsConnect: 12,
      totalBeneficiaires: 789,
      totalConseillers: 18,
      totalMediateurs: 12,
    }
  }

  private async getTotalAidants(_territoire: string): Promise<number> {
    // Pour l'instant, retourne un nombre fixe (10 initiaux + 25 supplémentaires)
    // En production, cela devra être remplacé par une vraie requête de comptage
    return 35
  }
}
