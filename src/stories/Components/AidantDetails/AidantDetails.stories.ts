import { createDefaultAidantDetailsData } from './AidantDetailsTestData'
import AidantDetails from '@/components/AidantDetails/AidantDetails'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetails> = {
  argTypes: {
    data: {
      description: 'Objet de données aidant avec toutes ses informations',
    },
  },
  component: AidantDetails,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/AidantDetails',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultAidantDetailsData(),
  },
}

export const SansStatistiques: Story = {
  args: {
    data: {
      ...createDefaultAidantDetailsData(),
      statistiquesActivites: undefined,
    },
  },
}

export const SansLieuxActivite: Story = {
  args: {
    data: {
      ...createDefaultAidantDetailsData(),
      lieuxActivite: [],
    },
  },
}

export const AvecPlusieursStructures: Story = {
  args: {
    data: {
      ...createDefaultAidantDetailsData(),
      structuresEmployeuses: [
        createDefaultAidantDetailsData().structuresEmployeuses[0],
        {
          ...createDefaultAidantDetailsData().structuresEmployeuses[0],
          nom: 'Centre Communal d\'Action Sociale',
          siret: '98765432109876',
          type: 'Établissement public',
        },
      ],
    },
  },
}
