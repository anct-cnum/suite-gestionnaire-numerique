import Alerte from '@/components/shared/Alerte/Alerte'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Alerte> = {
  argTypes: {
    type: {
      control: 'select',
      description: 'Variante DSFR (fr-alert--*)',
      options: ['info', 'success', 'warning', 'error'],
    },
  },
  component: Alerte,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Shared/Alerte',
}

export default meta
type Story = StoryObj<typeof Alerte>

export const Information: Story = {
  args: {
    children:
      'Les informations de ce lieu sont renseignées par les médiateurs dans la Coop numérique et reprises ici automatiquement. Pour les modifier, masquer ce lieu sur la carte ou le supprimer, passez par la Coop.',
    titre: 'Lieu géré dans la Coop numérique',
    type: 'info',
  },
}

export const Avertissement: Story = {
  args: {
    children: 'Vérifiez les informations avant de continuer.',
    titre: 'Attention',
    type: 'warning',
  },
}

export const Erreur: Story = {
  args: {
    children: 'La modification n’a pas pu être enregistrée.',
    titre: 'Erreur',
    type: 'error',
  },
}
