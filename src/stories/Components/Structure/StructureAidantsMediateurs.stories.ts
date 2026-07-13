import { createDefaultStructureViewModel, createStructureViewModelWithMinimalData } from './StructureTestData'
import StructureAidantsMediateurs from '@/components/Structure/StructureAidantsMediateurs'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureAidantsMediateurs> = {
  argTypes: {
    aidantsEtMediateurs: {
      description: 'Informations sur les aidants et médiateurs de la structure',
    },
  },
  component: StructureAidantsMediateurs,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureAidantsMediateurs',
}

export default meta
type Story = StoryObj

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    aidantsEtMediateurs: defaultViewModel.aidantsEtMediateurs,
  },
}

export const SansAidants: Story = {
  args: {
    aidantsEtMediateurs: createStructureViewModelWithMinimalData().aidantsEtMediateurs,
  },
}

export const AvecUnSeulAidant: Story = {
  args: {
    aidantsEtMediateurs: {
      ...defaultViewModel.aidantsEtMediateurs,
      liste: [defaultViewModel.aidantsEtMediateurs.liste[0]],
      totalAidant: 1,
      totalCoordinateur: 0,
      totalMediateur: 0,
    },
  },
}

export const AvecBeaucoupDAidants: Story = {
  args: {
    aidantsEtMediateurs: {
      liste: [
        ...defaultViewModel.aidantsEtMediateurs.liste,
        {
          fonction: 'Médiateur numérique',
          id: 4,
          labelisations: ['conseiller numérique'],
          lienFiche: '/aidants-et-mediateurs/4',
          nom: 'Alice Bernard',
        },
        {
          fonction: 'Aidant numérique',
          id: 5,
          labelisations: [],
          lienFiche: '/aidants-et-mediateurs/5',
          nom: 'Thomas Rousseau',
        },
        {
          fonction: 'Coordinateur',
          id: 6,
          labelisations: ['conseiller numérique'],
          lienFiche: '/aidants-et-mediateurs/6',
          nom: 'Julie Lambert',
        },
        {
          fonction: 'Médiateur numérique',
          id: 7,
          labelisations: ['aidants connect'],
          lienFiche: '/aidants-et-mediateurs/7',
          nom: 'Nicolas Petit',
        },
      ],
      totalAidant: 15,
      totalCoordinateur: 4,
      totalMediateur: 12,
    },
  },
}

export const AvecTotauxEleves: Story = {
  args: {
    aidantsEtMediateurs: {
      ...defaultViewModel.aidantsEtMediateurs,
      totalAidant: 45,
      totalCoordinateur: 12,
      totalMediateur: 28,
    },
  },
}
