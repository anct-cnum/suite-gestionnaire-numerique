import { Meta, StoryObj } from '@storybook/nextjs-vite'

import PointsVigilance from '@/components/TableauDeBord/PointsVigilance'

const meta: Meta<typeof PointsVigilance> = {
  component: PointsVigilance,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/TableauDeBord/PointsVigilance',
}

export default meta

type Story = StoryObj

export const Default: Story = {
  args: {
    viewModel: {
      lignes: [
        {
          compteur: '120 lieux',
          pastille: '🔴',
          texte: 'à actualiser (informations de plus de 18 mois)',
          url: '/liste-lieux-inclusion?fraicheur=a-actualiser',
        },
        {
          compteur: '34 lieux',
          pastille: '🟠',
          texte: 'à vérifier (informations de 12 à 18 mois)',
          url: '/liste-lieux-inclusion?fraicheur=a-verifier',
        },
      ],
    },
  },
}

export const UneSeuleLigne: Story = {
  args: {
    viewModel: {
      lignes: [
        {
          compteur: '1 lieu',
          pastille: '🟠',
          texte: 'à vérifier (informations de 12 à 18 mois)',
          url: '/liste-lieux-inclusion?fraicheur=a-verifier',
        },
      ],
    },
  },
}
