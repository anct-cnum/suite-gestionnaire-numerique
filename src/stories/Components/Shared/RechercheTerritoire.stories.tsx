import { createDefaultTerritoiresTrouves } from './RechercheTerritoireTestData'
import RechercheTerritoire from '@/components/shared/Select/RechercheTerritoire'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof RechercheTerritoire> = {
  argTypes: {
    rechercher: {
      description: 'Fonction de recherche des territoires (régions, départements, intercommunalités)',
    },
  },
  component: RechercheTerritoire,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Shared/RechercheTerritoire',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    id: 'recherche-territoire',
    onSelectionner(): void {
      // rien à faire en story
    },
    async rechercher() {
      return Promise.resolve(createDefaultTerritoiresTrouves())
    },
  },
}

export const PerimetreLimite: Story = {
  args: {
    ...Default.args,
    perimetreLimite: true,
  },
}

export const AucunResultat: Story = {
  args: {
    ...Default.args,
    async rechercher() {
      return Promise.resolve({ territoires: [], total: 0 })
    },
  },
}

export const TropDeResultats: Story = {
  args: {
    ...Default.args,
    async rechercher() {
      return Promise.resolve(createDefaultTerritoiresTrouves({ total: 34 }))
    },
  },
}
