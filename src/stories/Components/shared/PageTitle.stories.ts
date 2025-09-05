import PageTitle from '../../../components/shared/PageTitle/PageTitle'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof PageTitle> = {
  component: PageTitle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/PageTitle',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Titre de la page',
  },
}

export const SansMargeHaute: Story = {
  args: {
    children: 'Titre sans marge haute',
    margin: '',
  },
}

export const AvecMargeCustom: Story = {
  args: {
    children: 'Titre avec marge personnalisée',
    margin: 'fr-mt-10w',
  },
}

export const TitreLong: Story = {
  args: {
    children: 'Ceci est un titre de page beaucoup plus long qui pourrait s\'étendre sur plusieurs lignes',
  },
}

export const TitreCourt: Story = {
  args: {
    children: 'Accueil',
  },
}