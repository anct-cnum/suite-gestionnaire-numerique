import { createDefaultStatistiquesActivitesData } from './AidantDetailsTestData'
import AidantDetailsActivites from '@/components/AidantDetails/AidantDetailsActivites'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsActivites> = {
  argTypes: {
    data: {
      description: 'Données des statistiques d\'activités',
    },
  },
  component: AidantDetailsActivites,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/AidantDetailsActivites',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultStatistiquesActivitesData(),
  },
}

export const SansStatistiques: Story = {
  args: {
    data: undefined,
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
  },
}
