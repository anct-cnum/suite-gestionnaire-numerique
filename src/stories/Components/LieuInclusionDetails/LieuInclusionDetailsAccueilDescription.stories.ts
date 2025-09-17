import { createDefaultLieuAccueilPublicData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsAccueilDescription from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilDescription'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsAccueilDescription> = {
  argTypes: {
    data: {
      description: 'Données d\'accueil public du lieu',
    },
  },
  component: LieuInclusionDetailsAccueilDescription,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Accueil/Description',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultLieuAccueilPublicData(),
  },
}

export const AvecDescriptionLongue: Story = {
  args: {
    data: {
      modalitesAccueil: 'Minettes & Co – le réseau est une association qui a pour vocation d\'accompagner toutes les femmes dans leurs projets professionnels. L\'idée est née d\'un constat via-à vis des postes de dirigeants essentiellement occupés aujourd\'hui par des hommes. Nous souhaitons apporter un élan plus grands obstacles à l\'évolution professionnelle des femmes : leurs propres craintes ! Nous souhaitons les pouvoir à « oser » !',
    },
  },
}

export const SansDescription: Story = {
  args: {
    data: {},
  },
}
