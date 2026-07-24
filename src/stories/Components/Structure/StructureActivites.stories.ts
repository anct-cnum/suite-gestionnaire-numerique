import { createDefaultActivitesStructureViewModel } from './StructureActivitesTestData'
import StructureActivites from '@/components/Structure/StructureActivites'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureActivites> = {
  argTypes: {
    viewModel: {
      description: 'Statistiques d’activité de la structure',
    },
  },
  component: StructureActivites,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureActivites',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    viewModel: createDefaultActivitesStructureViewModel(),
  },
}

export const SansActivite: Story = {
  args: {
    viewModel: {
      ...createDefaultActivitesStructureViewModel(),
      beneficiaires: {
        accompagnes: '0',
        anonymes: '0',
        suivis: '0',
      },
      graphique: {
        parJour: {
          backgroundColor: Array.from({ length: 5 }, () => '#009099'),
          data: [0, 0, 0, 0, 0],
          labels: ['10/08', '11/08', '12/08', '13/08', '14/08'],
        },
        parMois: {
          aidantsConnect: {
            backgroundColor: Array.from({ length: 6 }, () => '#ce614a'),
            data: [0, 0, 0, 0, 0, 0],
          },
          backgroundColor: Array.from({ length: 6 }, () => '#009099'),
          data: [0, 0, 0, 0, 0, 0],
          labels: ['Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.'],
        },
      },
      totalAidantsConnect: '0',
      totalMediationNumerique: '0',
    },
  },
}
