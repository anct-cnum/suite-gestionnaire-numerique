import { createDefaultHeaderData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsHeader> = {
  argTypes: {
    data: {
      description: "Données d'en-tête du lieu d'inclusion numérique",
    },
  },
  component: LieuInclusionDetailsHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Header',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    data: createDefaultHeaderData(),
  },
}

export const AvecPlusieursLabels: Story = {
  args: {
    data: {
      fraicheur: {
        couleur: 'yellow',
        date: '20/04/2024',
        libelle: 'À surveiller',
        source: 'la Cartographie nationale',
      },
      nom: 'Maison des Services Publics de Lyon',
      tags: [
        'France Services',
        'Conseiller numérique',
        'Maison des services publics',
        "Point d'accès au droit",
        'Tiers-lieu',
      ],
    },
  },
}

export const SansTag: Story = {
  args: {
    data: {
      fraicheur: {
        couleur: 'orange',
        date: '10/05/2024',
        libelle: 'À vérifier',
        source: '-',
      },
      nom: 'Centre Social Marseille Nord',
      tags: [],
    },
  },
}

export const TagUnique: Story = {
  args: {
    data: {
      fraicheur: {
        couleur: 'red',
        date: '28/02/2024',
        libelle: 'À actualiser',
        source: 'Mon Inclusion Numérique',
      },
      nom: 'Point Numérique Bordeaux Centre',
      tags: ['Conseiller numérique'],
    },
  },
}

export const NomLong: Story = {
  args: {
    data: {
      nom: "Maison des Services Publics et de l'Inclusion Numérique de Montpellier Métropole - Antenne Nord",
      tags: ['France Services', 'Conseiller numérique', 'Maison des services publics'],
    },
  },
}
