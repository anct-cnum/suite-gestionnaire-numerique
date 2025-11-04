import { createDefaultLieuInclusionDetailsData } from './LieuInclusionDetailsTestData'
import LieuxInclusionDetails from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuxInclusionDetails> = {
  argTypes: {
    data: {
      description: 'Données complètes du lieu d\'inclusion numérique',
    },
  },
  component: LieuxInclusionDetails,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultLieuInclusionDetailsData(),
  },
}

export const DonneesMinimales: Story = {
  args: {
    data: {
      header: {
        nom: 'Centre Numérique Basic',
        tags: [],
      },
      informationsGenerales: {
        adresse: '1 Place de la Mairie, 12345 Ville',
        nomStructure: 'Centre Numérique Basic',
      },
      lieuAccueilPublic: {},
      personnesTravaillant: [],
      peutModifier: false,
      servicesInclusionNumerique: [],
    },
  },
}

export const AvecModificationRecente: Story = {
  args: {
    data: {
      ...createDefaultLieuInclusionDetailsData(),
      header: {
        modificationAuteur: 'Système Automatique',
        modificationDate: '01/09/2024',
        nom: 'Maison France Services Modernisée',
        tags: ['France Services', 'Conseiller numérique', 'Modernisation'],
      },
    },
  },
}

export const SansInformationsComplementaires: Story = {
  args: {
    data: {
      ...createDefaultLieuInclusionDetailsData(),
      informationsGenerales: {
        adresse: '456 Avenue du Numérique, 67890 Nouvelle Ville',
        nomStructure: 'Point Numérique Essentiel',
      },
    },
  },
}
