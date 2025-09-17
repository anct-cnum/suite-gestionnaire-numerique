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
  title: 'Components/AidantDetails/LieuxActivite',
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
        idCoopCarto: 'idCoopCarto',
        nom: 'Médiathèque Marguerite Duras',
        nombreAccompagnements: 12,
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
        idCoopCarto: 'idCoopCarto',
        nom: 'Mairie du 1er arrondissement',
        nombreAccompagnements: 15,
      },
      {
        adresse: '45 avenue des Champs-Élysées, 75008 Paris',
        idCoopCarto: '',
        nom: 'Centre communautaire des Champs',
        nombreAccompagnements: 8,
      },
      {
        adresse: '8 place de la Bastille, 75011 Paris',
        idCoopCarto: 'idCoopCarto',
        nom: 'Médiathèque Marguerite Duras',
        nombreAccompagnements: 22,
      },
      {
        adresse: '23 boulevard Saint-Germain, 75005 Paris',
        idCoopCarto: 'idCoopCarto',
        nom: 'Espace numérique du 5ème',
        nombreAccompagnements: 6,
      },
    ],
  },
}
