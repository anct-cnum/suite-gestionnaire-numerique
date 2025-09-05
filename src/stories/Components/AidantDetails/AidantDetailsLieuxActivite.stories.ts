import { createDefaultLieuxActiviteData } from './AidantDetailsTestData'
import AidantDetailsLieuxActivite from '@/components/AidantDetails/AidantDetailsLieuxActivite'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsLieuxActivite> = {
  argTypes: {
    data: {
      description: 'Liste des lieux d\'activité de l\'aidant',
    },
  },
  component: AidantDetailsLieuxActivite,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/AidantDetailsLieuxActivite',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultLieuxActiviteData(),
  },
}

export const LieuUnique: Story = {
  args: {
    data: [
      {
        adresse: '8 place de la Bastille, 75011 Paris',
        nom: 'Médiathèque Marguerite Duras',
        nombreAccompagnements: 12,
        nombreAccompagnementsTotal: 30,
      },
    ],
  },
}

export const AucunLieu: Story = {
  args: {
    data: [],
  },
}

export const PlusieursLieuxActivite: Story = {
  args: {
    data: [
      {
        adresse: '12 rue de la République, 75001 Paris',
        nom: 'Mairie du 1er arrondissement',
        nombreAccompagnements: 15,
        nombreAccompagnementsTotal: 30,
      },
      {
        adresse: '45 avenue des Champs-Élysées, 75008 Paris',
        nom: 'Centre communautaire des Champs',
        nombreAccompagnements: 8,
        nombreAccompagnementsTotal: 30,
      },
      {
        adresse: '8 place de la Bastille, 75011 Paris',
        nom: 'Médiathèque Marguerite Duras',
        nombreAccompagnements: 22,
        nombreAccompagnementsTotal: 30,
      },
      {
        adresse: '23 boulevard Saint-Germain, 75005 Paris',
        nom: 'Espace numérique du 5ème',
        nombreAccompagnements: 6,
        nombreAccompagnementsTotal: 30,
      },
    ],
  },
}
