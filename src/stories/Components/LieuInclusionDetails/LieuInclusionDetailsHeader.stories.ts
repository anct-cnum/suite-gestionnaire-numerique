import { createDefaultHeaderData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsHeader> = {
  argTypes: {
    data: {
      description: 'Données d\'en-tête du lieu d\'inclusion numérique',
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
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultHeaderData(),
  },
}

export const AvecPlusieursLabels: Story = {
  args: {
    data: {
      modificationAuteur: 'Jean Dupont',
      modificationDate: '20/04/2024',
      nom: 'Maison des Services Publics de Lyon',
      tags: ['France Services', 'Conseiller numérique', 'Maison des services publics', 'Point d\'accès au droit', 'Tiers-lieu'],
    },
  },
}

export const SansTag: Story = {
  args: {
    data: {
      modificationAuteur: 'Admin Système',
      modificationDate: '10/05/2024',
      nom: 'Centre Social Marseille Nord',
      tags: [],
    },
  },
}

export const TagUnique: Story = {
  args: {
    data: {
      modificationAuteur: 'Responsable Territorial',
      modificationDate: '28/02/2024',
      nom: 'Point Numérique Bordeaux Centre',
      tags: ['Conseiller numérique'],
    },
  },
}

export const NomLong: Story = {
  args: {
    data: {
      modificationAuteur: 'Marie Leroy',
      modificationDate: '15/06/2024',
      nom: 'Maison des Services Publics et de l\'Inclusion Numérique de Montpellier Métropole - Antenne Nord',
      tags: ['France Services', 'Conseiller numérique', 'Maison des services publics'],
    },
  },
}
