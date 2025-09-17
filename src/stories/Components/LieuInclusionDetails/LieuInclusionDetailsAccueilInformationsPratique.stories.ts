import { createDefaultLieuAccueilPublicData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsAccueilInformationsPratique from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilInformationsPratique'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsAccueilInformationsPratique> = {
  argTypes: {
    data: {
      description: 'Données d\'accueil public du lieu',
    },
  },
  component: LieuInclusionDetailsAccueilInformationsPratique,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Accueil/InformationsPratique',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultLieuAccueilPublicData(),
  },
}

export const AvecToutesLesInformations: Story = {
  args: {
    data: {
      accessibilite: 'Lieu accessible aux personnes à mobilité réduite, parking disponible, ascenseur',
      horaires: 'Ouvert tous les jours de 8h à 18h, fermé le dimanche',
      modalitesAccueil: 'Accueil libre ou sur rendez-vous. Possibilité de prise de rendez-vous en ligne via notre site web.',
    },
  },
}

export const SansInformations: Story = {
  args: {
    data: {},
  },
}
