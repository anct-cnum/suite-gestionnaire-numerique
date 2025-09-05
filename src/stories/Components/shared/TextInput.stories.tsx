import TextInput from '../../../components/shared/TextInput/TextInput'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof TextInput> = {
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'tel'],
    },
  },
  component: TextInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/TextInput',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Libellé du champ',
    id: 'text-input-1',
    name: 'exemple',
    placeholder: 'Saisir du texte...',
  },
}

export const Email: Story = {
  args: {
    children: 'Adresse email',
    id: 'email-input',
    name: 'email',
    placeholder: 'exemple@domaine.fr',
    type: 'email',
  },
}

export const Telephone: Story = {
  args: {
    children: 'Numéro de téléphone',
    id: 'tel-input',
    name: 'telephone',
    placeholder: '01 23 45 67 89',
    type: 'tel',
  },
}

export const Obligatoire: Story = {
  args: {
    children: 'Champ obligatoire',
    id: 'required-input',
    name: 'required',
    placeholder: 'Ce champ est obligatoire',
    required: true,
  },
}

export const Desactive: Story = {
  args: {
    children: 'Champ désactivé',
    defaultValue: 'Valeur pré-remplie',
    disabled: true,
    id: 'disabled-input',
    name: 'disabled',
  },
}

export const AvecErreur: Story = {
  args: {
    children: 'Champ avec erreur',
    erreur: {
      className: 'fr-input-group--error',
      content: (
        <p className="fr-error-text">
          Ce champ contient une erreur
        </p>
      ),
    },
    id: 'error-input',
    name: 'error',
  },
}

export const AvecValeurDefaut: Story = {
  args: {
    children: 'Champ avec valeur par défaut',
    defaultValue: 'Valeur pré-remplie',
    id: 'default-value-input',
    name: 'defaultValue',
  },
}

export const AvecPattern: Story = {
  args: {
    children: 'Code postal',
    id: 'pattern-input',
    name: 'pattern',
    pattern: '[0-9]{5}',
    placeholder: '75001',
  },
}