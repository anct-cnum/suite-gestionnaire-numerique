import { createDefaultInformationsGeneralesData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsInformationsGenerales from '@/components/LieuInclusionDetails/LieuInclusionDetailsInformationsGenerales'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsInformationsGenerales> = {
  argTypes: {
    data: {
      description: 'Données des informations générales du lieu d\'inclusion numérique',
    },
  },
  component: LieuInclusionDetailsInformationsGenerales,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/InformationsGenerales',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultInformationsGeneralesData(),
  },
}

export const AvecTousLesChamps: Story = {
  args: {
    data: {
      adresse: '45 Avenue de la Liberté, 69000 Lyon',
      complementAdresse: 'Bâtiment B - Rez-de-chaussée - Bureau 12',
      nomStructure: 'Maison des Services Publics de Lyon Métropole',
      siret: '12345678901234',
    },
  },
}

export const AvecSIRETSeulement: Story = {
  args: {
    data: {
      adresse: '78 Rue de la Paix, 13000 Marseille',
      nomStructure: 'Centre Social Marseille Nord',
      siret: '98765432109876',
    },
  },
}

export const SansComplementAdresse: Story = {
  args: {
    data: {
      adresse: '156 Boulevard de la République, 34000 Montpellier',
      nomStructure: 'Point Numérique Montpellier Centre',
      siret: '11122233344556',
    },
  },
}

export const ChampsMinimaux: Story = {
  args: {
    data: {
      adresse: '3 Rue de la Poste, 35000 Rennes',
      nomStructure: 'Espace Public Numérique Rennes',
    },
  },
}

export const NomStructureLong: Story = {
  args: {
    data: {
      adresse: 'Centre Commercial Les Arcades, 101 Rue Berger, 75001 Paris',
      complementAdresse: 'Niveau -1, Porte Lescot, Face au métro Châtelet-Les Halles',
      nomStructure: 'Maison des Services Publics et de l\'Inclusion Numérique de Paris 1er Arrondissement - Antenne Châtelet-Les Halles',
      siret: '13579246801357',
    },
  },
}
