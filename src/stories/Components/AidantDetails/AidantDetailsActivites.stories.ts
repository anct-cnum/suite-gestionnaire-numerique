import { createDefaultStatistiquesActivitesData } from './AidantDetailsTestData'
import AidantDetailsActivites from '@/components/AidantDetails/AidantDetailsActivites'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsActivites> = {
  argTypes: {
    data: {
      description: 'Données des statistiques d\'activités',
    },
    nom: {
      description: 'Nom de l\'aidant',
    },
    prenom: {
      description: 'Prénom de l\'aidant',
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
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultStatistiquesActivitesData(),
    nom: 'Dupont',
    prenom: 'Marie',
  },
}

export const SansStatistiques: Story = {
  args: {
    data: undefined,
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
        total: 1250,
      },
      beneficiaires: {
        anonymes: 200,
        suivis: 400,
        total: 600,
      },
    },
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
    nom: 'Durand',
    prenom: 'Julien',
  },
}
