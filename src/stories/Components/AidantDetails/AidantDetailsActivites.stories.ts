import { createDefaultStatistiquesActivitesData } from './AidantDetailsTestData'
import AidantDetailsActivites from '@/components/AidantDetails/AidantDetailsActivites'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsActivites> = {
  argTypes: {
    data: {
      description: "Données des statistiques d'activités",
    },
    nom: {
      description: "Nom de l'aidant",
    },
    prenom: {
      description: "Prénom de l'aidant",
    },
  },
  component: AidantDetailsActivites,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/aidant/123',
        query: {
          periode: 'mensuel',
        },
      },
    },
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/Activites',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    data: createDefaultStatistiquesActivitesData(),
    estAidantConnect: true,
    nom: 'Dupont',
    prenom: 'Marie',
  },
}

export const SansAidantConnect: Story = {
  args: {
    data: {
      ...createDefaultStatistiquesActivitesData(),
      accompagnements: {
        avecAidantsConnect: 0,
        individuels: 82,
        nombreAteliers: 15,
        participationsAteliers: 45,
        total: 127,
      },
    },
    estAidantConnect: false,
    nom: 'Leroy',
    prenom: 'Thomas',
  },
}

export const SansStatistiques: Story = {
  args: {
    data: undefined,
    estAidantConnect: false,
    nom: 'Martin',
    prenom: 'Paul',
  },
}

export const StatistiquesElevees: Story = {
  args: {
    data: {
      ...createDefaultStatistiquesActivitesData(),
      accompagnements: {
        avecAidantsConnect: 150,
        individuels: 800,
        nombreAteliers: 50,
        participationsAteliers: 450,
        total: 1250,
      },
      beneficiaires: {
        anonymes: 200,
        suivis: 400,
        total: 600,
      },
    },
    estAidantConnect: true,
    nom: 'Bernard',
    prenom: 'Sophie',
  },
}

export const AucuneActivite: Story = {
  args: {
    data: {
      ...createDefaultStatistiquesActivitesData(),
      accompagnements: {
        avecAidantsConnect: 0,
        individuels: 0,
        nombreAteliers: 0,
        participationsAteliers: 0,
        total: 0,
      },
      beneficiaires: {
        anonymes: 0,
        suivis: 0,
        total: 0,
      },
      graphique: {
        backgroundColor: ['#009099'],
        data: [0],
        labels: ['Aucune donnée'],
      },
    },
    estAidantConnect: false,
    nom: 'Durand',
    prenom: 'Julien',
  },
}
