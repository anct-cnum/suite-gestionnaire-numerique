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
      'Ce lieu est aussi renseigné par ses médiateurs dans la Coop numérique. Vos modifications leur seront présentées, et ils pourront les reprendre.',
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
