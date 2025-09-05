import SubmitButton from '../../../components/shared/SubmitButton/SubmitButton'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof SubmitButton> = {
  argTypes: {
    isDisabled: {
      control: 'boolean',
    },
  },
  component: SubmitButton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/SubmitButton',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Valider',
  },
}

export const Desactive: Story = {
  args: {
    children: 'Bouton désactivé',
    isDisabled: true,
  },
}

export const AvecClasse: Story = {
  args: {
    children: 'Bouton secondaire',
    className: 'fr-btn--secondary',
  },
}

export const AvecIcone: Story = {
  args: {
    children: 'Enregistrer',
    className: 'fr-btn--icon-left fr-icon-save-line',
  },
}

export const Danger: Story = {
  args: {
    children: 'Supprimer',
    className: 'fr-btn--secondary fr-btn--icon-left fr-icon-delete-line',
  },
}

export const AvecTitle: Story = {
  args: {
    children: 'Confirmer',
    title: 'Confirmer l\'action et valider le formulaire',
  },
}